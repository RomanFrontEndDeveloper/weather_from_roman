import express from "express";
import cors from "cors";

import weatherRouter from "./routes/weather.routes.js";
import { connectRedis } from "./config/redis.js";

import "./workers/weather.worker.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", weatherRouter);

const startServer = () => {
  connectRedis().catch((error) => {
    console.warn("Redis unavailable. Starting without cache:", error);
  });

  app.listen(PORT, () => {
    console.log(`WeatherPulse API running on port ${PORT}`);
  });
};

startServer();
