"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/patients.ts
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/patients/profile
 * @desc    Profil du patient connecté
 * @access  Private (Patient)
 */
router.get('/profile', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Profil patient (utilisez /api/auth/profile pour plus de détails)',
        redirect: '/api/auth/profile',
        note: 'Endpoint spécialisé en développement - CARTE S1-04',
    });
}));
/**
 * @route   PUT /api/patients/profile
 * @desc    Mise à jour profil patient
 * @access  Private (Patient)
 */
router.put('/profile', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Mise à jour profil patient pas encore implémentée',
        note: 'Sera développé dans CARTE S2-01',
    });
}));
/**
 * @route   GET /api/patients/appointments
 * @desc    Rendez-vous du patient
 * @access  Private (Patient)
 */
router.get('/appointments', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Liste des rendez-vous patient pas encore implémentée',
        note: 'Sera développé dans CARTE S2-04',
    });
}));
exports.default = router;
//# sourceMappingURL=patients.js.map