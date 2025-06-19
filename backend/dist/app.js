"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/app.ts - VERSION COMPLÈTE
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import des routes
const auth_1 = __importDefault(require("./routes/auth"));
// Import des middlewares
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// =====================================================
// MIDDLEWARES DE SÉCURITÉ
// =====================================================
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Trop de requêtes, veuillez réessayer plus tard",
    },
});
app.use("/api", limiter);
// Logging des requêtes
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => {
            logger_1.logger.info(message.trim());
        },
    },
}));
// =====================================================
// PARSING DES DONNÉES
// =====================================================
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
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
app.use("/api/auth", auth_1.default);
// =====================================================
// GESTION D'ERREURS
// =====================================================
// 404 Not Found
app.use(errorHandler_1.notFoundHandler);
// Global error handler
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map