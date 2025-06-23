// ===================================================================
// FICHIER: /src/middlewares/authMiddleware.ts
// Middleware d'authentification JWT pour CareFlow
// ===================================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "../utils/prisma";
import { logger } from "../utils/logger";

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// ===================================================================
// INTERFACE POUR LE PAYLOAD JWT
// ===================================================================

interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

// ===================================================================
// MIDDLEWARE PRINCIPAL D'AUTHENTIFICATION
// ===================================================================

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupération du token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token d'authentification manquant",
        code: "MISSING_TOKEN",
      });
      return;
    }

    // Vérification et décodage du token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      logger.error(
        "JWT_SECRET non configuré dans les variables d'environnement"
      );
      res.status(500).json({
        success: false,
        message: "Erreur de configuration du serveur",
      });
      return;
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError: any) {
      let message = "Token invalide";
      let code = "INVALID_TOKEN";

      if (jwtError.name === "TokenExpiredError") {
        message = "Token expiré";
        code = "EXPIRED_TOKEN";
      } else if (jwtError.name === "JsonWebTokenError") {
        message = "Format de token invalide";
        code = "MALFORMED_TOKEN";
      }

      res.status(401).json({
        success: false,
        message,
        code,
      });
      return;
    }

    // Vérification que l'utilisateur existe toujours et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: "Compte utilisateur désactivé",
        code: "USER_INACTIVE",
      });
      return;
    }

    // Vérification de cohérence des données du token
    if (user.email !== decoded.email || user.role !== decoded.role) {
      logger.warn(
        `Incohérence détectée pour l'utilisateur ${user.id}: token obsolète`
      );
      res.status(401).json({
        success: false,
        message: "Token obsolète, veuillez vous reconnecter",
        code: "STALE_TOKEN",
      });
      return;
    }

    // Ajout des informations utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    logger.error("Erreur dans le middleware d'authentification:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur lors de l'authentification",
    });
  }
};

// ===================================================================
// MIDDLEWARE D'AUTORISATION PAR RÔLE
// ===================================================================

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "AUTHENTICATION_REQUIRED",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(", ")}`,
        code: "INSUFFICIENT_PERMISSIONS",
        userRole: req.user.role,
        allowedRoles,
      });
      return;
    }

    next();
  };
};

// ===================================================================
// MIDDLEWARES SPÉCIALISÉS PAR RÔLE
// ===================================================================

// Middleware pour les administrateurs uniquement
export const requireAdmin = requireRole("ADMIN");

// Middleware pour les médecins uniquement
export const requireDoctor = requireRole("DOCTOR");

// Middleware pour les patients uniquement
export const requirePatient = requireRole("PATIENT");

// Middleware pour les assureurs uniquement
export const requireInsurer = requireRole("INSURER");

// Middleware pour les professionnels de santé (médecins + admin)
export const requireHealthcareProvider = requireRole("DOCTOR", "ADMIN");

// Middleware pour les gestionnaires (assureurs + admin)
export const requireManager = requireRole("INSURER", "ADMIN");

// ===================================================================
// MIDDLEWARE DE VÉRIFICATION DE PROPRIÉTÉ
// ===================================================================

export const requireOwnership = (resourceIdParam: string = "id") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Les admins ont accès à tout
      if (userRole === "ADMIN") {
        next();
        return;
      }

      // Vérification selon le type de ressource et le rôle
      const resourceType = req.route.path.split("/")[1]; // Ex: 'patients', 'doctors'

      switch (resourceType) {
        case "patients":
          // Un patient ne peut accéder qu'à ses propres données
          if (userRole === "PATIENT") {
            const patient = await prisma.patient.findUnique({
              where: { id: resourceId },
              select: { userId: true },
            });

            if (!patient || patient.userId !== userId) {
              res.status(403).json({
                success: false,
                message: "Accès refusé à cette ressource patient",
              });
              return;
            }
          }
          break;

        case "doctors":
          // Un médecin ne peut modifier que ses propres données
          if (userRole === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
              where: { id: resourceId },
              select: { userId: true },
            });

            if (!doctor || doctor.userId !== userId) {
              res.status(403).json({
                success: false,
                message: "Accès refusé à cette ressource médecin",
              });
              return;
            }
          }
          break;

        case "appointments":
          // Vérification complexe pour les rendez-vous
          const appointment = await prisma.appointment.findUnique({
            where: { id: resourceId },
            include: {
              patient: { select: { userId: true } },
              doctor: { select: { userId: true } },
            },
          });

          if (!appointment) {
            res.status(404).json({
              success: false,
              message: "Rendez-vous non trouvé",
            });
            return;
          }

          const hasAccess =
            (userRole === "PATIENT" && appointment.patient.userId === userId) ||
            (userRole === "DOCTOR" && appointment.doctor.userId === userId) ||
            userRole === "INSURER"; // Les assureurs peuvent voir les RDV pour facturation

          if (!hasAccess) {
            res.status(403).json({
              success: false,
              message: "Accès refusé à ce rendez-vous",
            });
            return;
          }
          break;

        default:
          // Pour les autres ressources, vérification générique
          if (resourceId !== userId) {
            res.status(403).json({
              success: false,
              message: "Accès refusé à cette ressource",
            });
            return;
          }
      }

      next();
    } catch (error) {
      logger.error("Erreur dans la vérification de propriété:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  };
};

// ===================================================================
// MIDDLEWARE OPTIONNEL D'AUTHENTIFICATION
// ===================================================================

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      // Pas de token, mais on continue sans utilisateur
      next();
      return;
    }

    // Si un token est fourni, on tente de l'authentifier
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    } catch (jwtError) {
      // Token invalide, mais on continue sans erreur
      logger.debug("Token invalide dans optionalAuth:", jwtError);
    }

    next();
  } catch (error) {
    logger.error("Erreur dans optionalAuth:", error);
    next(); // On continue malgré l'erreur
  }
};

// ===================================================================
// UTILITAIRE DE GÉNÉRATION DE TOKEN
// ===================================================================

export const generateTokens = (user: {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}) => {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h", // Token principal valide 24h
    issuer: "careflow-senegal",
    audience: "careflow-users",
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d", // Refresh token valide 7 jours
    issuer: "careflow-senegal",
    audience: "careflow-users",
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 24 * 60 * 60, // 24h en secondes
    tokenType: "Bearer",
  };
};

// ===================================================================
// MIDDLEWARE DE VALIDATION DU REFRESH TOKEN
// ===================================================================

export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token manquant",
      });
      return;
    }

    const JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;

    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: "Refresh token invalide",
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: "Refresh token expiré ou invalide",
      });
    }
  } catch (error) {
    logger.error("Erreur dans validateRefreshToken:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};
