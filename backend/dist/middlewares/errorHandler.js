"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.globalErrorHandler = exports.errorHandler = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
// =====================================================
// WRAPPER ASYNC POUR CONTROLLERS
// =====================================================
const errorHandler = (fn) => {
    return async (req, res, next) => {
        try {
            // Vérification des erreurs de validation
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Erreurs de validation",
                    errors: errors.array(),
                });
                return;
            }
            // Exécution du controller
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.errorHandler = errorHandler;
// =====================================================
// MIDDLEWARE GLOBAL DE GESTION D'ERREURS
// =====================================================
const globalErrorHandler = (error, req, res, next) => {
    logger_1.logger.error(`Error: ${error.message}`);
    logger_1.logger.error(`Stack: ${error.stack}`);
    // Erreur base de données Prisma
    if (error.code === "P2002") {
        res.status(409).json({
            success: false,
            message: "Conflit de données - enregistrement déjà existant",
            code: error.code,
        });
        return;
    }
    // Erreur JWT
    if (error.name === "JsonWebTokenError") {
        res.status(401).json({
            success: false,
            message: "Token JWT invalide",
        });
        return;
    }
    if (error.name === "TokenExpiredError") {
        res.status(401).json({
            success: false,
            message: "Token JWT expiré",
        });
        return;
    }
    // Erreur de validation
    if (error.name === "ValidationError") {
        res.status(400).json({
            success: false,
            message: "Erreur de validation",
            details: error.details,
        });
        return;
    }
    // Erreur générique
    const statusCode = error.statusCode || 500;
    const message = error.message || "Erreur interne du serveur";
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            details: error.details,
        }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
// =====================================================
// MIDDLEWARE 404 NOT FOUND
// =====================================================
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} non trouvée`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map