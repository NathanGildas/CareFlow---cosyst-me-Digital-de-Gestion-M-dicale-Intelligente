// ===================================================================
// FICHIER: /src/app.ts
// Application Express mise à jour avec toutes les nouvelles routes
// ===================================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { specs, swaggerUi } from "./utils/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";

// Import des routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import patientRoutes from "./routes/patients";
import doctorRoutes from "./routes/doctors";
import appointmentRoutes from "./routes/appointments";
import referentialRoutes from "./routes/referentials";
import establishmentRoutes from "./routes/establishments";

const app = express();

// ===================================================================
// MIDDLEWARES DE SÉCURITÉ ET PERFORMANCE
// ===================================================================

// Sécurité de base
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// CORS configuré pour le développement et la production
const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [
      "http://localhost:3000", // React dev
      "http://localhost:5173", // Vite dev
      "https://careflow.sn", // Production frontend
      "https://app.careflow.sn", // Production app
    ];

    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par la politique CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Compression des réponses
app.use(compression());

// Parsing JSON et URL-encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par IP par fenêtre
  message: {
    success: false,
    message: "Trop de requêtes de cette IP, réessayez dans 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 tentatives de connexion max
  message: {
    success: false,
    message: "Trop de tentatives de connexion, réessayez dans 15 minutes",
  },
});

// Logging des requêtes
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// ===================================================================
// ROUTES DE BASE ET SANTÉ
// ===================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    database: "connected", // TODO: Ajouter vrai check DB
    redis: "connected", // TODO: Ajouter vrai check Redis
  };

  res.status(200).json(healthCheck);
});

// Documentation API avec Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "CareFlow Sénégal API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  })
);

// Endpoint de documentation API simple
app.get("/api", (req, res) => {
  res.json({
    name: "CareFlow Sénégal API",
    version: "1.0.0",
    description:
      "API complète pour la plateforme e-santé adaptée au contexte sénégalais",
    documentation: {
      swagger: "/api-docs",
      postman: "/api/postman-collection",
    },
    endpoints: {
      authentication: "/api/auth",
      users: "/api/users",
      patients: "/api/patients",
      doctors: "/api/doctors",
      appointments: "/api/appointments",
      referentials: "/api/referentials",
      establishments: "/api/establishments",
    },
    features: [
      "Authentification JWT multi-rôles",
      "Gestion des patients, médecins, assureurs",
      "Système de rendez-vous médical",
      "Référentiels sénégalais complets",
      "Gestion des établissements de santé",
      "Intégration assurances locales",
      "API RESTful avec documentation Swagger",
    ],
    contact: {
      developer: "Nathan Aklikokou",
      email: "nathan@careflow.sn",
      github: "https://github.com/careflow-senegal",
    },
  });
});

// ===================================================================
// ROUTES PRINCIPALES
// ===================================================================

// Routes d'authentification avec limitation de taux
app.use("/api/auth", authLimiter, authRoutes);

// Routes des référentiels (accès public)
app.use("/api/referentials", referentialRoutes);

// Routes des établissements
app.use("/api/establishments", establishmentRoutes);

// Routes utilisateurs (authentification requise)
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// ===================================================================
// ROUTES UTILITAIRES SUPPLÉMENTAIRES
// ===================================================================

// Export collection Postman
app.get("/api/postman-collection", (req, res) => {
  const postmanCollection = {
    info: {
      name: "CareFlow Sénégal API",
      description: "Collection complète des endpoints CareFlow",
      version: "1.0.0",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{jwt_token}}",
          type: "string",
        },
      ],
    },
    variable: [
      {
        key: "baseUrl",
        value: "http://localhost:4000",
        type: "string",
      },
      {
        key: "jwt_token",
        value: "",
        type: "string",
      },
    ],
    item: [
      {
        name: "Authentication",
        item: [
          {
            name: "Register",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    email: "test@example.com",
                    password: "password123",
                    firstName: "Test",
                    lastName: "User",
                    phone: "+221771234567",
                    role: "PATIENT",
                  },
                  null,
                  2
                ),
              },
              url: {
                raw: "{{baseUrl}}/api/auth/register",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "register"],
              },
            },
          },
          {
            name: "Login",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    email: "test@example.com",
                    password: "password123",
                  },
                  null,
                  2
                ),
              },
              url: {
                raw: "{{baseUrl}}/api/auth/login",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "login"],
              },
            },
          },
        ],
      },
      {
        name: "Referentials",
        item: [
          {
            name: "Get Regions",
            request: {
              method: "GET",
              url: {
                raw: "{{baseUrl}}/api/referentials/regions",
                host: ["{{baseUrl}}"],
                path: ["api", "referentials", "regions"],
              },
            },
          },
          {
            name: "Get Medical Specialties",
            request: {
              method: "GET",
              url: {
                raw: "{{baseUrl}}/api/referentials/medical-specialties",
                host: ["{{baseUrl}}"],
                path: ["api", "referentials", "medical-specialties"],
              },
            },
          },
          {
            name: "Get Insurance Companies",
            request: {
              method: "GET",
              url: {
                raw: "{{baseUrl}}/api/referentials/insurance-companies",
                host: ["{{baseUrl}}"],
                path: ["api", "referentials", "insurance-companies"],
              },
            },
          },
        ],
      },
      {
        name: "Establishments",
        item: [
          {
            name: "Search Establishments",
            request: {
              method: "GET",
              url: {
                raw: "{{baseUrl}}/api/establishments?region=DAKAR&hasEmergency=true",
                host: ["{{baseUrl}}"],
                path: ["api", "establishments"],
                query: [
                  {
                    key: "region",
                    value: "DAKAR",
                  },
                  {
                    key: "hasEmergency",
                    value: "true",
                  },
                ],
              },
            },
          },
          {
            name: "Get Establishment Details",
            request: {
              method: "GET",
              url: {
                raw: "{{baseUrl}}/api/establishments/{{establishment_id}}",
                host: ["{{baseUrl}}"],
                path: ["api", "establishments", "{{establishment_id}}"],
              },
            },
          },
        ],
      },
    ],
  };

  res.json(postmanCollection);
});

// Route pour les statistiques générales de l'API
app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      requests: {
        total: "~" + Math.floor(Math.random() * 10000), // Simulation
        today: "~" + Math.floor(Math.random() * 1000),
      },
      endpoints: {
        authentication: 4,
        referentials: 4,
        establishments: 6,
        users: 5,
        total: 19,
      },
      database: {
        status: "connected",
        regions: 14,
        specialties: 12,
        insuranceCompanies: 5,
      },
    },
  });
});

// ===================================================================
// GESTION DES ERREURS
// ===================================================================

// Route 404 pour toutes les autres requêtes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
    availableEndpoints: {
      documentation: "/api-docs",
      health: "/health",
      api_info: "/api",
      authentication: "/api/auth",
      referentials: "/api/referentials",
      establishments: "/api/establishments",
    },
  });
});

// Middleware de gestion globale des erreurs
app.use(errorHandler);

// ===================================================================
// GESTION DES PROCESSUS
// ===================================================================

// Gestion gracieuse de l'arrêt
process.on("SIGTERM", () => {
  logger.info("SIGTERM reçu, arrêt gracieux du serveur...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT reçu, arrêt gracieux du serveur...");
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  logger.error("Exception non capturée:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Promesse rejetée non gérée:", reason);
  process.exit(1);
});

export default app;
