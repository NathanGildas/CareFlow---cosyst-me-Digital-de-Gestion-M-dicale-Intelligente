// ===================================================================
// ROUTE: /src/routes/insurance.ts
// API complète pour le module d'assurance CareFlow Sénégal (CORRIGÉE)
// ===================================================================

import express, { Request, Response } from 'express';
import { SenegalRegion, InsurancePlan } from '@prisma/client';
import prisma from '../utils/prisma';
import Joi from 'joi';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  authenticateToken,
  requireRole,
  requireAdmin,
  requirePatient,
  requireInsurer,
} from '../middlewares/authMiddleware';

const router = express.Router();

// ===================================================================
// VALIDATION SCHEMAS
// ===================================================================

const searchPlansSchema = Joi.object({
  // Géographique
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .optional(),
  city: Joi.string().min(2).optional(),

  // Type et catégorie
  planType: Joi.array()
    .items(Joi.string().valid(...Object.values(InsurancePlan)))
    .optional(),

  // Tarification
  minPremium: Joi.number().min(0).optional(),
  maxPremium: Joi.number().min(0).optional(),
  minCoverage: Joi.number().min(0).optional(),
  maxCoverage: Joi.number().min(0).optional(),

  // Couverture
  minCoveragePercentage: Joi.number().min(0).max(100).optional(),
  maxDeductible: Joi.number().min(0).optional(),

  // Compagnie
  companyIds: Joi.array().items(Joi.string().uuid()).optional(),
  minRating: Joi.number().min(1).max(5).optional(),

  // Pagination et tri
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  sortBy: Joi.string()
    .valid('premium', 'coverage', 'rating', 'name', 'coveragePercentage')
    .default('premium'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

const quoteRequestSchema = Joi.object({
  // Informations personnelles
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  dateOfBirth: Joi.date().max('now').required(),
  phone: Joi.string()
    .pattern(/^\+221[0-9]{8,9}$/)
    .required(),
  email: Joi.string().email().required(),
  city: Joi.string().min(2).max(100).required(),
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .required(),

  // Détails de la demande
  planIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  planType: Joi.string()
    .valid(...Object.values(InsurancePlan))
    .required(),
  beneficiariesCount: Joi.number().integer().min(1).max(10).required(),
  hasPreexistingConditions: Joi.boolean().required(),
  preexistingConditions: Joi.array().items(Joi.string()).optional(),

  // Préférences
  preferredStartDate: Joi.date().min('now').required(),
  additionalNotes: Joi.string().max(500).optional(),
});

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// Convertir Prisma Decimal en number pour JSON
const decimalToNumber = (decimal: any): number => {
  return typeof decimal === 'object' && decimal !== null
    ? Number(decimal.toString())
    : Number(decimal);
};

// Transformer les données Prisma pour l'API
const transformPlanForAPI = (plan: any) => {
  return {
    ...plan,
    monthlyPremium: decimalToNumber(plan.monthlyPremium),
    annualPremium: decimalToNumber(plan.monthlyPremium) * 12, // Calculé
    deductible: decimalToNumber(plan.copayment), // Prisma: copayment → API: deductible
    maxCoverage: decimalToNumber(plan.annualLimit), // Prisma: annualLimit → API: maxCoverage
    company: plan.company
      ? {
          ...plan.company,
        }
      : undefined,
  };
};

// ===================================================================
// ENDPOINT: GET /api/insurance/companies
// Récupération des compagnies d'assurance avec filtres
// ===================================================================

router.get(
  '/companies',
  asyncHandler(async (req: Request, res: Response) => {
    const { region, city, minRating, isActive } = req.query;

    let whereClause: any = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    } else {
      whereClause.isActive = true; // Par défaut, seulement les actives
    }

    if (region && typeof region === 'string') {
      whereClause.regionsServed = {
        has: region as SenegalRegion,
      };
    }

    const companies = await prisma.insuranceCompany.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        regionsServed: true,
        isActive: true,
        insurancePlans: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            planType: true,
            monthlyPremium: true,
            coveragePercentage: true,
            annualLimit: true,
          },
          orderBy: { monthlyPremium: 'asc' },
        },
        _count: {
          select: {
            agents: true,
            policyHolders: true,
            insurancePlans: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transformer les données pour l'API
    const transformedCompanies = companies.map((company) => ({
      ...company,
      insurancePlans: company.insurancePlans.map((plan) => ({
        ...plan,
        monthlyPremium: decimalToNumber(plan.monthlyPremium),
        maxCoverage: decimalToNumber(plan.annualLimit),
      })),
    }));

    res.status(200).json({
      success: true,
      data: transformedCompanies,
      total: transformedCompanies.length,
    });
  })
);

// ===================================================================
// ENDPOINT: GET /api/insurance/companies/:id
// Détails d'une compagnie d'assurance
// ===================================================================

router.get(
  '/companies/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const company = await prisma.insuranceCompany.findUnique({
      where: { id },
      include: {
        insurancePlans: {
          where: { isActive: true },
          orderBy: { monthlyPremium: 'asc' },
        },
        agents: {
          where: { isActive: true },
          select: {
            id: true,
            licenseNumber: true,
            department: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            policyHolders: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Compagnie d'assurance non trouvée",
      });
    }

    // Transformer les données pour l'API
    const transformedCompany = {
      ...company,
      insurancePlans: company.insurancePlans.map(transformPlanForAPI),
    };

    res.status(200).json({
      success: true,
      data: transformedCompany,
    });
  })
);

// ===================================================================
// ENDPOINT: GET /api/insurance/plans/search
// RECHERCHE DE PLANS D'ASSURANCE (ENDPOINT PRINCIPAL)
// ===================================================================

router.get(
  '/plans/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = searchPlansSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de recherche invalides',
        errors: error.details,
      });
    }

    const {
      region,
      city,
      planType,
      minPremium,
      maxPremium,
      minCoverage,
      maxCoverage,
      minCoveragePercentage,
      maxDeductible,
      companyIds,
      minRating,
      page,
      limit,
      sortBy,
      sortOrder,
    } = value;

    // Construction de la clause WHERE
    let whereClause: any = {
      isActive: true,
      company: {
        isActive: true,
      },
    };

    // Filtres sur les plans
    if (planType && planType.length > 0) {
      whereClause.planType = { in: planType };
    }

    if (minPremium !== undefined || maxPremium !== undefined) {
      whereClause.monthlyPremium = {};
      if (minPremium !== undefined) whereClause.monthlyPremium.gte = minPremium;
      if (maxPremium !== undefined) whereClause.monthlyPremium.lte = maxPremium;
    }

    if (minCoverage !== undefined || maxCoverage !== undefined) {
      whereClause.annualLimit = {}; // Prisma utilise annualLimit
      if (minCoverage !== undefined) whereClause.annualLimit.gte = minCoverage;
      if (maxCoverage !== undefined) whereClause.annualLimit.lte = maxCoverage;
    }

    if (minCoveragePercentage !== undefined) {
      whereClause.coveragePercentage = { gte: minCoveragePercentage };
    }

    if (maxDeductible !== undefined) {
      whereClause.copayment = { lte: maxDeductible }; // Prisma utilise copayment
    }

    // Filtres sur les compagnies
    if (companyIds && companyIds.length > 0) {
      whereClause.companyId = { in: companyIds };
    }

    if (region) {
      whereClause.company.regionsServed = { has: region };
    }

    // Construction de l'orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'premium':
        orderBy.monthlyPremium = sortOrder;
        break;
      case 'coverage':
        orderBy.annualLimit = sortOrder; // Prisma utilise annualLimit
        break;
      case 'coveragePercentage':
        orderBy.coveragePercentage = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      default:
        orderBy.monthlyPremium = 'asc';
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Récupération des plans
    const [plans, totalPlans] = await Promise.all([
      prisma.insurancePlanDetails.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              regionsServed: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.insurancePlanDetails.count({ where: whereClause }),
    ]);

    // Récupération des compagnies uniques pour le filtre
    const companies = await prisma.insuranceCompany.findMany({
      where: {
        isActive: true,
        insurancePlans: {
          some: whereClause,
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        regionsServed: true,
      },
      orderBy: { name: 'asc' },
    });

    // Calcul de la pagination
    const totalPages = Math.ceil(totalPlans / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Transformer les données pour l'API
    const transformedPlans = plans.map(transformPlanForAPI);

    const searchResults = {
      companies,
      plans: transformedPlans,
      totalResults: totalPlans,
      pagination: {
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: value,
    };

    res.status(200).json({
      success: true,
      data: searchResults,
    });
  })
);

// ===================================================================
// ENDPOINT: GET /api/insurance/plans/:id
// Détails d'un plan d'assurance
// ===================================================================

router.get(
  '/plans/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const plan = await prisma.insurancePlanDetails.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan d'assurance non trouvé",
      });
    }

    const transformedPlan = transformPlanForAPI(plan);

    res.status(200).json({
      success: true,
      data: transformedPlan,
    });
  })
);

// ===================================================================
// ENDPOINT: GET /api/insurance/companies/:companyId/plans
// Plans d'une compagnie spécifique
// ===================================================================

router.get(
  '/companies/:companyId/plans',
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;

    // Vérifier que la compagnie existe
    const company = await prisma.insuranceCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Compagnie d'assurance non trouvée",
      });
    }

    const plans = await prisma.insurancePlanDetails.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { monthlyPremium: 'asc' },
    });

    const transformedPlans = plans.map(transformPlanForAPI);

    res.status(200).json({
      success: true,
      data: transformedPlans,
      total: transformedPlans.length,
    });
  })
);

// ===================================================================
// ENDPOINT: POST /api/insurance/plans/compare
// Comparaison de plans d'assurance
// ===================================================================

router.post(
  '/plans/compare',
  asyncHandler(async (req: Request, res: Response) => {
    const { planIds } = req.body;

    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Au moins 2 plans requis pour la comparaison',
      });
    }

    if (planIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 plans peuvent être comparés',
      });
    }

    const plans = await prisma.insurancePlanDetails.findMany({
      where: {
        id: { in: planIds },
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            website: true,
          },
        },
      },
    });

    if (plans.length !== planIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Un ou plusieurs plans non trouvés',
      });
    }

    // Transformer les plans pour l'API
    const transformedPlans = plans.map(transformPlanForAPI);

    // Structure de comparaison simplifiée
    const comparisonCategories = [
      {
        name: 'Informations générales',
        items: [
          {
            label: 'Nom du plan',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.name,
              formattedValue: plan.name,
            })),
            type: 'text',
          },
          {
            label: 'Compagnie',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.company.name,
              formattedValue: plan.company.name,
            })),
            type: 'text',
          },
          {
            label: 'Type de plan',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.planType,
              formattedValue: plan.planType,
            })),
            type: 'text',
          },
        ],
      },
      {
        name: 'Tarification',
        items: [
          {
            label: 'Prime mensuelle',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.monthlyPremium,
              formattedValue: `${plan.monthlyPremium.toLocaleString()} FCFA`,
            })),
            type: 'currency',
            isHighlight: true,
          },
          {
            label: 'Prime annuelle',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.annualPremium,
              formattedValue: `${plan.annualPremium.toLocaleString()} FCFA`,
            })),
            type: 'currency',
          },
        ],
      },
      {
        name: 'Couverture',
        items: [
          {
            label: 'Pourcentage de couverture',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.coveragePercentage,
              formattedValue: `${plan.coveragePercentage}%`,
            })),
            type: 'percentage',
            isHighlight: true,
          },
          {
            label: 'Couverture maximale',
            values: transformedPlans.map((plan) => ({
              planId: plan.id,
              value: plan.maxCoverage,
              formattedValue: `${plan.maxCoverage.toLocaleString()} FCFA`,
            })),
            type: 'currency',
          },
        ],
      },
    ];

    const comparison = {
      plans: transformedPlans,
      comparisonCategories,
    };

    res.status(200).json({
      success: true,
      data: comparison,
    });
  })
);

// ===================================================================
// ENDPOINT: POST /api/insurance/quotes
// Demande de devis d'assurance
// ===================================================================

router.post(
  '/quotes',
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = quoteRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données de demande invalides',
        errors: error.details,
      });
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      email,
      city,
      region,
      planIds,
      planType,
      beneficiariesCount,
      hasPreexistingConditions,
      preexistingConditions,
      preferredStartDate,
      additionalNotes,
    } = value;

    // Vérifier que les plans existent
    const plans = await prisma.insurancePlanDetails.findMany({
      where: {
        id: { in: planIds },
        isActive: true,
      },
    });

    if (plans.length !== planIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Un ou plusieurs plans non trouvés',
      });
    }

    // Pour l'instant, simulation simple du devis
    // Dans un vrai système, il y aurait des calculs complexes
    const quotes = plans.map((plan) => {
      // Facteur de multiplication selon le nombre de bénéficiaires
      const beneficiaryMultiplier = 1 + (beneficiariesCount - 1) * 0.7;

      // Facteur de risque pour les conditions préexistantes
      const riskMultiplier = hasPreexistingConditions ? 1.2 : 1.0;

      const basePremium = decimalToNumber(plan.monthlyPremium);
      const adjustedPremium =
        basePremium * beneficiaryMultiplier * riskMultiplier;

      return {
        id: `quote_${plan.id}_${Date.now()}`,
        requestId: `req_${Date.now()}`,
        planId: plan.id,
        plan: transformPlanForAPI(plan),
        monthlyPremium: Math.round(adjustedPremium),
        annualPremium: Math.round(adjustedPremium * 12 * 0.9), // 10% de remise annuelle
        coverageDetails: [
          {
            category: 'Soins généraux',
            description: 'Consultations, examens de base',
            coveragePercentage: plan.coveragePercentage,
            maxAmount: decimalToNumber(plan.annualLimit),
          },
        ],
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 jours
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
      };
    });

    res.status(201).json({
      success: true,
      data: quotes,
      message: 'Devis générés avec succès',
    });
  })
);

// ===================================================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// ===================================================================

// Endpoint pour les souscriptions (nécessite authentification)
router.post(
  '/subscriptions',
  authenticateToken,
  requirePatient,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Souscription pas encore implémentée',
      note: 'Sera développé dans la phase suivante',
    });
  })
);

// Gestion des réclamations (nécessite authentification)
router.get(
  '/claims',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      message: 'Gestion des réclamations pas encore implémentée',
      note: 'Sera développé dans la phase suivante',
    });
  })
);

export default router;
