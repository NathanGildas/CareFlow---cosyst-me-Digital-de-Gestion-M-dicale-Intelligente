// src/routes/users.ts
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
 * @route   GET /api/users
 * @desc    Liste des utilisateurs (Admin seulement)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Gestion des utilisateurs pas encore implémentée',
      note: 'Sera développé dans CARTE S3-02 (Dashboard Admin)',
    });
  })
);

/**
 * @route   GET /api/users/me
 * @desc    Informations utilisateur connecté (redirige vers auth/profile)
 * @access  Private
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Pour votre profil, utilisez /api/auth/profile',
      redirect: '/api/auth/profile',
      user: req.user,
    });
  })
);

/**
 * @route   PUT /api/users/:id
 * @desc    Mise à jour utilisateur (Admin seulement)
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    res.status(501).json({
      success: false,
      message: `Mise à jour utilisateur ${id} pas encore implémentée`,
      note: 'Sera développé dans CARTE S3-02 (Dashboard Admin)',
    });
  })
);

export default router;
