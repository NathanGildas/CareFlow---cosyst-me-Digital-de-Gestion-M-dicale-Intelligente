"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app-debug.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Juste une route de test
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Debug OK" });
});
// Test 1 : Juste auth
const auth_1 = __importDefault(require("./routes/auth"));
app.use("/api/auth", auth_1.default);
// Test 2 : + referentials
const referentials_1 = __importDefault(require("./routes/referentials"));
app.use("/api/referentials", referentials_1.default);
// Test 3 : + patients
const patients_1 = __importDefault(require("./routes/patients"));
app.use("/api/patients", patients_1.default);
// Test 4 : + doctors
const doctors_1 = __importDefault(require("./routes/doctors"));
app.use("/api/doctors", doctors_1.default);
// Test 5 : + users
const users_1 = __importDefault(require("./routes/users"));
app.use("/api/users", users_1.default);
// Test 6 : + appointments
const appointments_1 = __importDefault(require("./routes/appointments"));
app.use("/api/appointments", appointments_1.default);
//Test 7 : + error handling
const errorHandler_1 = require("./middlewares/errorHandler");
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Configuration des variables d'environnement
dotenv_1.default.config();
// =====================================================
// MIDDLEWARES DE SÉCURITÉ
// =====================================================
// Helmet pour sécuriser les headers HTTP
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? ["https://careflow.sn", "https://app.careflow.sn"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
// Rate limiting global
const globalRateLimit = (0, express_rate_limit_1.default)({
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
app.use((0, compression_1.default)());
// Parsing JSON avec limite de taille
app.use(express_1.default.json({
    limit: "10mb",
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            res.status(400).json({
                success: false,
                message: "JSON invalide",
            });
            throw new Error("JSON invalide");
        }
    },
}));
// Parsing URL-encoded
app.use(express_1.default.urlencoded({
    extended: true,
    limit: "10mb",
}));
// =====================================================
// LOGGING
// =====================================================
// Morgan pour les logs HTTP
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined"));
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
            referentials: "/api/referentials - Référentiels (régions, assureurs, établissements)",
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
app.use("/api/auth", auth_1.default);
app.use("/api/referentials", referentials_1.default);
app.use("/api/users", users_1.default);
app.use("/api/patients", patients_1.default);
app.use("/api/doctors", doctors_1.default);
app.use("/api/appointments", appointments_1.default);
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
exports.default = app;
//# sourceMappingURL=app-debug.js.map