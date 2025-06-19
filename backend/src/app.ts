// backend/src/app.ts - VERSION COMPLÈTE
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import des routes
import authRoutes from "./routes/auth";

// Import des middlewares
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARES DE SÉCURITÉ
// =====================================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard",
  },
});
app.use("/api", limiter);

// Logging des requêtes
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// =====================================================
// PARSING DES DONNÉES
// =====================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================================
// ROUTES PRINCIPALES
// =====================================================

// Page d'accueil
app.get("/", (req, res) => {
  res.json({
    service: "CareFlow API",
    version: "1.0.0",
    status: "✅ Opérationnel",
    message: "API de gestion médicale intelligente",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      docs: "/api/docs",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "CareFlow API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    message: "Tous les systèmes opérationnels",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// =====================================================
// ROUTES API
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// GESTION D'ERREURS
// =====================================================

// 404 Not Found
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

export default app;
