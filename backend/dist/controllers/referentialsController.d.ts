import { Request, Response } from "express";
/**
 * Liste des régions du Sénégal
 * GET /api/referentials/regions
 */
export declare const getRegions: (req: Request, res: Response) => Promise<void>;
/**
 * Liste des spécialités médicales
 * GET /api/referentials/specialties
 */
export declare const getSpecialties: (req: Request, res: Response) => Promise<void>;
/**
 * Liste des types d'assurance
 * GET /api/referentials/insurance-types
 */
export declare const getInsuranceTypes: (req: Request, res: Response) => Promise<void>;
/**
 * Liste des compagnies d'assurance
 * GET /api/referentials/insurance-companies
 */
export declare const getInsuranceCompanies: (req: Request, res: Response) => Promise<void>;
/**
 * Détails d'une compagnie d'assurance
 * GET /api/referentials/insurance-companies/:id
 */
export declare const getInsuranceCompanyById: (req: Request, res: Response) => Promise<void>;
/**
 * Liste des établissements de santé
 * GET /api/referentials/establishments
 */
export declare const getEstablishments: (req: Request, res: Response) => Promise<void>;
/**
 * Détails d'un établissement
 * GET /api/referentials/establishments/:id
 */
export declare const getEstablishmentById: (req: Request, res: Response) => Promise<void>;
/**
 * Liste des médecins avec filtres
 * GET /api/referentials/doctors
 */
export declare const getDoctors: (req: Request, res: Response) => Promise<void>;
/**
 * Statistiques générales
 * GET /api/referentials/stats
 */
export declare const getStats: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getRegions: (req: Request, res: Response) => Promise<void>;
    getSpecialties: (req: Request, res: Response) => Promise<void>;
    getInsuranceTypes: (req: Request, res: Response) => Promise<void>;
    getInsuranceCompanies: (req: Request, res: Response) => Promise<void>;
    getInsuranceCompanyById: (req: Request, res: Response) => Promise<void>;
    getEstablishments: (req: Request, res: Response) => Promise<void>;
    getEstablishmentById: (req: Request, res: Response) => Promise<void>;
    getDoctors: (req: Request, res: Response) => Promise<void>;
    getStats: (req: Request, res: Response) => Promise<void>;
};
export default _default;
