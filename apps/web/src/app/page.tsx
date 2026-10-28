"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Weather = {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

function getWeatherDescription(code: number) {
  if (code === 0) {
    return { description: "Clear sky", icon: "☀️" };
  }

  if ([1, 2].includes(code)) {
    return { description: "Partly cloudy", icon: "🌤️" };
  }

  if (code === 3) {
    return { description: "Overcast", icon: "☁️" };
  }

  if ([45, 48].includes(code)) {
    return { description: "Foggy", icon: "🌫️" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { description: "Drizzle", icon: "🌦️" };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { description: "Rainy", icon: "🌧️" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { description: "Snowy", icon: "❄️" };
  }

  if ([95, 96, 99].includes(code)) {
    return { description: "Thunderstorm", icon: "⛈️" };
  }

  return { description: "Variable conditions", icon: "🌡️" };
}

export default function Home() {
  const [city, setCity] = useState("Khmelnytskyi");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/weather?city=${encodeURIComponent(trimmedCity)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch weather");
      }

      setWeather(data as Weather);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const weatherInfo = weather
    ? getWeatherDescription(weather.weatherCode)
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link className={styles.logo} href="/">
            <span className={styles.logoIcon}>W</span>
            WeatherPulse
          </Link>
          <span className={styles.headerLabel}>LIVE WEATHER</span>
        </header>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>YOUR WEATHER, AT A GLANCE</p>
          <h1>
            Every day,
            <br />
            <span>in focus.</span>
          </h1>
          <p className={styles.subtitle}>
            Discover current weather conditions in any city around the world.
          </p>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <input
              className={styles.input}
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search for a city..."
              aria-label="City name"
              required
            />
            <button
              className={styles.searchButton}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Searching...
                </>
              ) : (
                <>
                  Search <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </section>

        {weather ? (
          <section className={styles.weatherCard} aria-live="polite">
            <div className={styles.weatherTop}>
              <div>
                <p className={styles.cardLabel}>CURRENT WEATHER</p>
                <h2 className={styles.city}>{weather.city}</h2>
                <p className={styles.country}>{weather.country}</p>
              </div>
              <div className={styles.weatherIcon} aria-hidden="true">
                {weatherInfo?.icon}
              </div>
            </div>

            <div className={styles.temperatureRow}>
              <span className={styles.temperature}>
                {weather.temperature.toFixed(1)}°
              </span>
              <span className={styles.celsius}>C</span>
            </div>

            <p className={styles.condition}>{weatherInfo?.description}</p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statIcon} aria-hidden="true">
                  ◉
                </span>
                <span className={styles.statLabel}>Humidity</span>
                <strong>{weather.humidity}%</strong>
              </div>

              <div className={styles.stat}>
                <span className={styles.statIcon} aria-hidden="true">
                  ↗
                </span>
                <span className={styles.statLabel}>Wind speed</span>
                <strong>{weather.windSpeed} km/h</strong>
              </div>
            </div>
          </section>
        ) : (
          <section className={styles.emptyCard}>
            <span className={styles.emptyIcon} aria-hidden="true">
              ☁
            </span>
            <div>
              <h2>Your weather starts here</h2>
              <p>Search for a city to see its current conditions.</p>
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>WeatherPulse</span>
          <span>Weather data powered by Open-Meteo</span>
        </footer>
      </div>
    </main>
  );
}
