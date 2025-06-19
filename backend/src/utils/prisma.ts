import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Test de connexion
export async function connectDB() {
  try {
    await prisma.$connect();
    logger.success("Database connected successfully");

    // Test simple
    await prisma.user.findFirst();
    logger.info("Database tables accessible");
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
}

export default prisma;
