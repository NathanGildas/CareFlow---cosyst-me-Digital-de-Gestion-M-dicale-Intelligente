// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Interface pour les erreurs personnalisées
 */
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errors?: Record<string, string | string[]>;
  details?: Record<string, unknown>;
}

/**
 * Interface pour la réponse d'erreur standardisée
 */
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string | string[]>;
  stack?: string;
  details?: Record<string, unknown>;
}

/**
 * Types d'erreurs spécifiques à Prisma
 */
interface PrismaError extends Error {
  code: string;
  meta?: {
    target?: string[];
    field_name?: string;
    column?: string;
    constraint?: string;
  };
}

/**
 * Vérifier si l'erreur est une erreur Prisma
 */
const isPrismaError = (error: Error): error is PrismaError => {
  return 'code' in error && typeof (error as PrismaError).code === 'string';
};

/**
 * Vérifier si l'erreur est une erreur JWT
 */
const isJWTError = (error: Error): boolean => {
  return (
    error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'
  );
};

/**
 * Vérifier si l'erreur est une erreur de validation
 */
const isValidationError = (error: Error): boolean => {
  return error.name === 'ValidationError';
};

/**
 * Créer une erreur personnalisée
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: Record<string, string | string[]>
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.errors = errors;
  return error;
};

/**
 * Middleware de gestion des erreurs globales
 */
export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: CustomError = {
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
    } else {
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
      statusCode: (err as CustomError).statusCode || 500,
      code: (err as CustomError).code,
      errors: (err as CustomError).errors,
      details: (err as CustomError).details,
    };
  }

  // Construction de la réponse d'erreur
  const errorResponse: ErrorResponse = {
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

/**
 * Type générique pour les handlers async
 */
type AsyncHandler<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Utilitaire asyncHandler pour gérer les erreurs async/await
 */
export const asyncHandler = <T = Request>(fn: AsyncHandler<T>) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware 404 pour les routes non trouvées
 */
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = createError(
    `Ressource non trouvée - ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Middleware de validation des données d'entrée
 */
export const validateRequest = (schema: {
  body?: object;
  params?: object;
  query?: object;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

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
      const validationError = createError(
        'Erreur de validation des données',
        400,
        'VALIDATION_ERROR',
        errors
      );
      return next(validationError);
    }

    next();
  };
};

/**
 * Export par défaut
 */
export default {
  errorHandler,
  asyncHandler,
  notFound,
  createError,
  validateRequest,
};
