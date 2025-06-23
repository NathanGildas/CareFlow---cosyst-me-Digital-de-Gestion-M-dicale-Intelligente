"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// =====================================================
// RATE LIMITING POUR LA SÉCURITÉ
// =====================================================
// Rate limiting pour les tentatives de connexion
const loginRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max par IP
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting pour les inscriptions
const registerRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // 3 inscriptions max par IP
    message: {
        success: false,
        message: "Trop d'inscriptions depuis cette IP. Réessayez dans 1 heure.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting général pour les autres endpoints auth
const authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requêtes max
    message: {
        success: false,
        message: 'Trop de requêtes. Réessayez dans 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// =====================================================
// ROUTES PUBLIQUES
// =====================================================
/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 * @body    { email, password, firstName, lastName, phone?, role? }
 */
router.post('/register', registerRateLimit, authController_1.default.register);
/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginRateLimit, authController_1.default.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchissement du token JWT
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh', authRateLimit, authController_1.default.refreshToken);
// =====================================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// =====================================================
/**
 * @route   GET /api/auth/profile
 * @desc    Récupération du profil utilisateur connecté
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/profile', authMiddleware_1.authenticateToken, authController_1.default.getProfile);
/**
 * @route   PUT /api/auth/profile
 * @desc    Mise à jour du profil utilisateur
 * @access  Private
 * @body    { firstName?, lastName?, phone? }
 */
router.put('/profile', authMiddleware_1.authenticateToken, authRateLimit, authController_1.default.updateProfile);
/**
 * @route   PUT /api/auth/change-password
 * @desc    Changement de mot de passe
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put('/change-password', authMiddleware_1.authenticateToken, authRateLimit, authController_1.default.changePassword);
// =====================================================
// ROUTE DE VÉRIFICATION (HEALTH CHECK)
// =====================================================
/**
 * @route   GET /api/auth/verify
 * @desc    Vérification de la validité du token
 * @access  Private
 */
router.get('/verify', authMiddleware_1.authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token valide',
        data: {
            user: req.user,
        },
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map