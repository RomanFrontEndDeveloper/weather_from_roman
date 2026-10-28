import express from "express";
import cors from "cors";
import { getWeatherByCity } from "./services/weather.service.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "WeatherPulse API is running",
  });
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (typeof city !== "string" || !city.trim()) {
    res.status(400).json({
      message: "City name is required",
    });
    return;
  }

  try {
    const weather = await getWeatherByCity(city.trim());

    res.status(200).json(weather);
  } catch (error) {
    if (error instanceof Error && error.message === "CITY_NOT_FOUND") {
      res.status(404).json({
        message: "City not found",
      });
      return;
    }

    console.error("Weather API error:", error);

    res.status(502).json({
      message: "Weather service is temporarily unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`WeatherPulse API running at http://localhost:${PORT}`);
});
