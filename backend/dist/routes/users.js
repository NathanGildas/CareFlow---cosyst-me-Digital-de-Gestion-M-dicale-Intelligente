"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/users.ts
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/users
 * @desc    Liste des utilisateurs (Admin seulement)
 * @access  Private (Admin)
 */
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Gestion des utilisateurs pas encore implémentée',
        note: 'Sera développé dans CARTE S3-02 (Dashboard Admin)',
    });
}));
/**
 * @route   GET /api/users/me
 * @desc    Informations utilisateur connecté (redirige vers auth/profile)
 * @access  Private
 */
router.get('/me', authMiddleware_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Pour votre profil, utilisez /api/auth/profile',
        redirect: '/api/auth/profile',
        user: req.user,
    });
}));
/**
 * @route   PUT /api/users/:id
 * @desc    Mise à jour utilisateur (Admin seulement)
 * @access  Private (Admin)
 */
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    res.status(501).json({
        success: false,
        message: `Mise à jour utilisateur ${id} pas encore implémentée`,
        note: 'Sera développé dans CARTE S3-02 (Dashboard Admin)',
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map