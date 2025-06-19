"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
const prisma_1 = require("./utils/prisma");
const PORT = process.env.PORT || 4000;
// Fonction de démarrage
async function startServer() {
    try {
        // Connexion à la base de données
        await (0, prisma_1.connectDB)();
        // Démarrage du serveur
        const server = app_1.default.listen(PORT, () => {
            logger_1.logger.success(`🚀 CareFlow API started successfully`);
            logger_1.logger.info(`📍 Server: http://localhost:${PORT}`);
            logger_1.logger.info(`📊 Health: http://localhost:${PORT}/api/health`);
            logger_1.logger.info(`🗄️  Database UI: http://localhost:5555`);
            logger_1.logger.info(`🏥 Admin Panel: http://localhost:8080`);
            logger_1.logger.info(`📚 Environment: ${process.env.NODE_ENV}`);
        });
        // Gestion graceful shutdown
        process.on("SIGTERM", () => {
            logger_1.logger.info("SIGTERM received, shutting down gracefully");
            server.close(() => {
                logger_1.logger.info("✅ CareFlow server stopped");
                process.exit(0);
            });
        });
        process.on("SIGINT", () => {
            logger_1.logger.info("\n🛑 SIGINT received, shutting down gracefully");
            server.close(() => {
                logger_1.logger.info("✅ CareFlow server stopped");
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to start CareFlow server:", error);
        process.exit(1);
    }
}
// Gestion des erreurs non gérées
process.on("uncaughtException", (error) => {
    logger_1.logger.error("💥 Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error("💥 Unhandled Rejection:", reason);
    process.exit(1);
});
// Démarrage
startServer();
//# sourceMappingURL=server.js.map