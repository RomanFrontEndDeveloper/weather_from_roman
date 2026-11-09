
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,

  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error("Redis reconnect limit reached");
      }

      return Math.min(retries * 500, 3000);
    },
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();

  console.log("Redis connected successfully");
};

export default redisClient;
