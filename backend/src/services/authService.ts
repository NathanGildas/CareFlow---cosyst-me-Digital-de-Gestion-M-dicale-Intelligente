// src/services/authService.ts - Service d'authentification
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthPayload, Role } from '../types/auth.types';

class AuthService {
  generateTokens(payload: AuthPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthPayload;
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export const authService = new AuthService();