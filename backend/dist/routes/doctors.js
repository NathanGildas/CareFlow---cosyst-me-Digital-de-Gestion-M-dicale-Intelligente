"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/doctors.ts
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/doctors
 * @desc    Liste des médecins (redirige vers referentials pour l'instant)
 * @access  Public
 */
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Pour la liste des médecins, utilisez /api/referentials/doctors',
        redirect: '/api/referentials/doctors',
        note: 'Endpoint spécialisé en développement - CARTE S1-04',
    });
}));
/**
 * @route   GET /api/doctors/profile
 * @desc    Profil du médecin connecté
 * @access  Private (Doctor)
 */
router.get('/profile', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Profil médecin pas encore implémenté',
        note: 'Sera développé dans CARTE S2-03',
    });
}));
/**
 * @route   PUT /api/doctors/profile
 * @desc    Mise à jour profil médecin
 * @access  Private (Doctor)
 */
router.put('/profile', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Mise à jour profil médecin pas encore implémentée',
        note: 'Sera développé dans CARTE S2-03',
    });
}));
exports.default = router;
//# sourceMappingURL=doctors.js.map