import { Router } from "express";
import { getWeatherByCity } from "../services/weather.service.js";

import { prisma } from "../prisma.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "WeatherPulse API is running",
  });
});

router.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (typeof city !== "string" || !city.trim()) {
    res.status(400).json({
      message: "City name is required",
    });
    return;
  }

  try {
    const weather = await getWeatherByCity(city.trim());

    await prisma.weather_searches.create({
      data: {
        city: weather.city,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      },
    });

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

router.get("/history", async (_req, res) => {
  try {
    const history = await prisma.weather_searches.findMany({
      orderBy: {
        searched_at: "desc",
      },
    });

    res.status(200).json(
      history.map((record) => ({
        ...record,
        temperature:
          record.temperature === null ? null : Number(record.temperature),
        windSpeed: record.windSpeed === null ? null : Number(record.windSpeed),
      })),
    );
  } catch (error) {
    console.error("Failed to fetch search history:", error);

    res.status(500).json({
      message: "Failed to fetch search history",
    });
  }
});

router.delete("/history/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      message: "Invalid history record ID",
    });
    return;
  }

  try {
    const deletedRecord = await prisma.weather_searches.deleteMany({
      where: {
        id,
      },
    });

    if (deletedRecord.count === 0) {
      res.status(404).json({
        message: "History record not found",
      });
      return;
    }

    res.status(200).json({
      message: "History record deleted",
      id,
    });
  } catch (error) {
    console.error("Failed to delete history record:", error);

    res.status(500).json({
      message: "Failed to delete history record",
    });
  }
});

export default router;
