
import { Redis } from "ioredis";

const queueRedis = new Redis(
  process.env.REDIS_URL!,
  {
    maxRetriesPerRequest: null,
  },
);

queueRedis.on("connect", () => {
  console.log("BullMQ Redis connected");
});

queueRedis.on("error", (error: Error) => {
  console.error("BullMQ Redis error:", error);
});

export default queueRedis;
