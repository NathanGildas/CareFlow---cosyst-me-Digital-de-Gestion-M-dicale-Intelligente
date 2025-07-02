"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.notFound = exports.asyncHandler = exports.errorHandler = exports.createError = void 0;
/**
 * Vérifier si l'erreur est une erreur Prisma
 */
const isPrismaError = (error) => {
    return 'code' in error && typeof error.code === 'string';
};
/**
 * Vérifier si l'erreur est une erreur JWT
 */
const isJWTError = (error) => {
    return (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError');
};
/**
 * Vérifier si l'erreur est une erreur de validation
 */
const isValidationError = (error) => {
    return error.name === 'ValidationError';
};
/**
 * Créer une erreur personnalisée
 */
const createError = (message, statusCode = 500, code, errors) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.errors = errors;
    return error;
};
exports.createError = createError;
/**
 * Middleware de gestion des erreurs globales
 */
const errorHandler = (err, req, res, next) => {
    let error = {
        name: err.name,
        message: err.message,
        statusCode: 500,
        stack: err.stack,
    };
    // Log de l'erreur pour le debugging
    console.error('🚨 Erreur:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    // Gestion des erreurs Prisma
    if (isPrismaError(err)) {
        switch (err.code) {
            case 'P2002':
                error = {
                    ...error,
                    statusCode: 409,
                    code: 'DUPLICATE_ENTRY',
                    message: 'Ressource déjà existante',
                    errors: {
                        field: err.meta?.target || ['unknown'],
                    },
                };
                break;
            case 'P2025':
                error = {
                    ...error,
                    statusCode: 404,
                    code: 'NOT_FOUND',
                    message: 'Ressource non trouvée',
                };
                break;
            case 'P2003':
                error = {
                    ...error,
                    statusCode: 400,
                    code: 'FOREIGN_KEY_CONSTRAINT',
                    message: 'Contrainte de clé étrangère violée',
                };
                break;
            case 'P2014':
                error = {
                    ...error,
                    statusCode: 400,
                    code: 'INVALID_RELATION',
                    message: 'Relation invalide détectée',
                };
                break;
            default:
                error = {
                    ...error,
                    statusCode: 500,
                    code: 'DATABASE_ERROR',
                    message: 'Erreur de base de données',
                };
        }
    }
    // Gestion des erreurs de validation
    else if (isValidationError(err)) {
        error = {
            ...error,
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Données de validation invalides',
        };
    }
    // Gestion des erreurs JWT
    else if (isJWTError(err)) {
        if (err.name === 'TokenExpiredError') {
            error = {
                ...error,
                statusCode: 401,
                code: 'TOKEN_EXPIRED',
                message: 'Token expiré',
            };
        }
        else {
            error = {
                ...error,
                statusCode: 401,
                code: 'INVALID_TOKEN',
                message: 'Token invalide',
            };
        }
    }
    // Gestion des erreurs personnalisées
    else if ('statusCode' in err) {
        error = {
            ...error,
            statusCode: err.statusCode || 500,
            code: err.code,
            errors: err.errors,
            details: err.details,
        };
    }
    // Construction de la réponse d'erreur
    const errorResponse = {
        success: false,
        message: error.message || 'Erreur serveur interne',
        ...(error.code && { code: error.code }),
        ...(error.statusCode && { statusCode: error.statusCode }),
        ...(error.errors && { errors: error.errors }),
    };
    // Ajouter la stack trace en développement
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = error.details;
    }
    res.status(error.statusCode || 500).json(errorResponse);
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
    const error = (0, exports.createError)(`Ressource non trouvée - ${req.originalUrl}`, 404, 'NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
/**
 * Middleware de validation des données d'entrée
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = {};
        // Validation du body
        if (schema.body) {
            // Ici vous pouvez intégrer votre logique de validation (Joi, Yup, etc.)
            // Pour l'exemple, on assume que la validation est ok
        }
        // Validation des params
        if (schema.params) {
            // Logique de validation des paramètres
        }
        // Validation de la query
        if (schema.query) {
            // Logique de validation de la query
        }
        if (Object.keys(errors).length > 0) {
            const validationError = (0, exports.createError)('Erreur de validation des données', 400, 'VALIDATION_ERROR', errors);
            return next(validationError);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
/**
 * Export par défaut
 */
exports.default = {
    errorHandler: exports.errorHandler,
    asyncHandler: exports.asyncHandler,
    notFound: exports.notFound,
    createError: exports.createError,
    validateRequest: exports.validateRequest,
};
//# sourceMappingURL=errorHandler.js.map