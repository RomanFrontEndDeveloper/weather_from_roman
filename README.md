# WeatherPulse 🌦️

WeatherPulse is a full-stack weather application that allows users to search for cities, view current weather conditions, and work with weather search data.

The project is built as a monorepo with a Next.js frontend and an Express backend. It uses the Open-Meteo API to retrieve weather data and PostgreSQL to store application data.

The project is also focused on learning and implementing production-oriented backend technologies and development practices.

## Features

- Search for a city by name.
- Display the current temperature.
- Display humidity and wind speed.
- Show weather conditions with descriptions and icons.
- Handle loading and error states.
- Validate external API responses with Zod.
- Use request timeouts for external API calls.
- Responsive dark-themed user interface.
- PostgreSQL database integration.
- Weather search database model.
- Prisma ORM integration.
- Database schema management.
- Prisma migrations and Prisma Client setup.

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

### Database

- PostgreSQL
- Prisma ORM
- Prisma Client
- SQL

### External API

- [Open-Meteo](https://open-meteo.com/)

### Development Tools

- pnpm workspaces
- Git
- Docker
- Visual Studio Code

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
│   │
│   └── server/
│       └── src/
│           ├── schemas/
│           │   └── weather.schema.ts
│           ├── services/
│           │   └── weather.service.ts
│           ├── prisma.ts
│           └── index.ts
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Requirements

Make sure you have installed:

- Node.js
- pnpm
- PostgreSQL
- Docker Desktop (for containerized development)

## Getting Started

### 1. Install dependencies

From the project root, run:

```bash
pnpm install
```

### 2. Configure environment variables

Configure the environment variables required by the backend, including the PostgreSQL database connection.

### 3. Start the application

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

## Database

WeatherPulse uses PostgreSQL as its relational database.

The project introduces database management using Prisma ORM.

### Database Technologies

- PostgreSQL for relational data storage.
- SQL for understanding and working with relational databases.
- Prisma ORM for database access.
- Prisma Schema for defining database models.
- Prisma Migrate for managing database migrations.
- Prisma Client for type-safe database queries.

### Weather Search Model

The project introduces a `WeatherSearch` model for storing weather search information.

The database table `weather_searches` includes:

- `id` — unique record identifier.
- `city` — searched city name.
- `temperature` — recorded temperature.
- `humidity` — recorded humidity.
- `windSpeed` — recorded wind speed.
- `searched_at` — search timestamp.

An index is used to improve queries involving search timestamps.

## Data Validation

WeatherPulse uses Zod to validate responses received from the Open-Meteo API.

This helps ensure that the application works with data that matches the expected structure.

## Type Checking and Build

To check the backend TypeScript code, run:

```bash
pnpm --filter server typecheck
```

To build the frontend and check the backend:

```bash
pnpm run build
```

## How It Works

1. The user enters a city name in the frontend.
2. The frontend sends a request to the Express backend.
3. The backend searches for the city's coordinates using Open-Meteo Geocoding.
4. The backend requests current weather data using those coordinates.
5. Zod validates the external API responses.
6. The backend processes the weather data.
7. PostgreSQL provides persistent storage for application data.
8. The frontend displays the weather information or an error message.

## Development Progress

WeatherPulse is being developed in structured learning sections.

### Section 1 — Project Foundation and Weather API

Completed foundation work:

- Created a pnpm monorepo.
- Configured the Next.js frontend.
- Configured the Express backend.
- Implemented communication between frontend and backend.
- Integrated the Open-Meteo Geocoding API.
- Integrated the Open-Meteo Weather API.
- Implemented asynchronous requests using `fetch`.
- Added Zod validation for external API responses.
- Implemented error handling.
- Added request timeouts.
- Created a responsive weather interface.
- Implemented loading and error states.
- Added TypeScript types and backend validation.

### Section 2 — PostgreSQL and Prisma

Database development and integration:

- Introduction to relational databases.
- PostgreSQL setup and connection.
- SQL fundamentals and database queries.
- Understanding database tables, columns, data types and indexes.
- Creating the `weather_searches` database table.
- Connecting the backend to PostgreSQL.
- Introduction to Prisma ORM.
- Configuring Prisma in the backend.
- Creating the `WeatherSearch` Prisma model.
- Working with the Prisma schema.
- Learning database migrations.
- Setting up Prisma Client.

Further development includes database operations, weather search history, query optimization, indexes and transactions.

## Learning Goals

WeatherPulse is a learning project designed to practice:

- Full-stack application architecture.
- Next.js and React fundamentals.
- TypeScript.
- REST API development with Express.
- Asynchronous programming with `fetch`.
- External API integration.
- Data validation with Zod.
- PostgreSQL and relational database design.
- SQL queries and database operations.
- Prisma ORM and Prisma Client.
- Database migrations.
- Error handling and application reliability.
- Git and pnpm workspace workflows.
- Docker and containerized development.

## License

This project is intended for learning and educational purposes.

## Docker

Для запуску WeatherPulse використовуємо Docker і Docker Compose.

**Використано:**

- Docker Desktop
- Node.js 22
- PostgreSQL 17 (`postgres:17-alpine`)
- Docker Volume `weatherpulse_data`
- Docker Compose (`compose.yaml`)
- Docker images: `weather_from_roman-web`, `weather_from_roman-server`

**Порти:**

- Frontend: `3001 → 3000`
- Backend: `5001 → 5000`
- PostgreSQL: `5432 → 5432`

**Основні команди:**

```powershell
# Запуск усіх сервісів
docker compose up -d --build

# Перегляд статусу
docker compose ps

# Перегляд логів
docker compose logs
docker compose logs web
docker compose logs server
docker compose logs db

# Зупинка та повторний запуск
docker compose stop
docker compose start

# Перезапуск
docker compose restart

# Зупинка та видалення контейнерів і мережі
docker compose down

# Перегляд images і volumes
docker images
docker volume ls
```

**Результат:**

- Frontend Next.js працює в Docker.
- Backend Express працює в Docker.
- PostgreSQL працює в Docker.
- Сервіси взаємодіють через спільну Docker-мережу.
- Дані PostgreSQL зберігаються у Volume `weatherpulse_data`.
- Роботу API та історії пошуку перевірено.
- Перезапуск контейнерів не видаляє дані бази.

**Адреса застосунку:** http://localhost:3001

## Redis Caching

WeatherPulse uses Redis as an in-memory cache to improve API response times and reduce unnecessary requests to the external Open-Meteo API.

### Features

- Redis integration with Node.js and Express.
- Weather data caching.
- Cache Hit and Cache Miss handling.
- Configurable cache expiration (TTL).
- Automatic cache expiration.
- Graceful degradation when Redis is unavailable.

### Cache Strategy

1. The backend checks Redis for cached weather data.
2. If cached data exists (Cache Hit), it is returned immediately.
3. If cached data does not exist (Cache Miss), the backend requests weather data from Open-Meteo.
4. The result is stored in Redis for 10 minutes.
5. If Redis is unavailable, the backend continues fetching weather data directly from Open-Meteo.

### Redis Configuration

```env
REDIS_URL=redis://redis:6379
```

For local development outside Docker:

```env
REDIS_URL=redis://127.0.0.1:6379
```

### Docker

Redis runs as a separate Docker Compose service using the `redis:7-alpine` image.

Start Redis:

```bash
docker compose up -d redis
```

Check Redis:

```bash
docker exec weatherpulse-redis redis-cli ping
```

Expected response:

```text
PONG
```

### Cache Configuration

The cache expiration time is configured using `CACHE_TTL`.

```typescript
const CACHE_TTL = 600;
```

This means cached weather data expires after 10 minutes.

### Background Jobs — BullMQ

WeatherPulse uses **BullMQ** and **Redis** to process weather search history asynchronously.

Instead of saving every search directly during the HTTP request, the backend adds a job to the `weather-history` queue. A separate Worker processes the job and saves the search data to PostgreSQL using Prisma.

**How it works:**

1. The user searches for a city.
2. The Express backend retrieves weather data from Open-Meteo or Redis cache.
3. The backend adds a `save-weather-history` job to the BullMQ queue.
4. Redis stores and manages the queued job.
5. The Weather Worker retrieves the job.
6. Prisma saves the weather search history in PostgreSQL.
7. BullMQ marks the job as completed or failed.

**Technologies:**

- BullMQ — background job and queue management.
- Redis — queue storage and job state management.
- ioredis — Redis connection for BullMQ.
- Prisma — database operations.
- PostgreSQL — persistent weather search history.

**Main components:**

- `config/queue.redis.ts` — Redis connection for BullMQ.
- `queues/weather.queue.ts` — weather history queue and job data types.
- `workers/weather.worker.ts` — background job processor.
- `worker.ts` — separate Worker entry point.

**Development commands:**

```bash
# Start the Express backend
pnpm --filter server dev

# Start the background Worker
pnpm --filter server dev:worker
```

The backend and Worker run as separate processes.

The implementation supports asynchronous weather history storage for both Redis cache hits and cache misses.
///////////////////////////////////

### Automated Testing

WeatherPulse uses **Vitest** for automated testing of backend functionality.

#### Implemented tests

- **Unit tests:** basic utility function testing.
- **Weather service tests:**
  - Successful weather data retrieval.
  - Handling cities that cannot be found (`CITY_NOT_FOUND`).
  - Handling Geocoding API errors.
  - Handling Forecast API errors.
- **Mocking:** external API requests, Redis and BullMQ dependencies are mocked to isolate the weather service during testing.

#### Running tests

Run all backend tests:

```bash
pnpm --filter server exec vitest run
```

#### Current test coverage

- Utility function tests: 2
- Weather service tests: 4
- Total: 6 automated tests

All 6 tests pass successfully.

Additional integration and end-to-end tests are planned for subsequent stages of development.
