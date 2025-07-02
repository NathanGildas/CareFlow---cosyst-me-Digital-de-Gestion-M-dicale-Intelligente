"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma = new client_1.PrismaClient();
// =====================================================
// SCHÉMAS DE VALIDATION
// =====================================================
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Format email invalide',
        'any.required': 'Email requis',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Mot de passe minimum 6 caractères',
        'any.required': 'Mot de passe requis',
    }),
    firstName: joi_1.default.string().min(2).max(50).required().messages({
        'string.min': 'Prénom minimum 2 caractères',
        'string.max': 'Prénom maximum 50 caractères',
        'any.required': 'Prénom requis',
    }),
    lastName: joi_1.default.string().min(2).max(50).required().messages({
        'string.min': 'Nom minimum 2 caractères',
        'string.max': 'Nom maximum 50 caractères',
        'any.required': 'Nom requis',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+221[0-9]{9}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format téléphone sénégalais requis (+221XXXXXXXXX)',
    }),
    role: joi_1.default.string().valid('PATIENT', 'DOCTOR', 'INSURER').default('PATIENT'),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
    rememberMe: joi_1.default.boolean().optional(), // Ajouter ce champ optionnel
});
const refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
// =====================================================
// CONTROLLERS
// =====================================================
/**
 * Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        // Validation des données
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        const { email, password, firstName, lastName, phone, role } = value;
        // Vérification si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà',
            });
            return;
        }
        // Hachage du mot de passe
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Création de l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });
        // Génération des tokens (valeurs par défaut pour l'inscription)
        const tokens = (0, authMiddleware_1.generateTokens)({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        }); // Utilise les valeurs par défaut (24h access, 7d refresh)
        console.log(`✅ Inscription réussie pour: ${user.email}`);
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType,
            },
        });
    }
    catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'inscription",
        });
    }
};
exports.register = register;
/**
 * Connexion utilisateur
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        // Validation des données
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis',
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        const { email, password, rememberMe } = value;
        console.log(`🔐 Connexion utilisateur: ${email} (Remember Me: ${rememberMe})`);
        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect',
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Compte désactivé',
            });
            return;
        }
        // Vérification du mot de passe
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect',
            });
            return;
        }
        // Définir la durée des tokens selon rememberMe
        const accessTokenExpiry = rememberMe ? '30d' : '24h'; // 30 jours vs 24 heures
        const refreshTokenExpiry = rememberMe ? '90d' : '7d'; // 90 jours vs 7 jours
        console.log(`🔐 Génération tokens - Access: ${accessTokenExpiry}, Refresh: ${refreshTokenExpiry}`);
        // Génération des tokens avec durées personnalisées
        const tokens = (0, authMiddleware_1.generateTokens)({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        }, accessTokenExpiry, refreshTokenExpiry);
        // Retour des données (sans le mot de passe)
        const { password: _, ...userWithoutPassword } = user;
        console.log(`✅ Connexion réussie pour: ${user.email} (Remember Me: ${rememberMe})`);
        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: userWithoutPassword,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                // Informations supplémentaires pour le frontend
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType,
                rememberMe,
            },
        });
    }
    catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion',
        });
    }
};
exports.login = login;
/**
 * Rafraîchissement du token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
    try {
        const { error, value } = refreshTokenSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Refresh token requis',
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        const { refreshToken: token } = value;
        // Vérification du refresh token
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: 'Refresh token invalide ou expiré',
            });
            return;
        }
        // Vérifier que l'utilisateur existe encore et est actif
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
                message: 'Utilisateur non trouvé ou désactivé',
            });
            return;
        }
        // Générer de nouveaux tokens (durées par défaut car on ne sait pas si c'était "rememberMe")
        const tokens = (0, authMiddleware_1.generateTokens)({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        }); // Utilise les valeurs par défaut (24h access, 7d refresh)
        console.log(`🔄 Token rafraîchi pour: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Token rafraîchi avec succès',
            data: {
                user,
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType,
            },
        });
    }
    catch (error) {
        console.error('Erreur rafraîchissement token:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du rafraîchissement',
        });
    }
};
exports.refreshToken = refreshToken;
/**
 * Profil utilisateur connecté
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié',
            });
            return;
        }
        // Récupération du profil complet selon le rôle
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Relations selon le rôle
                patient: req.user.role === 'PATIENT'
                    ? {
                        select: {
                            id: true,
                            nationalId: true,
                            dateOfBirth: true,
                            gender: true,
                            region: true,
                            city: true,
                            bloodType: true,
                            chronicConditions: true,
                        },
                    }
                    : false,
                doctor: req.user.role === 'DOCTOR'
                    ? {
                        select: {
                            id: true,
                            licenseNumber: true,
                            specialty: true,
                            subSpecialty: true,
                            experienceYears: true,
                            consultationFee: true,
                            establishment: {
                                select: {
                                    id: true,
                                    name: true,
                                    city: true,
                                    region: true,
                                },
                            },
                        },
                    }
                    : false,
                insurer: req.user.role === 'INSURER'
                    ? {
                        select: {
                            id: true,
                            licenseNumber: true,
                            department: true,
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    }
                    : false,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        console.error('Erreur récupération profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};
exports.getProfile = getProfile;
/**
 * Mise à jour du profil
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié',
            });
            return;
        }
        const updateSchema = joi_1.default.object({
            firstName: joi_1.default.string().min(2).max(50).optional(),
            lastName: joi_1.default.string().min(2).max(50).optional(),
            phone: joi_1.default.string()
                .pattern(/^\+221[0-9]{9}$/)
                .optional(),
        });
        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        // Mise à jour de l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: value,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Profil mis à jour',
            data: { user: updatedUser },
        });
    }
    catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * Changement de mot de passe
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié',
            });
            return;
        }
        const schema = joi_1.default.object({
            currentPassword: joi_1.default.string().required(),
            newPassword: joi_1.default.string().min(6).required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        const { currentPassword, newPassword } = value;
        // Récupération du mot de passe actuel
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { password: true },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
            });
            return;
        }
        // Vérification du mot de passe actuel
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Mot de passe actuel incorrect',
            });
            return;
        }
        // Hachage du nouveau mot de passe
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Mise à jour
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({
            success: true,
            message: 'Mot de passe changé avec succès',
        });
    }
    catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
        });
    }
};
exports.changePassword = changePassword;
exports.default = {
    register: exports.register,
    login: exports.login,
    refreshToken: exports.refreshToken,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    changePassword: exports.changePassword,
};
//# sourceMappingURL=authController.js.map