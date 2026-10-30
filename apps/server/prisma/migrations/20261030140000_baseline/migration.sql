CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "weather_searches" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    "city" TEXT NOT NULL,
    "temperature" DECIMAL(5,2),
    "searched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "humidity" INTEGER,
    "windSpeed" DECIMAL(6,2),

    CONSTRAINT "weather_searches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_weather_searches_searched_at"
ON "weather_searches"("searched_at" DESC);
