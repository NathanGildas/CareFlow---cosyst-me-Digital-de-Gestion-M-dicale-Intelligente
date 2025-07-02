// src/routes/doctors.ts
import express, { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  authenticateToken,
  requireRole, // ✅ Fonction générique
  requireAdmin, // ✅ Middleware spécialisé
  requireDoctor, // ✅ Middleware spécialisé
  requirePatient, // ✅ Middleware spécialisé
  requireInsurer, // ✅ Middleware spécialisé
  requireHealthcareProvider, // ✅ Middleware spécialisé
} from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Liste des médecins (redirige vers referentials pour l'instant)
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Pour la liste des médecins, utilisez /api/referentials/doctors',
      redirect: '/api/referentials/doctors',
      note: 'Endpoint spécialisé en développement - CARTE S1-04',
    });
  })
);

/**
 * @route   GET /api/doctors/profile
 * @desc    Profil du médecin connecté
 * @access  Private (Doctor)
 */
router.get(
  '/profile',
  authenticateToken,
  requireDoctor,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Profil médecin pas encore implémenté',
      note: 'Sera développé dans CARTE S2-03',
    });
  })
);

/**
 * @route   PUT /api/doctors/profile
 * @desc    Mise à jour profil médecin
 * @access  Private (Doctor)
 */
router.put(
  '/profile',
  authenticateToken,
  requireDoctor,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Mise à jour profil médecin pas encore implémentée',
      note: 'Sera développé dans CARTE S2-03',
    });
  })
);

export default router;
