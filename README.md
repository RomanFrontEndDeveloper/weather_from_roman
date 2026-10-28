# WeatherPulse 🌦️

WeatherPulse is a full-stack weather application that allows users to search for cities and view current weather conditions.

The project is built as a monorepo with a Next.js frontend and an Express backend. It uses the Open-Meteo API to retrieve weather data.

## Features

- Search for a city by name.
- Display the current temperature.
- Display humidity and wind speed.
- Show weather conditions with descriptions and icons.
- Handle loading and error states.
- Validate external API responses with Zod.
- Use request timeouts for external API calls.
- Responsive dark-themed user interface.

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS Modules

### Backend

- Node.js
- Express
- TypeScript
- Zod

### External API

- [Open-Meteo](https://open-meteo.com/)

### Development Tools

- pnpm workspaces
- Git

## Project Structure

```text
weather_from_roman/
├── apps/
│   ├── web/
│   │   └── src/
│   │       └── app/
│   │           ├── page.tsx
│   │           ├── page.module.css
│   │           ├── globals.css
│   │           └── layout.tsx
│   └── server/
│       └── src/
│           ├── schemas/
│           │   └── weather.schema.ts
│           ├── services/
│           │   └── weather.service.ts
│           └── index.ts
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Requirements

Make sure you have installed:

- Node.js
- pnpm

## Getting Started

### 1. Install dependencies

From the project root, run:

```bash
pnpm install
```

### 2. Start the application

Run both the frontend and backend from the project root:

```bash
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Health Check

```http
GET /api/health
```

Returns the backend health status.

Example response:

```json
{
  "status": "ok",
  "message": "WeatherPulse API is running"
}
```

### Get Weather by City

```http
GET /api/weather?city=Kyiv
```

Returns current weather data for the specified city.

Example response:

```json
{
  "city": "Kyiv",
  "country": "Ukraine",
  "temperature": 7.5,
  "humidity": 83,
  "windSpeed": 5.2,
  "weatherCode": 2
}
```

The values above are illustrative examples and may differ from actual weather conditions.

### Error Responses

- `400 Bad Request` — city name is missing or invalid.
- `404 Not Found` — the requested city could not be found.
- `502 Bad Gateway` — the external weather service failed or returned invalid data.

## Data Validation

WeatherPulse uses Zod to validate responses received from the Open-Meteo API.

This helps ensure that the application works with data that matches the expected structure.

## Type Checking

To check the backend TypeScript code, run:

```bash
pnpm --filter server typecheck
```

## How It Works

1. The user enters a city name in the frontend.
2. The frontend sends a request to the Express backend.
3. The backend searches for the city's coordinates using Open-Meteo Geocoding.
4. The backend requests current weather data using those coordinates.
5. Zod validates the external API responses.
6. The backend returns the weather data to the frontend.
7. The frontend displays the weather information or an error message.

## Learning Goals

WeatherPulse is a learning project designed to practice:

- Full-stack application structure.
- Next.js and React fundamentals.
- TypeScript.
- REST API development with Express.
- Asynchronous requests with `fetch`.
- External API integration.
- Data validation with Zod.
- Error handling and loading states.
- Git and pnpm workspace workflows.

## License

This project is intended for learning and educational purposes.
