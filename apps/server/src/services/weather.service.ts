import {
  geocodingResponseSchema,
  forecastResponseSchema,
} from "../schemas/weather.schema.js";

export async function getWeatherByCity(city: string) {
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

  const forecastResponse = await fetch(forecastUrl);

  if (!forecastResponse.ok) {
    throw new Error("FORECAST_API_ERROR");
  }

  const forecastData = forecastResponseSchema.parse(
    await forecastResponse.json(),
  );

  return {
    city: location.name,
    country: location.country,
    temperature: forecastData.current.temperature_2m,
    humidity: forecastData.current.relative_humidity_2m,
    windSpeed: forecastData.current.wind_speed_10m,
    weatherCode: forecastData.current.weather_code,
  };
}
