"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: ["query", "error", "warn"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
// Test de connexion
async function connectDB() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.success("Database connected successfully");
        // Test simple
        await exports.prisma.user.findFirst();
        logger_1.logger.info("Database tables accessible");
    }
    catch (error) {
        logger_1.logger.error("Database connection failed:", error);
        throw error;
    }
}
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map