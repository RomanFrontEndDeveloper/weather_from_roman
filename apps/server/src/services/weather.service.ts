import {
  geocodingResponseSchema,
  forecastResponseSchema,
} from "../schemas/weather.schema.js";

import redisClient from "../config/redis.js";

// HTTP-статуси, для яких є сенс повторити запит.
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

// Час життя кешу — 10 хвилин.
const CACHE_TTL = 600;

// Повторний запит із поступовим збільшенням паузи.
async function fetchWithRetry(url: URL, maxAttempts = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(url);

    if (
      response.ok ||
      !RETRYABLE_STATUS_CODES.includes(response.status) ||
      attempt === maxAttempts
    ) {
      return response;
    }

    const delay = 1000 * 2 ** (attempt - 1);

    console.warn(
      `Weather API returned ${response.status}. ` +
        `Retrying in ${delay}ms (${attempt}/${maxAttempts})`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("FORECAST_API_ERROR");
}

export async function getWeatherByCity(city: string) {
  // 1. Створюємо ключ кешу.
  const cacheKey = `weather:${city.trim().toLowerCase()}`;

  // 2. Перевіряємо Redis.
  // Перевіряємо кеш, якщо Redis готовий.
  if (redisClient.isReady) {
    try {
      const cachedWeather = await redisClient.get(cacheKey);

      if (cachedWeather) {
        console.log(`Cache HIT: ${cacheKey}`);

        return JSON.parse(cachedWeather);
      }

      console.log(`Cache MISS: ${cacheKey}`);
    } catch (error) {
      console.warn("Redis GET failed. Continuing without cache:", error);
    }
  } else {
    console.warn("Redis is unavailable. Skipping cache.");
  }

  // 3. Якщо кешу немає — звертаємося до Open-Meteo.

  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );

  geocodingUrl.searchParams.set("name", city);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const geocodingResponse = await fetch(geocodingUrl);

  if (!geocodingResponse.ok) {
    throw new Error("GEOCODING_API_ERROR");
  }

  const geocodingData = geocodingResponseSchema.parse(
    await geocodingResponse.json(),
  );

  const location = geocodingData.results?.[0];

  if (!location) {
    throw new Error("CITY_NOT_FOUND");
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");

  forecastUrl.searchParams.set("latitude", String(location.latitude));
  forecastUrl.searchParams.set("longitude", String(location.longitude));
  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );

  const forecastResponse = await fetchWithRetry(forecastUrl);

  if (!forecastResponse.ok) {
    throw new Error("FORECAST_API_ERROR");
  }

  const forecastData = forecastResponseSchema.parse(
    await forecastResponse.json(),
  );

  // 4. Формуємо результат.
  const weather = {
    city: location.name,
    country: location.country,
    temperature: forecastData.current.temperature_2m,
    humidity: forecastData.current.relative_humidity_2m,
    windSpeed: forecastData.current.wind_speed_10m,
    weatherCode: forecastData.current.weather_code,
  };

  // 5. Зберігаємо результат у Redis на 10 хвилин.
  // Зберігаємо погоду в кеші, якщо Redis доступний.
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

  // 6. Повертаємо погодні дані.
  return weather;
}
