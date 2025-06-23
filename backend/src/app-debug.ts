// src/app-debug.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());

// Juste une route de test
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Debug OK" });
});

// Test 1 : Juste auth
import authRoutes from "./routes/auth";
app.use("/api/auth", authRoutes);

// Test 2 : + referentials
import referentialsRoutes from "./routes/referentials";
app.use("/api/referentials", referentialsRoutes);

// Test 3 : + patients
import patientsRoutes from "./routes/patients";
app.use("/api/patients", patientsRoutes);

// Test 4 : + doctors
import doctorsRoutes from "./routes/doctors";
app.use("/api/doctors", doctorsRoutes);

// Test 5 : + users
import usersRoutes from "./routes/users";
app.use("/api/users", usersRoutes);

// Test 6 : + appointments
import appointmentsRoutes from "./routes/appointments";
app.use("/api/appointments", appointmentsRoutes);

//Test 7 : + error handling
import { errorHandler, notFound } from "./middlewares/errorHandler";
app.use(notFound);
app.use(errorHandler);

// Configuration des variables d'environnement
dotenv.config();

// =====================================================
// MIDDLEWARES DE SÉCURITÉ
// =====================================================

// Helmet pour sécuriser les headers HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://careflow.sn", "https://app.careflow.sn"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
// Rate limiting global
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes max par IP
  message: {
    success: false,
    message: "Trop de requêtes depuis cette IP. Réessayez plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Exclusion de certaines routes pour la surveillance
  skip: (req) => {
    return req.path === "/health" || req.path === "/api/health";
  },
});

app.use(globalRateLimit);
// =====================================================
// MIDDLEWARES DE PARSING ET COMPRESSION
// =====================================================

// Compression gzip
app.use(compression());

// Parsing JSON avec limite de taille
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res: express.Response, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        res.status(400).json({
          success: false,
          message: "JSON invalide",
        });
        throw new Error("JSON invalide");
      }
    },
  })
);

// Parsing URL-encoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// LOGGING
// =====================================================

// Morgan pour les logs HTTP
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareFlow API fonctionne correctement",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});
// =====================================================
// ROUTES API
// =====================================================

// Documentation de l'API
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bienvenue sur l'API CareFlow Sénégal",
    version: "1.0.0",
    documentation: {
      auth: "/api/auth - Authentification et gestion des utilisateurs",
      referentials:
        "/api/referentials - Référentiels (régions, assureurs, établissements)",
      users: "/api/users - Gestion des utilisateurs",
      patients: "/api/patients - Gestion des patients",
      doctors: "/api/doctors - Gestion des médecins",
      appointments: "/api/appointments - Gestion des rendez-vous",
    },
    endpoints: {
      health: "GET /health - Vérification de l'état de l'API",
      swagger: "GET /api/docs - Documentation Swagger (à venir)",
    },
  });
});
// Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/referentials", referentialsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);
// =====================================================
// ROUTES 404 ET GESTION D'ERREURS
// =====================================================

// Route 404 pour les endpoints API non trouvés
app.use("/api", (req, res, next) => {
  // Si on arrive ici, c'est qu'aucune route /api/xxx n'a matché
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: `Endpoint non trouvé: ${req.method} ${req.originalUrl}`,
      availableEndpoints: [
        "GET /api",
        "POST /api/auth/login",
        "POST /api/auth/register",
        "GET /api/referentials/regions",
      ],
    });
  }
});
// Route 404 générale
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page non trouvée",
    suggestion: "Utilisez /api pour accéder à l'API",
  });
});

export default app;
