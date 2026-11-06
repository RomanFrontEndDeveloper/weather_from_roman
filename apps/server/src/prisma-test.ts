import "dotenv/config";
import { prisma } from "./prisma.js";

async function main() {
  // 1. CREATE — створюємо тестовий запис
  const created = await prisma.weatherSearch.create({
    data: {
      city: "Prisma Test",
      temperature: 18.5,
      humidity: 60,
      windSpeed: 12.3,
      description: "Testing Neon and Prisma",
    },
  });

  console.log("CREATE successful:", created);

  // 2. READ — читаємо створений запис
  const found = await prisma.weatherSearch.findUnique({
    where: {
      id: created.id,
    },
  });

  console.log("READ successful:", found);

  // 3. DELETE — видаляємо тестовий запис
  const deleted = await prisma.weatherSearch.delete({
    where: {
      id: created.id,
    },
  });

  console.log("DELETE successful:", deleted);
}

main()
  .catch((error) => {
    console.error("Prisma CRUD test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
