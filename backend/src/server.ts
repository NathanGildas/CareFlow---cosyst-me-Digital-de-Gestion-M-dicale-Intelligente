import app from './app';
import { logger } from './utils/logger';
import { connectDB } from './utils/prisma';

const PORT = process.env.PORT || 4000;

// Fonction de démarrage
async function startServer() {
  try {
    // Connexion à la base de données
    await connectDB();

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CareFlow API started successfully`);
      logger.info(`📍 Server: http://localhost:${PORT}/api`);
      logger.info(`📊 Health: http://localhost:${PORT}/health`);
      logger.info(
        `📚 Referentials: http://localhost:${PORT}/api/referentials/regions`
      );
      logger.info(
        `🏥 Establishments: http://localhost:${PORT}/api/establishments`
      );
      logger.info(`📄 Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🗄️ Database UI: http://localhost:5555`);
      logger.info(`🏥 Admin Panel: http://localhost:8080`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV}`);
    });

    // Gestion graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ CareFlow server stopped');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('\n🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ CareFlow server stopped');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('❌ Failed to start CareFlow server:', error);
    process.exit(1);
  }
}

// Gestion des erreurs non gérées
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Démarrage
startServer();
