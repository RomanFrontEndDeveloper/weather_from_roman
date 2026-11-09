# WeatherPulse 🌦️

**WeatherPulse** is a full-stack weather application built with Next.js, React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis and BullMQ.

The application allows users to search for cities worldwide, retrieve current weather conditions, view weather information and manage their weather search history.

Weather data is retrieved through a **dual-provider architecture** using Open-Meteo as the primary provider and WeatherAPI.com as a fallback provider. External API responses are validated with Zod, weather data is cached in Redis, and search history is stored asynchronously in PostgreSQL through BullMQ background jobs.

The project is developed as a pnpm monorepo and demonstrates modern full-stack architecture, backend engineering, external API integration, database management, caching, background processing, automated testing, containerization and production deployment.

**Live Application:** https://weather-from-roman.vercel.app

**Backend API:** https://weather-from-roman.onrender.com

---

## Features

### Weather Application

- Search for cities by name.
- Retrieve current weather conditions.
- Display temperature, humidity and wind speed.
- Display weather conditions using weather codes and icons.
- Responsive dark-themed interface.
- Loading and error states.
- Input validation.
- Weather search history.
- Delete individual search history records.

### Dual Weather API Architecture

- Open-Meteo as the primary weather provider.
- WeatherAPI.com as the secondary provider.
- Automatic fallback when the primary provider fails.
- External API response validation using Zod.
- WeatherAPI condition-code normalization.
- HTTP error handling.
- Retry handling for temporary API failures.
- Request timeout protection.
- Provider-specific error logging.

### Backend

- REST API built with Express.
- TypeScript-based backend architecture.
- External API integration using Fetch API.
- Zod validation for external API responses.
- Centralized weather service.
- Error handling and HTTP status management.
- Separate API and background Worker processes.

### Database

- PostgreSQL integration.
- Prisma ORM.
- Prisma Client.
- Database schema management.
- Prisma migrations.
- Weather search history.
- Database queries and sorting.

### Redis Caching

- Redis integration.
- Weather data caching.
- Cache Hit and Cache Miss handling.
- Configurable cache expiration.
- 10-minute cache TTL.
- Graceful degradation when Redis is unavailable.

### Background Jobs

- BullMQ job queue.
- Redis-based job management.
- Separate background Worker.
- Asynchronous weather history storage.
- Job completion and failure handling.
- PostgreSQL integration through Prisma.

### Automated Testing

- Vitest.
- Unit testing.
- Mocking external API requests.
- Mocking Redis and BullMQ dependencies.
- Weather service testing.
- Error handling tests.

### Infrastructure

- Docker.
- Docker Compose.
- PostgreSQL container.
- Redis container.
- Containerized frontend and backend.
- pnpm workspaces.
- Git version control.
- Production deployment with Vercel and Render.

---

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
- Fetch API

### Database

- PostgreSQL
- Prisma ORM
- Prisma Client
- SQL

### Caching and Background Jobs

- Redis
- BullMQ
- ioredis
- node-redis

### External APIs

- [Open-Meteo](https://open-meteo.com/)
- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- [WeatherAPI.com](https://www.weatherapi.com/)
- WeatherAPI Current Weather API

### Testing

- Vitest

### Infrastructure and Development Tools

- Docker
- Docker Compose
- pnpm
- Git
- GitHub
- Visual Studio Code

### Production Deployment

- Vercel
- Render
- Neon PostgreSQL
- Upstash Redis

---

## Project Architecture

WeatherPulse uses a monorepo architecture with separate frontend and backend applications.

```text
weather_from_roman/
│
├── apps/
│   │
│   ├── web/
│   │   └── src/
│   │       └── app/
│   │           ├── page.tsx
│   │           ├── page.module.css
│   │           ├── globals.css
│   │           └── layout.tsx
│   │
│   └── server/
│       │
│       ├── prisma/
│       │   ├── migrations/
│       │   └── schema.prisma
│       │
│       ├── src/
│       │   ├── config/
│       │   │   ├── redis.ts
│       │   │   └── queue.redis.ts
│       │   │
│       │   ├── generated/
│       │   │
│       │   ├── queues/
│       │   │   └── weather.queue.ts
│       │   │
│       │   ├── routes/
│       │   │   └── weather.routes.ts
│       │   │
│       │   ├── schemas/
│       │   │   └── weather.schema.ts
│       │   │
│       │   ├── services/
│       │   │   └── weather.service.ts
│       │   │
│       │   ├── utils/
│       │   │
│       │   ├── workers/
│       │   │   └── weather.worker.ts
│       │   │
│       │   ├── index.ts
│       │   ├── worker.ts
│       │   └── prisma.ts
│       │
│       ├── prisma7.config.ts
│       └── package.json
│
├── compose.yaml
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## Requirements

Make sure you have installed:

- Node.js 22 or compatible supported version.
- pnpm 11.
- Docker Desktop.
- Git.

For local development, you also need access to PostgreSQL and Redis.

---

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL

cd weather_from_roman
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create the required environment files using your own credentials.

**Backend environment variables:**

```env
DATABASE_URL=YOUR_POSTGRESQL_CONNECTION_STRING

REDIS_URL=YOUR_REDIS_CONNECTION_STRING

WEATHERAPI_KEY=YOUR_WEATHERAPI_KEY

PORT=5000

NODE_ENV=development
```

**Frontend environment variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The application uses:

| Variable              | Purpose                         |
| --------------------- | ------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection           |
| `REDIS_URL`           | Redis connection and BullMQ     |
| `WEATHERAPI_KEY`      | WeatherAPI authentication       |
| `PORT`                | Express API server port         |
| `NODE_ENV`            | Application environment         |
| `NEXT_PUBLIC_API_URL` | Backend API URL used by Next.js |

**Important:** Never commit `.env` files or expose database credentials, Redis passwords or API keys in GitHub.

`NEXT_PUBLIC_API_URL` is intentionally public because it is used by the frontend. Never place private API keys in `NEXT_PUBLIC_` variables.

For local Docker development, connection strings must match the Docker Compose network and service configuration.

### 4. Start the application

From the project root:

```bash
pnpm dev
```

This starts the frontend and backend in parallel.

### 5. Start the background Worker

In a separate terminal:

```bash
pnpm --filter server dev:worker
```

The Worker runs separately from the Express API and processes background jobs independently.

---

## API Endpoints

**Production Base URL:**

```text
https://weather-from-roman.onrender.com/api
```

**Local Base URL:**

```text
http://localhost:5000/api
```

### 1. Health Check

```http
GET /api/health
```

Checks whether the backend API is running.

Example response:

```json
{
  "status": "ok",
  "message": "WeatherPulse API is running"
}
```

### 2. Get Weather by City

```http
GET /api/weather?city=Khmelnytskyi
```

Retrieves current weather information for the specified city.

Example response:

```json
{
  "city": "Khmelnytskyi",
  "country": "Ukraine",
  "temperature": 7.5,
  "humidity": 83,
  "windSpeed": 5.2,
  "weatherCode": 2
}
```

The values above are illustrative examples.

The weather provider may be Open-Meteo or WeatherAPI depending on availability.

### 3. Get Weather Search History

```http
GET /api/history
```

Retrieves weather search records from PostgreSQL.

Records are sorted by search timestamp in descending order.

### 4. Delete a History Record

```http
DELETE /api/history/:id
```

Deletes a weather history record by its ID.

Example:

```http
DELETE /api/history/1
```

Example response:

```json
{
  "message": "History record deleted",
  "id": 1
}
```

### HTTP Error Responses

| Status | Description                            |
| ------ | -------------------------------------- |
| 400    | Invalid or missing city name / ID      |
| 404    | City or history record not found       |
| 500    | Internal server or database error      |
| 502    | External weather providers unavailable |

---

## How WeatherPulse Works

### Weather Search Flow

1. The user enters a city name in the frontend.
2. The frontend sends an HTTP request to the Express API.
3. The backend generates a Redis cache key.
4. The backend checks Redis for cached weather data.
5. If cached data exists, the backend returns it.
6. If the cache is empty, the backend requests city coordinates from Open-Meteo Geocoding API.
7. Open-Meteo Forecast API retrieves current weather conditions.
8. Zod validates the external API responses.
9. If Open-Meteo fails, the backend switches to WeatherAPI.com.
10. WeatherAPI retrieves current weather conditions using the configured API key.
11. Zod validates the WeatherAPI response.
12. WeatherAPI condition codes are normalized into the application's weather-code format.
13. The backend formats the weather result.
14. The result is stored in Redis for 10 minutes.
15. A background job is added to BullMQ.
16. The API returns weather information to the frontend.
17. The frontend displays the weather conditions.

### Weather Provider Fallback Flow

WeatherPulse uses a primary and secondary weather provider.

```text
          USER REQUEST
                |
                v
          EXPRESS API
                |
                v
          REDIS CACHE
                |
         +------+------+
         |             |
       CACHE HIT    CACHE MISS
         |             |
         v             v
       RETURN      OPEN-METEO
       WEATHER       REQUEST
                       |
                 +-----+-----+
                 |           |
               SUCCESS      FAILURE
                 |           |
                 v           v
             RETURN      WEATHERAPI
             WEATHER      REQUEST
                             |
                       +-----+-----+
                       |           |
                     SUCCESS      FAILURE
                       |           |
                       v           v
                   RETURN       ERROR
                   WEATHER
```

This architecture improves reliability by allowing the application to retrieve weather information from a secondary provider when the primary provider is unavailable or reaches its request limit.

### Background History Storage Flow

1. The weather service adds a `save-weather-history` job to BullMQ.
2. Redis stores and manages the job.
3. The separate Weather Worker retrieves the job.
4. The Worker extracts the weather information.
5. Prisma creates a record in PostgreSQL.
6. BullMQ marks the job as completed or failed.

Weather history is saved asynchronously, so the API response does not have to wait for the database insertion.

---

## Redis Caching

WeatherPulse uses Redis to reduce unnecessary external API requests and improve response times.

### Cache Strategy

The application uses a cache-first approach.

1. Generate a cache key based on the city name.
2. Check whether Redis is available.
3. Attempt to retrieve cached weather data.
4. If data exists, return the cached result.
5. If data does not exist, request fresh weather information.
6. Store the new result in Redis.
7. Set the cache expiration time to 10 minutes.

### Cache TTL

```typescript
const CACHE_TTL = 600;
```

600 seconds = 10 minutes.

### Cache Key Example

```text
weather:khmelnytskyi
```

### Redis Failure Handling

If Redis is unavailable, the backend continues operating without caching.

The application can still retrieve weather information directly from the configured weather providers.

This approach provides graceful degradation rather than making Redis availability mandatory for weather requests.

---

## Background Jobs — BullMQ

WeatherPulse uses BullMQ to process weather search history asynchronously.

### Technologies

- BullMQ — background job processing.
- Redis — job storage and queue management.
- ioredis — Redis connection for BullMQ.
- Prisma — database access.
- PostgreSQL — persistent storage.

### Main Components

| File                        | Responsibility                    |
| --------------------------- | --------------------------------- |
| `config/queue.redis.ts`     | Redis connection for BullMQ       |
| `queues/weather.queue.ts`   | Queue configuration and job types |
| `workers/weather.worker.ts` | Background job processing         |
| `worker.ts`                 | Worker entry point                |

### Development Commands

Start the API:

```bash
pnpm --filter server dev
```

Start the Worker:

```bash
pnpm --filter server dev:worker
```

The API and Worker operate as independent Node.js processes.

---

## Database — PostgreSQL and Prisma

WeatherPulse uses PostgreSQL for persistent storage and Prisma ORM for database operations.

### Database Model

The application uses the `WeatherSearch` model.

The corresponding PostgreSQL table is:

```text
weather_searches
```

Main fields:

| Field       | Description                  |
| ----------- | ---------------------------- |
| id          | Unique record identifier     |
| city        | City name                    |
| description | Optional weather description |
| temperature | Recorded temperature         |
| humidity    | Relative humidity            |
| windSpeed   | Wind speed                   |
| searched_at | Search timestamp             |

An index is used to improve queries involving search timestamps.

### Prisma Commands

Generate Prisma Client:

```bash
pnpm --filter server exec prisma generate --config prisma7.config.ts
```

Check migration status:

```bash
pnpm --filter server exec prisma migrate status --config prisma7.config.ts
```

Apply migrations:

```bash
pnpm --filter server exec prisma migrate deploy --config prisma7.config.ts
```

The project uses Prisma migrations to manage database schema changes.

---

## Automated Testing

WeatherPulse uses Vitest for automated backend testing.

### Implemented Tests

**Weather Service Tests**

- Successful weather data retrieval.
- City not found handling.
- Geocoding API error handling.
- Forecast API error handling.

**Mocking**

- External HTTP requests.
- Redis dependencies.
- BullMQ dependencies.

**Utility Tests**

- Utility function validation.

### Run Tests

Run all backend tests:

```bash
pnpm --filter server exec vitest run
```

Run tests in watch mode:

```bash
pnpm --filter server exec vitest
```

Additional integration and end-to-end testing can be introduced as the project develops.

---

## Docker and Docker Compose

WeatherPulse uses Docker and Docker Compose to run the application infrastructure in containers.

### Docker Services

| Service  | Image / Technology |
| -------- | ------------------ |
| Web      | Next.js            |
| Server   | Node.js + Express  |
| Database | PostgreSQL 17      |
| Redis    | Redis 7            |

### Local Development Ports

| Service    | Local Port | Container Port |
| ---------- | ---------: | -------------: |
| Frontend   |       3001 |           3000 |
| Backend    |       5001 |           5000 |
| PostgreSQL |       5432 |           5432 |
| Redis      |       6379 |           6379 |

### Docker Commands

Build and start all containers:

```powershell
docker compose up -d --build
```

Check running containers:

```powershell
docker compose ps
```

View all logs:

```powershell
docker compose logs
```

View individual service logs:

```powershell
docker compose logs web
docker compose logs server
docker compose logs db
docker compose logs redis
```

Stop containers:

```powershell
docker compose stop
```

Start existing containers:

```powershell
docker compose start
```

Restart containers:

```powershell
docker compose restart
```

Stop containers and remove the Compose network:

```powershell
docker compose down
```

Check Docker images:

```powershell
docker images
```

Check Docker volumes:

```powershell
docker volume ls
```

**Important:** `docker compose down -v` also removes associated volumes and can permanently delete local database data. Do not use it unless you intentionally want to remove that data.

### Docker Redis Check

Check Redis connectivity:

```powershell
docker exec weatherpulse-redis redis-cli ping
```

Expected response:

```text
PONG
```

### Docker Development Results

- Next.js runs in a container.
- Express runs in a container.
- PostgreSQL runs in a container.
- Redis runs in a container.
- Services communicate through a shared Docker network.
- PostgreSQL data is persisted using a Docker volume.
- API and database connectivity have been tested.

---

## Build and Type Checking

### Backend Type Checking

```bash
pnpm --filter server typecheck
```

### Production Build

From the project root:

```bash
pnpm build
```

The root build script builds the Next.js frontend and checks the backend TypeScript code.

The backend also has its own build script:

```bash
pnpm --filter server build
```

This generates Prisma Client and compiles the backend TypeScript code.

---

## Production Deployment

WeatherPulse is deployed using separate cloud services for the frontend, backend, database and Redis infrastructure.

### Production Architecture

| Component            | Platform       |
| -------------------- | -------------- |
| Frontend             | Vercel         |
| Backend API          | Render         |
| PostgreSQL           | Neon           |
| Redis                | Upstash        |
| Source Code          | GitHub         |
| Primary Weather API  | Open-Meteo     |
| Fallback Weather API | WeatherAPI.com |

### Live Services

**Frontend**

https://weather-from-roman.vercel.app

**Backend API**

https://weather-from-roman.onrender.com

**Backend Health Check**

https://weather-from-roman.onrender.com/api/health

### Production Architecture Diagram

```text
                   USER
                    |
                    v
             VERCEL FRONTEND
                 Next.js
                    |
                    v
              RENDER API
                Express
                    |
          +---------+---------+
          |         |         |
          v         v         v
        REDIS   OPEN-METEO  WEATHERAPI
       Upstash   PRIMARY     FALLBACK
          |
          v
        BULLMQ
          |
          v
    BACKGROUND WORKER
          |
          v
       POSTGRESQL
          Neon
```

### Production Environment Variables

Configure environment variables through the respective hosting platforms.

**Vercel — Frontend**

```env
NEXT_PUBLIC_API_URL=https://weather-from-roman.onrender.com
```

**Render — Backend**

```env
DATABASE_URL=YOUR_NEON_DATABASE_URL

REDIS_URL=YOUR_UPSTASH_REDIS_URL

WEATHERAPI_KEY=YOUR_WEATHERAPI_KEY

NODE_ENV=production
```

The Render service uses the port provided by the hosting environment.

**Security considerations:**

- Never commit production credentials.
- Keep API keys on the backend.
- Do not expose `WEATHERAPI_KEY` to the frontend.
- Use environment variables for sensitive configuration.
- Keep database and Redis connection strings private.

### Deployment Considerations

Render free instances may spin down after inactivity, which can delay the first request.

External weather providers may also enforce request limits. The fallback architecture helps maintain weather service availability when the primary provider encounters errors, provided the secondary provider remains available.

---

## Learning Goals

WeatherPulse is a practical full-stack learning project focused on developing professional engineering skills.

The project covers:

- Monorepo architecture.
- Next.js and React.
- TypeScript.
- Node.js and Express.
- REST API development.
- Asynchronous programming.
- External API integration.
- Multiple API providers and fallback architecture.
- Zod validation.
- Error handling.
- Retry mechanisms.
- PostgreSQL.
- SQL fundamentals.
- Prisma ORM.
- Database migrations.
- Redis caching.
- Cache expiration and TTL.
- BullMQ background jobs.
- Worker architecture.
- Automated testing with Vitest.
- Docker and Docker Compose.
- Git and GitHub.
- Production build and deployment.
- Environment configuration.
- Cloud infrastructure.

---

## Project Status

<sub>Current status: November 2026</sub>

<details>
<summary><strong>Implemented functionality</strong></summary>

- Full-stack application foundation.
- Next.js frontend.
- Express backend API.
- Weather search through Open-Meteo.
- WeatherAPI.com fallback integration.
- Automatic weather provider switching.
- Zod response validation.
- Weather condition code normalization.
- PostgreSQL integration.
- Prisma ORM and migrations.
- Weather search history.
- Redis caching.
- BullMQ background processing.
- Separate Weather Worker.
- Docker Compose infrastructure.
- Backend automated tests.
- Production frontend deployment on Vercel.
- Production backend deployment on Render.
- Neon PostgreSQL integration.
- Upstash Redis integration.
- Production environment configuration.

</details>

WeatherPulse is a deployed full-stack application. Further development can focus on production hardening, monitoring, expanded automated testing, performance optimization and additional weather features.

---

## License

This project is developed for educational and portfolio purposes.
