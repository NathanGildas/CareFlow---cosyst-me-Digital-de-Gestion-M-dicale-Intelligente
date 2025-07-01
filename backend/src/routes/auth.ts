// src/routes/auth.ts
import express from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/authController';
import {
  authenticateToken,
  requireRole, // ✅ Fonction générique
  requireAdmin, // ✅ Middleware spécialisé
  requireDoctor, // ✅ Middleware spécialisé
  requirePatient, // ✅ Middleware spécialisé
  requireInsurer, // ✅ Middleware spécialisé
} from '../middlewares/authMiddleware';

const router = express.Router();

// =====================================================
// RATE LIMITING POUR LA SÉCURITÉ
// =====================================================

// Rate limiting pour les tentatives de connexion
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 80, // 5 tentatives max par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour les inscriptions
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 80, // 3 inscriptions max par IP
  message: {
    success: false,
    message: "Trop d'inscriptions depuis cette IP. Réessayez dans 1 heure.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting général pour les autres endpoints auth
const authRateLimit = rateLimit({
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
router.post('/register', registerRateLimit, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginRateLimit, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchissement du token JWT
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh', authRateLimit, authController.refreshToken);

// =====================================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// =====================================================

/**
 * @route   GET /api/auth/profile
 * @desc    Récupération du profil utilisateur connecté
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Mise à jour du profil utilisateur
 * @access  Private
 * @body    { firstName?, lastName?, phone? }
 */
router.put(
  '/profile',
  authenticateToken,
  authRateLimit,
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Changement de mot de passe
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put(
  '/change-password',
  authenticateToken,
  authRateLimit,
  authController.changePassword
);

// =====================================================
// ROUTE DE VÉRIFICATION (HEALTH CHECK)
// =====================================================

/**
 * @route   GET /api/auth/verify
 * @desc    Vérification de la validité du token
 * @access  Private
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token valide',
    data: {
      user: req.user,
    },
  });
});

export default router;
