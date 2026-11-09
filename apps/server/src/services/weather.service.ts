import { z } from "zod";

import {
  geocodingResponseSchema,
  forecastResponseSchema,
} from "../schemas/weather.schema.js";

import redisClient from "../config/redis.js";

import { weatherQueue } from "../queues/weather.queue.js";
import type { WeatherHistoryJobData } from "../queues/weather.queue.js";

// ============================================
// CONFIGURATION
// ============================================

const CACHE_TTL = 600;
const REQUEST_TIMEOUT = 10_000;

const MAX_OPEN_METEO_ATTEMPTS = 2;

const RETRYABLE_STATUS_CODES = [500, 502, 503, 504];

// ============================================
// TYPES
// ============================================

type WeatherResult = {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

type OpenMeteoLocation = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

// ============================================
// WEATHERAPI RESPONSE VALIDATION
// ============================================

const weatherApiResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    country: z.string(),
  }),

  current: z.object({
    temp_c: z.number(),
    humidity: z.number(),
    wind_kph: z.number(),

    condition: z.object({
      text: z.string(),
      code: z.number(),
    }),
  }),
});

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ============================================
// WEATHER CODE NORMALIZATION
// ============================================

// WeatherAPI uses its own condition codes.
// Convert them into WMO codes used by the frontend.

const WEATHERAPI_TO_WMO: Record<number, number> = {
  1000: 0,
  1003: 2,
  1006: 3,
  1009: 3,

  1030: 45,
  1063: 61,
  1066: 71,
  1069: 66,
  1072: 56,
  1087: 95,

  1114: 75,
  1117: 75,
  1135: 45,
  1147: 48,

  1150: 51,
  1153: 51,
  1168: 56,
  1171: 57,

  1180: 61,
  1183: 61,
  1186: 63,
  1189: 63,
  1192: 65,
  1195: 65,

  1198: 66,
  1201: 67,
  1204: 66,
  1207: 67,

  1210: 71,
  1213: 71,
  1216: 73,
  1219: 73,
  1222: 75,
  1225: 75,

  1237: 77,

  1240: 80,
  1243: 81,
  1246: 82,

  1249: 85,
  1252: 86,
  1255: 85,
  1258: 86,
  1261: 85,
  1264: 86,

  1273: 95,
  1276: 95,
  1279: 95,
  1282: 95,
};

function normalizeWeatherCode(code: number): number {
  return WEATHERAPI_TO_WMO[code] ?? 3;
}

// ============================================
// WEATHER HISTORY QUEUE
// ============================================

async function addWeatherHistoryJob(
  weather: Omit<WeatherHistoryJobData, "searchedAt">,
  searchedAt: string,
): Promise<void> {
  try {
    await weatherQueue.add("save-weather-history", {
      ...weather,
      searchedAt,
    });

    console.log("Weather history job added successfully");
  } catch (error) {
    console.error("Failed to add weather history job:", error);
  }
}

// ============================================
// OPEN-METEO GEOCODING
// ============================================

async function getOpenMeteoLocation(city: string): Promise<OpenMeteoLocation> {
  console.log(`OPEN-METEO: geocoding ${city}`);

  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );

  geocodingUrl.searchParams.set("name", city);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const response = await fetch(geocodingUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("OPEN_METEO_GEOCODING_RATE_LIMIT");
    }

    throw new Error(`GEOCODING_HTTP_${response.status}`);
  }

  const data = geocodingResponseSchema.parse(await response.json());

  const location = data.results?.[0];

  if (!location) {
    throw new Error("CITY_NOT_FOUND");
  }

  console.log(
    `OPEN-METEO: location found ${location.name}, ${location.country}`,
  );

  return {
    name: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

// ============================================
// OPEN-METEO RETRY
// ============================================

async function fetchOpenMeteoWithRetry(url: URL): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_OPEN_METEO_ATTEMPTS; attempt++) {
    let response: Response;

    try {
      console.log(
        `OPEN-METEO: request attempt ${attempt}/${MAX_OPEN_METEO_ATTEMPTS}`,
      );

      response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
    } catch (error) {
      if (attempt === MAX_OPEN_METEO_ATTEMPTS) {
        throw error;
      }

      console.warn("OPEN-METEO network error. Retrying:", error);

      await sleep(1000 * attempt);
      continue;
    }

    if (response.ok) {
      console.log("OPEN-METEO: request successful");
      return response;
    }

    const responseBody = await response.text();

    console.error("OPEN-METEO HTTP error:", {
      status: response.status,
      responseBody: responseBody.slice(0, 500),
      attempt,
    });

    // A daily quota cannot be fixed by retrying.
    if (response.status === 429) {
      throw new Error("OPEN_METEO_RATE_LIMIT");
    }

    if (
      !RETRYABLE_STATUS_CODES.includes(response.status) ||
      attempt === MAX_OPEN_METEO_ATTEMPTS
    ) {
      throw new Error(`OPEN_METEO_HTTP_${response.status}`);
    }

    await sleep(1000 * attempt);
  }

  throw new Error("OPEN_METEO_REQUEST_FAILED");
}

// ============================================
// PRIMARY PROVIDER: OPEN-METEO
// ============================================

async function getWeatherFromOpenMeteo(
  location: OpenMeteoLocation,
): Promise<WeatherResult> {
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");

  forecastUrl.searchParams.set("latitude", String(location.latitude));

  forecastUrl.searchParams.set("longitude", String(location.longitude));

  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );

  const response = await fetchOpenMeteoWithRetry(forecastUrl);

  const data = forecastResponseSchema.parse(await response.json());

  console.log("OPEN-METEO: weather received successfully");

  return {
    city: location.name,
    country: location.country,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
  };
}

// ============================================
// FALLBACK PROVIDER: WEATHERAPI.COM
// ============================================

async function getWeatherFromWeatherApi(
  city: string,
  location?: OpenMeteoLocation,
): Promise<WeatherResult> {
  const apiKey = process.env.WEATHERAPI_KEY;

  if (!apiKey) {
    throw new Error("WEATHERAPI_KEY_MISSING");
  }

  console.log(`WEATHERAPI: requesting weather for ${city}`);

  const weatherUrl = new URL("https://api.weatherapi.com/v1/current.json");

  weatherUrl.searchParams.set("key", apiKey);

  // IMPORTANT:
  // Prefer coordinates obtained from Open-Meteo.
  // This avoids city-name lookup problems in WeatherAPI.
  const query = location ? `${location.latitude},${location.longitude}` : city;

  weatherUrl.searchParams.set("q", query);
  weatherUrl.searchParams.set("aqi", "no");

  const response = await fetch(weatherUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  const responseData: unknown = await response.json();

  if (!response.ok) {
    // WeatherAPI error code 1006 means location not found.
    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData &&
      typeof responseData.error === "object" &&
      responseData.error !== null &&
      "code" in responseData.error &&
      responseData.error.code === 1006
    ) {
      throw new Error("CITY_NOT_FOUND");
    }

    console.error("WEATHERAPI HTTP error:", {
      status: response.status,
      responseData,
    });

    throw new Error(`WEATHERAPI_HTTP_${response.status}`);
  }

  const parsedData = weatherApiResponseSchema.safeParse(responseData);

  if (!parsedData.success) {
    console.error(
      "WEATHERAPI response validation failed:",
      parsedData.error.flatten(),
    );

    throw new Error("WEATHERAPI_INVALID_RESPONSE");
  }

  const data = parsedData.data;

  console.log(
    `WEATHERAPI: weather received for ${data.location.name}, ${data.location.country}`,
  );

  return {
    city: data.location.name,
    country: data.location.country,
    temperature: data.current.temp_c,
    humidity: data.current.humidity,
    windSpeed: data.current.wind_kph,
    weatherCode: normalizeWeatherCode(data.current.condition.code),
  };
}

// ============================================
// MAIN WEATHER SERVICE
// ============================================

export async function getWeatherByCity(city: string): Promise<WeatherResult> {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    throw new Error("CITY_NOT_FOUND");
  }

  const cacheKey = `weather:${normalizedCity.toLowerCase()}`;

  // ------------------------------------------
  // 1. REDIS CACHE
  // ------------------------------------------

  if (redisClient.isReady) {
    try {
      const cachedWeather = await redisClient.get(cacheKey);

      if (cachedWeather) {
        console.log(`Cache HIT: ${cacheKey}`);

        const weather = JSON.parse(cachedWeather) as WeatherResult;

        await addWeatherHistoryJob(weather, new Date().toISOString());

        return weather;
      }

      console.log(`Cache MISS: ${cacheKey}`);
    } catch (error) {
      console.warn("Redis GET failed. Continuing without cache:", error);
    }
  } else {
    console.warn("Redis unavailable. Skipping cache.");
  }

  // ------------------------------------------
  // 2. GEOCODING
  // ------------------------------------------

  let location: OpenMeteoLocation | undefined;

  try {
    location = await getOpenMeteoLocation(normalizedCity);
  } catch (error) {
    console.warn("OPEN-METEO geocoding failed:", error);
  }

  // ------------------------------------------
  // 3. PRIMARY PROVIDER: OPEN-METEO
  // ------------------------------------------

  let weather: WeatherResult;

  try {
    if (!location) {
      throw new Error("OPEN_METEO_LOCATION_UNAVAILABLE");
    }

    weather = await getWeatherFromOpenMeteo(location);

    console.log("Weather provider: Open-Meteo");
  } catch (primaryError) {
    console.warn(
      "Open-Meteo failed. Switching to fallback provider:",
      primaryError,
    );

    // ----------------------------------------
    // 4. FALLBACK PROVIDER: WEATHERAPI
    // ----------------------------------------

    try {
      weather = await getWeatherFromWeatherApi(normalizedCity, location);

      console.log("Weather provider: WeatherAPI");
    } catch (fallbackError) {
      console.error("Both weather providers failed:", {
        primaryError,
        fallbackError,
      });

      if (
        primaryError instanceof Error &&
        fallbackError instanceof Error &&
        primaryError.message === "CITY_NOT_FOUND" &&
        fallbackError.message === "CITY_NOT_FOUND"
      ) {
        throw new Error("CITY_NOT_FOUND");
      }

      throw new Error("WEATHER_PROVIDERS_UNAVAILABLE");
    }
  }

  // ------------------------------------------
  // 5. SAVE SUCCESSFUL RESULT TO REDIS
  // ------------------------------------------

  if (redisClient.isReady) {
    try {
      await redisClient.set(cacheKey, JSON.stringify(weather), {
        EX: CACHE_TTL,
      });

      console.log(`Cache SET: ${cacheKey}`);
    } catch (error) {
      console.warn("Redis SET failed:", error);
    }
  }

  // ------------------------------------------
  // 6. SAVE SEARCH HISTORY THROUGH BULLMQ
  // ------------------------------------------

  await addWeatherHistoryJob(weather, new Date().toISOString());

  // ------------------------------------------
  // 7. RETURN WEATHER
  // ------------------------------------------

  return weather;
}
