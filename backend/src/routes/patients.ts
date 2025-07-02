// src/routes/patients.ts
import express, { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  authenticateToken,
  requireRole, // ✅ Fonction générique
  requireAdmin, // ✅ Middleware spécialisé
  requireDoctor, // ✅ Middleware spécialisé
  requirePatient, // ✅ Middleware spécialisé
  requireInsurer, // ✅ Middleware spécialisé
  requireOwnership, // ✅ Pour vérifier que le patient accède à ses propres données
} from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/patients/profile
 * @desc    Profil du patient connecté
 * @access  Private (Patient)
 */
router.get(
  '/profile',
  authenticateToken,
  requirePatient,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message:
        'Profil patient (utilisez /api/auth/profile pour plus de détails)',
      redirect: '/api/auth/profile',
      note: 'Endpoint spécialisé en développement - CARTE S1-04',
    });
  })
);

/**
 * @route   PUT /api/patients/profile
 * @desc    Mise à jour profil patient
 * @access  Private (Patient)
 */
router.put(
  '/profile',
  authenticateToken,
  requirePatient,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Mise à jour profil patient pas encore implémentée',
      note: 'Sera développé dans CARTE S2-01',
    });
  })
);

/**
 * @route   GET /api/patients/appointments
 * @desc    Rendez-vous du patient
 * @access  Private (Patient)
 */
router.get(
  '/appointments',
  authenticateToken,
  requirePatient,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Liste des rendez-vous patient pas encore implémentée',
      note: 'Sera développé dans CARTE S2-04',
    });
  })
);

export default router;
