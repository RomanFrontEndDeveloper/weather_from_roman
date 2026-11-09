import express from "express";
import cors from "cors";

import weatherRouter from "./routes/weather.routes.js";
import { connectRedis } from "./config/redis.js";

import "./workers/weather.worker.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", weatherRouter);

// Server startup
const startServer = async (): Promise<void> => {
  try {
    await connectRedis();
    console.log("Redis connected successfully");
  } catch (error) {
    console.warn("Redis unavailable. Starting without cache:", error);
  }

  const server = app.listen(PORT, () => {
    console.log(`WeatherPulse API running on port ${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Failed to start WeatherPulse API:", error);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error("Unexpected server startup error:", error);
  process.exit(1);
});
