import { pool } from "./db.js";

try {
  const result = await pool.query(
    "SELECT current_database(), current_user, NOW()",
  );

  console.log("PostgreSQL connection successful!");
  console.log(result.rows[0]);
} catch (error) {
  console.error("PostgreSQL connection failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

// Цей файл db-test.ts перевіряє, чи працює підключення до PostgreSQL.
// - pool.query(...) — виконує SQL-запит, який отримує назву бази даних,
//  користувача та поточний час.
// - console.log(...) — виводить повідомлення про успішне підключення та
// результат запиту.
// - catch — обробляє помилку, якщо підключення не вдалося.
// - finally — викликає pool.end(), щоб закрити з'єднання після перевірки.
// Простими словами: db.ts налаштовує підключення, а db-test.ts перевіряє,
//  чи воно справді працює.
