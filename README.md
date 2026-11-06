# WeatherPulse 🌦️

**WeatherPulse** is a full-stack weather application built with Next.js, React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis and BullMQ.

The application allows users to search for cities, retrieve current weather conditions, view weather information and manage weather search history.

Weather data is retrieved from the Open-Meteo API, validated with Zod, cached in Redis and stored asynchronously in PostgreSQL through BullMQ background jobs.

The project is developed as a pnpm monorepo and focuses on modern full-stack architecture, backend engineering, database management, automated testing, containerization and production deployment.

---

## Features

### Weather Application

- Search for cities by name.
- Retrieve current weather conditions.
- Display temperature, humidity and wind speed.
- Display weather conditions using weather codes and icons.
- Responsive dark-themed interface.
- Loading and error states.
- Input validation and error handling.

### Backend

- REST API built with Express.
- TypeScript-based backend architecture.
- External API integration using Fetch API.
- Zod validation for external API responses.
- Retry mechanism for temporary external API failures.
- HTTP error handling.
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

### External API

- [Open-Meteo](https://open-meteo.com/)
- Open-Meteo Geocoding API
- Open-Meteo Forecast API

### Testing

- Vitest

### Infrastructure and Development Tools

- Docker
- Docker Compose
- pnpm
- Git
- GitHub
- Visual Studio Code

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
│       │   │
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

Backend environment variables:

```env
DATABASE_URL=YOUR_POSTGRESQL_CONNECTION_STRING

REDIS_URL=YOUR_REDIS_CONNECTION_STRING

PORT=5000
```

The application uses:

- `DATABASE_URL` for PostgreSQL and Prisma.
- `REDIS_URL` for Redis caching and BullMQ.
- `PORT` for the Express API server.

**Important:** Never commit `.env` files or expose database credentials, Redis passwords or other secrets in GitHub.

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

The Worker must run separately from the Express API because it processes background jobs independently.

---

## API Endpoints

Base URL:

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
GET /api/weather?city=Kyiv
```

Retrieves current weather information for the specified city.

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

The values above are illustrative examples.

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

| Status | Description                          |
| ------ | ------------------------------------ |
| 400    | Invalid or missing city name / ID    |
| 404    | City or history record not found     |
| 500    | Internal server or database error    |
| 502    | External weather service unavailable |

---

## How WeatherPulse Works

### Weather Search Flow

1. The user enters a city name in the frontend.
2. The frontend sends an HTTP request to the Express API.
3. The backend checks Redis for cached weather data.
4. If cached data exists, the backend returns it.
5. If the cache is empty, the backend requests city coordinates from Open-Meteo Geocoding API.
6. The backend retrieves current weather conditions from Open-Meteo Forecast API.
7. Zod validates the external API responses.
8. The weather service formats the result.
9. The backend stores the weather data in Redis for 10 minutes.
10. The backend adds a background job to BullMQ.
11. The API returns weather information to the frontend.
12. The frontend displays the weather conditions.

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
weather:kyiv
```

### Redis Failure Handling

If Redis is unavailable, the backend continues operating without caching.

The application can still retrieve weather information directly from Open-Meteo.

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

The current documented test suite contains 6 automated tests.

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

## Environment and Deployment

WeatherPulse is being prepared for production deployment.

The planned production architecture separates the frontend, API, background Worker, database and Redis infrastructure.

### Planned Deployment Services

| Component         | Planned Platform |
| ----------------- | ---------------- |
| Frontend          | Vercel           |
| Backend API       | Render           |
| Background Worker | Render           |
| PostgreSQL        | Neon             |
| Redis             | Upstash          |
| Source Code       | GitHub           |

### Production Architecture

```text
             USER
               |
               v
        VERCEL FRONTEND
          (Next.js)
               |
               v
         RENDER API
          (Express)
               |
        +------+------+
        |             |
        v             v
      REDIS        OPEN-METEO
     (Cache)       (Weather API)
        |
        v
     BULLMQ
        |
        v
   BACKGROUND WORKER
        |
        v
      NEON
   (PostgreSQL)
```

The production deployment is planned. The services and deployment configuration will be documented and updated after successful publication.

Production environment variables and credentials must be configured through the respective hosting platforms, not committed to the repository.

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

---

## Project Status

WeatherPulse is under active development.

Implemented functionality includes:

- Full-stack application foundation.
- Weather search through Open-Meteo.
- Backend API.
- Zod response validation.
- PostgreSQL integration.
- Prisma ORM and migrations.
- Weather search history.
- Redis caching.
- BullMQ background processing.
- Separate Weather Worker.
- Docker Compose infrastructure.
- Backend automated tests.

Production deployment and final production verification are the next development stages.

---

## License

This project is developed for educational and portfolio purposes.
