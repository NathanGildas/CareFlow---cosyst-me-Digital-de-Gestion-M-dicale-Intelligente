// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

/**
 * Interface pour les erreurs personnalisées
 */
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any;
}

/**
 * Middleware de gestion des erreurs globales
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * Utilitaire asyncHandler pour gérer les erreurs async/await
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
  const error = new Error(
    `Ressource non trouvée - ${req.originalUrl}`
  ) as CustomError;
  error.statusCode = 404;
  next(error);
};

export default {
  errorHandler,
  asyncHandler,
  notFound,
};
