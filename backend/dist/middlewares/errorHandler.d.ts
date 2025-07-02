import { Request, Response, NextFunction } from 'express';
/**
 * Interface pour les erreurs personnalisées
 */
export interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    errors?: Record<string, string | string[]>;
    details?: Record<string, unknown>;
}
/**
 * Créer une erreur personnalisée
 */
export declare const createError: (message: string, statusCode?: number, code?: string, errors?: Record<string, string | string[]>) => CustomError;
/**
 * Middleware de gestion des erreurs globales
 */
export declare const errorHandler: (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => void;
/**
 * Type générique pour les handlers async
 */
type AsyncHandler<T = Request> = (req: T, res: Response, next: NextFunction) => Promise<void | Response>;
/**
 * Utilitaire asyncHandler pour gérer les erreurs async/await
 */
export declare const asyncHandler: <T = Request>(fn: AsyncHandler<T>) => (req: T, res: Response, next: NextFunction) => void;
/**
 * Middleware 404 pour les routes non trouvées
 */
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validation des données d'entrée
 */
export declare const validateRequest: (schema: {
    body?: object;
    params?: object;
    query?: object;
}) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Export par défaut
 */
declare const _default: {
    errorHandler: (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => void;
    asyncHandler: <T = Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>(fn: AsyncHandler<T>) => (req: T, res: Response, next: NextFunction) => void;
    notFound: (req: Request, res: Response, next: NextFunction) => void;
    createError: (message: string, statusCode?: number, code?: string, errors?: Record<string, string | string[]>) => CustomError;
    validateRequest: (schema: {
        body?: object;
        params?: object;
        query?: object;
    }) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
