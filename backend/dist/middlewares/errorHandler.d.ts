import { Request, Response, NextFunction } from "express";
interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
export declare const errorHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const globalErrorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export {};
