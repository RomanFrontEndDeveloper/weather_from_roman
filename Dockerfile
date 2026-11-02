
# 1. Базовий образ Node.js
FROM node:22-bookworm-slim

# 2. Робоча директорія всередині контейнера
WORKDIR /app

# 3. Встановлюємо pnpm потрібної версії
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

# 4. Копіюємо проєкт у контейнер
COPY . .

# 5. Встановлюємо залежності монорепозиторію
RUN pnpm install --frozen-lockfile

# 6. Тимчасова DATABASE_URL для генерації Prisma Client
ENV DATABASE_URL="postgresql://build:build@localhost:5432/weatherpulse"

# 7. Генеруємо Prisma Client і компілюємо TypeScript
RUN pnpm --filter server build

# 8. Порт backend
EXPOSE 5000

# 9. Запуск сервера
CMD ["pnpm", "--filter", "server", "start"]
