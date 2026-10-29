import express from "express";
import cors from "cors";
import { getWeatherByCity } from "./services/weather.service.js";
import { pool } from "./db.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/history", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        city,
        temperature,
        humidity,
        "windSpeed",
        searched_at
      FROM weather_searches
      ORDER BY searched_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch search history:", error);

    res.status(500).json({
      message: "Failed to fetch search history",
    });
  }
});

app.delete("/api/history/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      message: "Invalid history record ID",
    });
    return;
  }

  try {
    const result = await pool.query(
      "DELETE FROM weather_searches WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: "History record not found",
      });
      return;
    }

    res.status(200).json({
      message: "History record deleted",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete history record:", error);

    res.status(500).json({
      message: "Failed to delete history record",
    });
  }
});

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

    await pool.query(
      `INSERT INTO weather_searches
    (city, temperature, humidity, "windSpeed")
   VALUES ($1, $2, $3, $4)`,
      [weather.city, weather.temperature, weather.humidity, weather.windSpeed],
    );

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
