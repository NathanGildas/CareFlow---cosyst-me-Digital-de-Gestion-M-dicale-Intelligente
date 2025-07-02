"use strict";
// ===================================================================
// FICHIER: /src/middlewares/authMiddleware.ts
// Middleware d'authentification JWT pour CareFlow
// ===================================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.generateSingleToken = exports.generateTokens = exports.optionalAuth = exports.requireOwnership = exports.requireManager = exports.requireHealthcareProvider = exports.requireInsurer = exports.requirePatient = exports.requireDoctor = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const logger_1 = require("../utils/logger");
// ===================================================================
// MIDDLEWARE PRINCIPAL D'AUTHENTIFICATION
// ===================================================================
const authenticateToken = async (req, res, next) => {
    try {
        // Récupération du token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Token d'authentification manquant",
                code: 'MISSING_TOKEN',
            });
            return;
        }
        // Vérification et décodage du token
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            logger_1.logger.error("JWT_SECRET non configuré dans les variables d'environnement");
            res.status(500).json({
                success: false,
                message: 'Erreur de configuration du serveur',
            });
            return;
        }
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        }
        catch (jwtError) {
            let message = 'Token invalide';
            let code = 'INVALID_TOKEN';
            if (jwtError.name === 'TokenExpiredError') {
                message = 'Token expiré';
                code = 'EXPIRED_TOKEN';
            }
            else if (jwtError.name === 'JsonWebTokenError') {
                message = 'Format de token invalide';
                code = 'MALFORMED_TOKEN';
            }
            res.status(401).json({
                success: false,
                message,
                code,
            });
            return;
        }
        // Vérification que l'utilisateur existe toujours et est actif
        const user = await prisma_1.default.user.findUnique({
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
                message: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND',
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Compte utilisateur désactivé',
                code: 'USER_INACTIVE',
            });
            return;
        }
        // Vérification de cohérence des données du token
        if (user.email !== decoded.email || user.role !== decoded.role) {
            logger_1.logger.warn(`Incohérence détectée pour l'utilisateur ${user.id}: token obsolète`);
            res.status(401).json({
                success: false,
                message: 'Token obsolète, veuillez vous reconnecter',
                code: 'STALE_TOKEN',
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
    }
    catch (error) {
        logger_1.logger.error("Erreur dans le middleware d'authentification:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de l'authentification",
        });
    }
};
exports.authenticateToken = authenticateToken;
// ===================================================================
// MIDDLEWARE D'AUTORISATION PAR RÔLE
// ===================================================================
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentification requise',
                code: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`,
                code: 'INSUFFICIENT_PERMISSIONS',
                userRole: req.user.role,
                allowedRoles,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// ===================================================================
// MIDDLEWARES SPÉCIALISÉS PAR RÔLE
// ===================================================================
// Middleware pour les administrateurs uniquement
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
// Middleware pour les médecins uniquement
exports.requireDoctor = (0, exports.requireRole)('DOCTOR');
// Middleware pour les patients uniquement
exports.requirePatient = (0, exports.requireRole)('PATIENT');
// Middleware pour les assureurs uniquement
exports.requireInsurer = (0, exports.requireRole)('INSURER');
// Middleware pour les professionnels de santé (médecins + admin)
exports.requireHealthcareProvider = (0, exports.requireRole)('DOCTOR', 'ADMIN');
// Middleware pour les gestionnaires (assureurs + admin)
exports.requireManager = (0, exports.requireRole)('INSURER', 'ADMIN');
// ===================================================================
// MIDDLEWARE DE VÉRIFICATION DE PROPRIÉTÉ
// ===================================================================
const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentification requise',
                });
                return;
            }
            const resourceId = req.params[resourceIdParam];
            const userId = req.user.id;
            const userRole = req.user.role;
            // Les admins ont accès à tout
            if (userRole === 'ADMIN') {
                next();
                return;
            }
            // Vérification selon le type de ressource et le rôle
            const resourceType = req.route.path.split('/')[1]; // Ex: 'patients', 'doctors'
            switch (resourceType) {
                case 'patients':
                    // Un patient ne peut accéder qu'à ses propres données
                    if (userRole === 'PATIENT') {
                        const patient = await prisma_1.default.patient.findUnique({
                            where: { id: resourceId },
                            select: { userId: true },
                        });
                        if (!patient || patient.userId !== userId) {
                            res.status(403).json({
                                success: false,
                                message: 'Accès refusé à cette ressource patient',
                            });
                            return;
                        }
                    }
                    break;
                case 'doctors':
                    // Un médecin ne peut modifier que ses propres données
                    if (userRole === 'DOCTOR') {
                        const doctor = await prisma_1.default.doctor.findUnique({
                            where: { id: resourceId },
                            select: { userId: true },
                        });
                        if (!doctor || doctor.userId !== userId) {
                            res.status(403).json({
                                success: false,
                                message: 'Accès refusé à cette ressource médecin',
                            });
                            return;
                        }
                    }
                    break;
                case 'appointments':
                    // Vérification complexe pour les rendez-vous
                    const appointment = await prisma_1.default.appointment.findUnique({
                        where: { id: resourceId },
                        include: {
                            patient: { select: { userId: true } },
                            doctor: { select: { userId: true } },
                        },
                    });
                    if (!appointment) {
                        res.status(404).json({
                            success: false,
                            message: 'Rendez-vous non trouvé',
                        });
                        return;
                    }
                    const hasAccess = (userRole === 'PATIENT' && appointment.patient.userId === userId) ||
                        (userRole === 'DOCTOR' && appointment.doctor.userId === userId) ||
                        userRole === 'INSURER'; // Les assureurs peuvent voir les RDV pour facturation
                    if (!hasAccess) {
                        res.status(403).json({
                            success: false,
                            message: 'Accès refusé à ce rendez-vous',
                        });
                        return;
                    }
                    break;
                default:
                    // Pour les autres ressources, vérification générique
                    if (resourceId !== userId) {
                        res.status(403).json({
                            success: false,
                            message: 'Accès refusé à cette ressource',
                        });
                        return;
                    }
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Erreur dans la vérification de propriété:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur',
            });
        }
    };
};
exports.requireOwnership = requireOwnership;
// ===================================================================
// MIDDLEWARE OPTIONNEL D'AUTHENTIFICATION
// ===================================================================
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
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
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await prisma_1.default.user.findUnique({
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
        }
        catch (jwtError) {
            // Token invalide, mais on continue sans erreur
            logger_1.logger.debug('Token invalide dans optionalAuth:', jwtError);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Erreur dans optionalAuth:', error);
        next(); // On continue malgré l'erreur
    }
};
exports.optionalAuth = optionalAuth;
// ===================================================================
// UTILITAIRE DE GÉNÉRATION DE TOKEN
// ===================================================================
const generateTokens = (user, accessTokenExpiry = '24h', refreshTokenExpiry = '7d') => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET non défini');
    }
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    };
    try {
        // Utilisation explicite de jwt.sign avec cast de type si nécessaire
        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: accessTokenExpiry,
            issuer: 'careflow-senegal',
            audience: 'careflow-users',
        });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: refreshTokenExpiry,
            issuer: 'careflow-senegal',
            audience: 'careflow-users',
        });
        // Calculer expiresIn en secondes
        let expiresInSeconds = 24 * 60 * 60; // défaut 24h
        if (accessTokenExpiry.endsWith('d')) {
            expiresInSeconds = parseInt(accessTokenExpiry) * 24 * 60 * 60;
        }
        else if (accessTokenExpiry.endsWith('h')) {
            expiresInSeconds = parseInt(accessTokenExpiry) * 60 * 60;
        }
        return {
            accessToken,
            refreshToken,
            expiresIn: expiresInSeconds,
            tokenType: 'Bearer',
        };
    }
    catch (error) {
        console.error('Erreur génération tokens:', error);
        throw new Error('Impossible de générer les tokens');
    }
};
exports.generateTokens = generateTokens;
const generateSingleToken = (user, expiry = '24h') => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET non défini');
    }
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    };
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: expiry,
            issuer: 'careflow-senegal',
            audience: 'careflow-users',
        });
    }
    catch (error) {
        console.error('Erreur génération token:', error);
        throw new Error('Impossible de générer le token');
    }
};
exports.generateSingleToken = generateSingleToken;
// ===================================================================
// MIDDLEWARE DE VALIDATION DU REFRESH TOKEN
// ===================================================================
const validateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token manquant',
            });
            return;
        }
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        try {
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await prisma_1.default.user.findUnique({
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
                    message: 'Refresh token invalide',
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
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: 'Refresh token expiré ou invalide',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Erreur dans validateRefreshToken:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
        });
    }
};
exports.validateRefreshToken = validateRefreshToken;
//# sourceMappingURL=authMiddleware.js.map