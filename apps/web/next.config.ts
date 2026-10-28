import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;

// next.config.ts — файл налаштувань Next.js. У нашому WeatherPulse він указує
// Turbopack кореневу папку монорепозиторію, щоб збирач правильно працював зі
// структурою проєкту.