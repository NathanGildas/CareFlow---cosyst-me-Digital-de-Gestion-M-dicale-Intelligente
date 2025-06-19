// backend/src/middlewares/errorHandler.ts - TYPES CORRIGÉS
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger";

// =====================================================
// TYPES D'ERREURS
// =====================================================

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// =====================================================
// WRAPPER ASYNC POUR CONTROLLERS
// =====================================================

export const errorHandler = (fn: Function) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
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
    } catch (error) {
      next(error);
    }
  };
};

// =====================================================
// MIDDLEWARE GLOBAL DE GESTION D'ERREURS
// =====================================================

export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error: ${error.message}`);
  logger.error(`Stack: ${error.stack}`);

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

// =====================================================
// MIDDLEWARE 404 NOT FOUND
// =====================================================

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
  });
};
