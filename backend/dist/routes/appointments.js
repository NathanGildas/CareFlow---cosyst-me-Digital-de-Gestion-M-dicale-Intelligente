"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/appointments.ts
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/appointments
 * @desc    Liste des rendez-vous (basique pour l'instant)
 * @access  Private
 */
router.get('/', authMiddleware_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Liste des rendez-vous',
        data: {
            appointments: [],
            note: 'Endpoint en développement - CARTE S1-04',
        },
    });
}));
/**
 * @route   POST /api/appointments
 * @desc    Créer un nouveau rendez-vous
 * @access  Private (Patient)
 */
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Création de rendez-vous pas encore implémentée',
        note: 'Sera développé dans CARTE S2-04',
    });
}));
/**
 * @route   GET /api/appointments/:id
 * @desc    Détails d'un rendez-vous
 * @access  Private
 */
router.get('/:id', authMiddleware_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    res.status(501).json({
        success: false,
        message: `Détails du rendez-vous ${id} pas encore implémentés`,
        note: 'Sera développé dans CARTE S2-04',
    });
}));
exports.default = router;
//# sourceMappingURL=appointments.js.map