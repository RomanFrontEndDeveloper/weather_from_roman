import {
  geocodingResponseSchema,
  forecastResponseSchema,
} from "../schemas/weather.schema.js";

import redisClient from "../config/redis.js";

import { weatherQueue } from "../queues/weather.queue.js";
import type { WeatherHistoryJobData } from "../queues/weather.queue.js";

// HTTP-статуси, для яких повторюємо запит.
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

// Налаштування.
const CACHE_TTL = 600;
const REQUEST_TIMEOUT = 10_000;
const MAX_ATTEMPTS = 3;

// Затримка між повторними спробами.
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Визначення затримки перед наступним запитом.
function getRetryDelay(retryAfter: string | null, attempt: number): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, 10_000);
    }

    const date = Date.parse(retryAfter);

    if (Number.isFinite(date)) {
      return Math.min(Math.max(0, date - Date.now()), 10_000);
    }
  }

  return 1000 * 2 ** (attempt - 1);
}

// Універсальний fetch із тайм-аутом та повторними спробами.
async function fetchWithRetry(
  url: URL,
  serviceName: string,
  maxAttempts = MAX_ATTEMPTS,
): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`${serviceName}: request attempt ${attempt}/${maxAttempts}`);

      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        console.log(`${serviceName}: request successful`);
        return response;
      }

      const responseBody = await response.text();

      console.error(`${serviceName}: HTTP error`, {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseBody.slice(0, 1000),
        attempt,
      });

      if (
        !RETRYABLE_STATUS_CODES.includes(response.status) ||
        attempt === maxAttempts
      ) {
        throw new Error(`${serviceName}_API_ERROR_HTTP_${response.status}`);
      }

      const delay = getRetryDelay(response.headers.get("retry-after"), attempt);

      console.warn(`${serviceName}: retry in ${delay}ms`);

      await sleep(delay);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("_API_ERROR_HTTP_")
      ) {
        throw error;
      }

      const isLastAttempt = attempt === maxAttempts;

      console.error(`${serviceName}: network error`, {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "UnknownError",
        attempt,
      });

      if (isLastAttempt) {
        throw new Error(`${serviceName}_API_UNAVAILABLE`, { cause: error });
      }

      const delay = 1000 * 2 ** (attempt - 1);

      console.warn(`${serviceName}: retry in ${delay}ms`);

      await sleep(delay);
    }
  }

  throw new Error(`${serviceName}_API_UNAVAILABLE`);
}

// Додавання задачі збереження історії через BullMQ.
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

// Основна функція отримання погоди.
export async function getWeatherByCity(city: string) {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    throw new Error("CITY_NOT_FOUND");
  }

  const cacheKey = `weather:${normalizedCity.toLowerCase()}`;

  // 1. Перевіряємо Redis.
  if (redisClient.isReady) {
    try {
      const cachedWeather = await redisClient.get(cacheKey);

      if (cachedWeather) {
        console.log(`Cache HIT: ${cacheKey}`);

        const weather = JSON.parse(cachedWeather) as Omit<
          WeatherHistoryJobData,
          "searchedAt"
        >;

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

  // 2. Отримуємо координати міста.
  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );

  geocodingUrl.searchParams.set("name", normalizedCity);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  console.log(`Geocoding city: ${normalizedCity}`);

  const geocodingResponse = await fetchWithRetry(geocodingUrl, "GEOCODING");

  const geocodingData = geocodingResponseSchema.parse(
    await geocodingResponse.json(),
  );

  const location = geocodingData.results?.[0];

  if (!location) {
    throw new Error("CITY_NOT_FOUND");
  }

  console.log(`Location found: ${location.name}, ${location.country}`);

  // 3. Отримуємо прогноз погоди.
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");

  forecastUrl.searchParams.set("latitude", String(location.latitude));

  forecastUrl.searchParams.set("longitude", String(location.longitude));

  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );

  const forecastResponse = await fetchWithRetry(forecastUrl, "FORECAST");

  const forecastData = forecastResponseSchema.parse(
    await forecastResponse.json(),
  );

  // 4. Формуємо погодні дані.
  const weather = {
    city: location.name,
    country: location.country,
    temperature: forecastData.current.temperature_2m,
    humidity: forecastData.current.relative_humidity_2m,
    windSpeed: forecastData.current.wind_speed_10m,
    weatherCode: forecastData.current.weather_code,
  };

  // 5. Зберігаємо погоду в Redis на 10 хвилин.
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

  // 6. Передаємо збереження історії у BullMQ.
  await addWeatherHistoryJob(weather, new Date().toISOString());

  // 7. Повертаємо результат.
  console.log(`Weather successfully retrieved: ${location.name}`);

  return weather;
}
