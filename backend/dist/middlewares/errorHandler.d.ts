import { Request, Response, NextFunction } from "express";
/**
 * Interface pour les erreurs personnalisées
 */
interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    errors?: any;
}
/**
 * Middleware de gestion des erreurs globales
 */
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
/**
 * Utilitaire asyncHandler pour gérer les erreurs async/await
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware 404 pour les routes non trouvées
 */
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
    asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
    notFound: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
