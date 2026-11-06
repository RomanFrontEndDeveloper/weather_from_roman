import "dotenv/config";
import { prisma } from "./prisma.js";

try {
  const history = await prisma.weatherSearch.findMany({
    orderBy: {
      searched_at: "desc",
    },
    take: 5,
  });

  console.log("Latest weather history:");
  console.log(history);
} catch (error) {
  console.error("Database query failed:", error);
} finally {
  await prisma.$disconnect();
}
