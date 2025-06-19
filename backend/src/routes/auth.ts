// backend/src/routes/auth.ts - VALIDATION TÉLÉPHONE CORRIGÉE
import express from "express";
import { authController } from "../controllers/authController";
import { body } from "express-validator";
import { errorHandler } from "../middlewares/errorHandler";

const router = express.Router();

// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================

const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Email valide requis"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mot de passe minimum 6 caractères"),
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Prénom minimum 2 caractères"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nom minimum 2 caractères"),
  body("role")
    .isIn(["PATIENT", "DOCTOR", "INSURER"])
    .withMessage("Rôle doit être PATIENT, DOCTOR ou INSURER"),
  body("phone")
    .optional()
    .custom((value) => {
      // Validation pour numéros sénégalais
      if (!value) return true; // Optionnel

      // Formats acceptés:
      // +221701234567 (international)
      // 221701234567 (sans +)
      // 701234567 (local)
      // 77 123 45 67 (avec espaces)
      // 77-123-45-67 (avec tirets)

      const senegalPhoneRegex =
        /^(\+?221)?[\s\-]?[7][0-8][\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;

      if (!senegalPhoneRegex.test(value)) {
        throw new Error(
          "Numéro de téléphone sénégalais invalide (format: +221701234567 ou 701234567)"
        );
      }

      return true;
    }),
];

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Email valide requis"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];

// =====================================================
// ROUTES AUTHENTIFICATION
// =====================================================

// POST /api/auth/register
router.post(
  "/register",
  validateRegister,
  errorHandler(authController.register.bind(authController))
);

// POST /api/auth/login
router.post(
  "/login",
  validateLogin,
  errorHandler(authController.login.bind(authController))
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  errorHandler(authController.refreshToken.bind(authController))
);

// POST /api/auth/logout
router.post(
  "/logout",
  errorHandler(authController.logout.bind(authController))
);

export default router;
