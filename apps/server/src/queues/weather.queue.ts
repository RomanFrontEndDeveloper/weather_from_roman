import { Queue } from "bullmq";
import queueRedis from "../config/queue.redis.js";

// Дані, які передаватимемо у фонову задачу.
export interface WeatherHistoryJobData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  searchedAt: string;
}

// Створюємо чергу для історії пошуку погоди.
export const weatherQueue = new Queue<WeatherHistoryJobData>(
  "weather-history",
  {
    connection: queueRedis,
  },
);
