import { AuthPayload } from '../types/auth.types';
declare class AuthService {
    generateTokens(payload: AuthPayload): {
        accessToken: string;
        refreshToken: string;
    };
    verifyToken(token: string): AuthPayload | null;
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
}
export declare const authService: AuthService;
export {};
