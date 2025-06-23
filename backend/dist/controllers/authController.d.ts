import { Request, Response } from 'express';
/**
 * Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * Connexion utilisateur
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * Rafraîchissement du token
 * POST /api/auth/refresh
 */
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
/**
 * Profil utilisateur connecté
 * GET /api/auth/profile
 */
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Mise à jour du profil
 * PUT /api/auth/profile
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Changement de mot de passe
 * PUT /api/auth/change-password
 */
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    getProfile: (req: Request, res: Response) => Promise<void>;
    updateProfile: (req: Request, res: Response) => Promise<void>;
    changePassword: (req: Request, res: Response) => Promise<void>;
};
export default _default;
