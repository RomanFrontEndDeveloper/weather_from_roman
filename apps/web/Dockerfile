
# 1. Базовий образ Node.js
FROM node:22-bookworm-slim

# 2. Робоча директорія контейнера
WORKDIR /app

# 3. Встановлюємо pnpm
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

# 4. Копіюємо файли workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json

# 5. Встановлюємо залежності
RUN pnpm install --frozen-lockfile

# 6. Копіюємо код проєкту
COPY . .

# 7. Передаємо адресу backend для Next.js
ARG API_INTERNAL_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL

# 8. Збираємо frontend
RUN pnpm --filter web build

# 9. Порт Next.js
EXPOSE 3000

# 10. Запускаємо production-сервер
CMD ["pnpm", "--filter", "web", "start"]
