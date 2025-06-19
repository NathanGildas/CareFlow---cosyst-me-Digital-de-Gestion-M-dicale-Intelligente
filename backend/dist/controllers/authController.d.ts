import { Request, Response } from "express";
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
declare class AuthController {
    register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
