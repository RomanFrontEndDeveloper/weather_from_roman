import { Router } from "express";

import { getWeatherByCity } from "../services/weather.service.js";
import { prisma } from "../prisma.js";

const router = Router();

// ============================================
// 1. LIVENESS CHECK
// ============================================
// Перевіряє, чи працює Express API.
// Використовується UptimeRobot та Render.

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "WeatherPulse API is running",
  });
});

// ============================================
// 2. READINESS CHECK
// ============================================
// Перевіряє, чи готовий сервер обробляти запити.
// Наразі перевіряємо підключення PostgreSQL.

router.get("/health/ready", async (_req, res) => {
  let database = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  const isReady = database;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not ready",
    checks: {
      database,
    },
  });
});

// ============================================
// 3. GET WEATHER
// ============================================
// Отримання поточної погоди за назвою міста.

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

// ============================================
// 4. GET SEARCH HISTORY
// ============================================
// Отримання історії пошуку погоди з PostgreSQL.

router.get("/history", async (_req, res) => {
  try {
    const history = await prisma.weatherSearch.findMany({
      orderBy: {
        searched_at: "desc",
      },
    });

    const formattedHistory = history.map((record) => ({
      ...record,
      temperature:
        record.temperature === null ? null : Number(record.temperature),
      windSpeed: record.windSpeed === null ? null : Number(record.windSpeed),
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Failed to fetch search history:", error);

    res.status(500).json({
      message: "Failed to fetch search history",
    });
  }
});

// ============================================
// 5. DELETE HISTORY RECORD
// ============================================
// Видалення запису з історії пошуку.

router.delete("/history/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      message: "Invalid history record ID",
    });
    return;
  }

  try {
    const deletedRecord = await prisma.weatherSearch.deleteMany({
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

// ============================================
// EXPORT ROUTER
// ============================================

export default router;
