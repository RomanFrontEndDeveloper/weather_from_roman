import { z } from "zod";

export const geocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

export const forecastResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    weather_code: z.number(),
  }),
});
