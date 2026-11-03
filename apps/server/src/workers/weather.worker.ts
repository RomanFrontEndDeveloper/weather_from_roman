import { Worker } from "bullmq";

import queueRedis from "../config/queue.redis.js";

import { prisma } from "../prisma.js";

import type { WeatherHistoryJobData } from "../queues/weather.queue.js";

export const weatherWorker = new Worker<WeatherHistoryJobData>(
  "weather-history",

  async (job) => {
    console.log(`Processing job: ${job.id}`);

    const { city, temperature, humidity, windSpeed, searchedAt } = job.data;

    await prisma.weatherSearch.create({
      data: {
        city,
        temperature,
        humidity,
        windSpeed,
        searched_at: new Date(searchedAt),
      },
    });

    console.log(`Weather history saved: ${city}`);
  },

  {
    connection: queueRedis,
  },
);

weatherWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

weatherWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});
