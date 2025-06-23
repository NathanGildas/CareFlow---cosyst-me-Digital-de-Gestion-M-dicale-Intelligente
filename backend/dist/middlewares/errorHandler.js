"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.asyncHandler = exports.errorHandler = void 0;
/**
 * Middleware de gestion des erreurs globales
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log de l'erreur pour le debugging
    console.error("🚨 Erreur:", err);
    // Erreur de validation Mongoose/Prisma
    if (err.name === "ValidationError") {
        const message = "Données de validation invalides";
        error = {
            ...error,
            statusCode: 400,
            message,
        };
    }
    // Erreur de duplication (unique constraint)
    if (err.code === "P2002") {
        const message = "Ressource déjà existante";
        error = {
            ...error,
            statusCode: 409,
            message,
        };
    }
    // Erreur de ressource non trouvée
    if (err.code === "P2025") {
        const message = "Ressource non trouvée";
        error = {
            ...error,
            statusCode: 404,
            message,
        };
    }
    // Erreur JWT
    if (err.name === "JsonWebTokenError") {
        const message = "Token invalide";
        error = {
            ...error,
            statusCode: 401,
            message,
        };
    }
    // Erreur JWT expiré
    if (err.name === "TokenExpiredError") {
        const message = "Token expiré";
        error = {
            ...error,
            statusCode: 401,
            message,
        };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Erreur serveur interne",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            details: err,
        }),
    });
};
exports.errorHandler = errorHandler;
/**
 * Utilitaire asyncHandler pour gérer les erreurs async/await
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Middleware 404 pour les routes non trouvées
 */
const notFound = (req, res, next) => {
    const error = new Error(`Ressource non trouvée - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
exports.default = {
    errorHandler: exports.errorHandler,
    asyncHandler: exports.asyncHandler,
    notFound: exports.notFound,
};
//# sourceMappingURL=errorHandler.js.map