// src/routes/appointments.ts
import express, { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  authenticateToken,
  requireRole, // ✅ Fonction générique
  requireAdmin, // ✅ Middleware spécialisé
  requireDoctor, // ✅ Middleware spécialisé
  requirePatient, // ✅ Middleware spécialisé
  requireInsurer, // ✅ Middleware spécialisé
} from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/appointments
 * @desc    Liste des rendez-vous (basique pour l'instant)
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Liste des rendez-vous',
      data: {
        appointments: [],
        note: 'Endpoint en développement - CARTE S1-04',
      },
    });
  })
);

/**
 * @route   POST /api/appointments
 * @desc    Créer un nouveau rendez-vous
 * @access  Private (Patient)
 */
router.post(
  '/',
  authenticateToken,
  requirePatient,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Création de rendez-vous pas encore implémentée',
      note: 'Sera développé dans CARTE S2-04',
    });
  })
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Détails d'un rendez-vous
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    res.status(501).json({
      success: false,
      message: `Détails du rendez-vous ${id} pas encore implémentés`,
      note: 'Sera développé dans CARTE S2-04',
    });
  })
);

export default router;
