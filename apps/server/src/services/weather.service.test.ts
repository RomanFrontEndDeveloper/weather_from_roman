import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Створюємо mock-залежності.
const { redisMock, weatherQueueMock } = vi.hoisted(() => ({
  redisMock: {
    isReady: false,
    get: vi.fn(),
    set: vi.fn(),
  },
  weatherQueueMock: {
    add: vi.fn().mockResolvedValue({}),
  },
}));

// Підміняємо Redis.
vi.mock("../config/redis.js", () => ({
  default: redisMock,
}));

// Підміняємо BullMQ.
vi.mock("../queues/weather.queue.js", () => ({
  weatherQueue: weatherQueueMock,
}));

// Імпортуємо справжній сервіс.
import { getWeatherByCity } from "./weather.service.js";

// Допоміжна функція для створення тестової HTTP-відповіді.
function mockResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

describe("getWeatherByCity", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("повинен успішно отримувати погоду для міста", async () => {
    const fetchMock = vi.mocked(fetch);

    // Перша відповідь — Geocoding API.
    fetchMock
      .mockResolvedValueOnce(
        mockResponse({
          results: [
            {
              name: "Kyiv",
              country: "Ukraine",
              latitude: 50.45,
              longitude: 30.52,
            },
          ],
        }),
      )

      // Друга відповідь — Forecast API.
      .mockResolvedValueOnce(
        mockResponse({
          current: {
            temperature_2m: 12,
            relative_humidity_2m: 75,
            wind_speed_10m: 8,
            weather_code: 3,
          },
        }),
      );

    // Викликаємо справжню функцію сервісу.
    const result = await getWeatherByCity("Kyiv");

    // Перевіряємо отриманий результат.
    expect(result).toEqual({
      city: "Kyiv",
      country: "Ukraine",
      temperature: 12,
      humidity: 75,
      windSpeed: 8,
      weatherCode: 3,
    });

    // Перевіряємо два HTTP-запити.
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Перевіряємо додавання задачі в BullMQ.
    expect(weatherQueueMock.add).toHaveBeenCalledTimes(1);

    expect(weatherQueueMock.add).toHaveBeenCalledWith(
      "save-weather-history",
      expect.objectContaining({
        city: "Kyiv",
        country: "Ukraine",
        temperature: 12,
        humidity: 75,
        windSpeed: 8,
        weatherCode: 3,
      }),
    );
  });

  it("повинен повертати CITY_NOT_FOUND, якщо місто не знайдено", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      mockResponse({
        results: [],
      }),
    );

    await expect(getWeatherByCity("UnknownCity")).rejects.toThrow(
      "CITY_NOT_FOUND",
    );

    // Forecast API не повинен викликатися.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Задача історії не повинна додаватися.
    expect(weatherQueueMock.add).not.toHaveBeenCalled();
  });

  it("повинен обробляти помилку Geocoding API", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(getWeatherByCity("Kyiv")).rejects.toThrow(
      "GEOCODING_API_ERROR",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(weatherQueueMock.add).not.toHaveBeenCalled();
  });

  it("повинен обробляти помилку Forecast API", async () => {
    const fetchMock = vi.mocked(fetch);

    // Geocoding успішний.
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        results: [
          {
            name: "Kyiv",
            country: "Ukraine",
            latitude: 50.45,
            longitude: 30.52,
          },
        ],
      }),
    );

    // Forecast повертає помилку.
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    } as Response);

    await expect(getWeatherByCity("Kyiv")).rejects.toThrow(
      "FORECAST_API_ERROR",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(weatherQueueMock.add).not.toHaveBeenCalled();
  });
});
