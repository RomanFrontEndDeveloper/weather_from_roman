import "dotenv/config";
import { prisma } from "./prisma.js";

try {
  const history = await prisma.weatherSearch.findMany({
    orderBy: {
      searched_at: "desc",
    },
    take: 5,
  });

  console.log("Prisma connection successful!");
  console.log(history);
} catch (error) {
  console.error("Prisma query failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
