"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.ts - VERSION CORRIGÉE
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = express_1.default.Router();
// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================
const validateRegister = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Email valide requis"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Mot de passe minimum 6 caractères"),
    (0, express_validator_1.body)("firstName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Prénom minimum 2 caractères"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Nom minimum 2 caractères"),
    (0, express_validator_1.body)("role")
        .isIn(["PATIENT", "DOCTOR", "INSURER"])
        .withMessage("Rôle doit être PATIENT, DOCTOR ou INSURER"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isMobilePhone("fr-FR")
        .withMessage("Numéro de téléphone invalide"),
];
const validateLogin = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Email valide requis"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Mot de passe requis"),
];
// =====================================================
// ROUTES AUTHENTIFICATION
// =====================================================
// POST /api/auth/register
router.post("/register", validateRegister, (0, errorHandler_1.errorHandler)(authController_1.authController.register.bind(authController_1.authController)));
// POST /api/auth/login
router.post("/login", validateLogin, (0, errorHandler_1.errorHandler)(authController_1.authController.login.bind(authController_1.authController)));
// POST /api/auth/refresh
router.post("/refresh", (0, errorHandler_1.errorHandler)(authController_1.authController.refreshToken.bind(authController_1.authController)));
// POST /api/auth/logout
router.post("/logout", (0, errorHandler_1.errorHandler)(authController_1.authController.logout.bind(authController_1.authController)));
exports.default = router;
//# sourceMappingURL=auth.js.map