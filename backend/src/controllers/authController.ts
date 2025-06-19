import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "PATIENT" | "DOCTOR" | "INSURER";
  phone?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

class AuthController {
  async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Validation basique
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs requis doivent être remplis",
      });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Générer token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    logger.info(`Nouvel utilisateur créé: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: {
        user,
        token,
      },
    });
  }

  async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    // Générer token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    logger.info(`Connexion réussie: ${user.email}`);

    // Retourner sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }

  async refreshToken(req: Request, res: Response) {
    res.json({
      success: true,
      message: "Refresh token - à implémenter",
    });
  }

  async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  }
}

export const authController = new AuthController();
