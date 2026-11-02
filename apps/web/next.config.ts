import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://localhost:5000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

// next.config.ts — файл налаштувань Next.js. У нашому WeatherPulse він указує
// Turbopack кореневу папку монорепозиторію, щоб збирач правильно працював зі
// структурою проєкту.
