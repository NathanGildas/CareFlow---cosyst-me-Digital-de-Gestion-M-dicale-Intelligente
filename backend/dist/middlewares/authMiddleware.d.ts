import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
                firstName: string;
                lastName: string;
            };
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (...allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireDoctor: (req: Request, res: Response, next: NextFunction) => void;
export declare const requirePatient: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireInsurer: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireHealthcareProvider: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireManager: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireOwnership: (resourceIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateTokens: (user: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
}, accessTokenExpiry?: string, refreshTokenExpiry?: string) => {
    accessToken: any;
    refreshToken: any;
    expiresIn: number;
    tokenType: string;
};
export declare const generateSingleToken: (user: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
}, expiry?: string) => string;
export declare const validateRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
