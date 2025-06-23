// ===================================================================
// ROUTE: /src/routes/establishments.ts
// API CRUD Établissements avec filtres intelligents
// ===================================================================

import express, { Request, Response } from 'express';
import { SenegalRegion, EstablishmentType } from '@prisma/client';
import prisma from '../utils/prisma';
import Joi from 'joi';
import {
  authenticateToken,
  requireRole, // ✅ Fonction générique
  requireAdmin, // ✅ Middleware spécialisé
  requireDoctor, // ✅ Middleware spécialisé
  requirePatient, // ✅ Middleware spécialisé
  requireInsurer, // ✅ Middleware spécialisé
} from '../middlewares/authMiddleware';

const router = express.Router();

// ===================================================================
// VALIDATION SCHEMAS
// ===================================================================

const establishmentQuerySchema = Joi.object({
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .optional(),
  type: Joi.string()
    .valid(...Object.values(EstablishmentType))
    .optional(),
  search: Joi.string().min(2).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const establishmentCreateSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  type: Joi.string()
    .valid(...Object.values(EstablishmentType))
    .required(),
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  phone: Joi.string()
    .pattern(/^\+221[0-9]{8,9}$/)
    .required(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().max(1000).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  hasEmergency: Joi.boolean().default(false),
  hasMaternity: Joi.boolean().default(false),
  hasICU: Joi.boolean().default(false),
  languagesSpoken: Joi.array().items(Joi.string()).optional(),
  acceptedInsurances: Joi.array().items(Joi.string().uuid()).optional(),
});

// ===================================================================
// ENDPOINT: GET /api/establishments
// Recherche et filtrage d'établissements
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = establishmentQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Paramètres de recherche invalides',
        errors: error.details,
      });
      return;
    }

    const { region, type, search, page, limit } = value;

    // Construction des conditions WHERE
    const whereConditions: any = {
      isActive: true,
    };

    // Filtres de base
    if (region) whereConditions.region = region;
    if (type) whereConditions.type = type;

    // Recherche textuelle
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Exécution de la requête
    const [establishments, total] = await Promise.all([
      prisma.establishment.findMany({
        where: whereConditions,
        skip: offset,
        take: limit,
        include: {
          doctors: {
            where: { isActive: true },
            select: {
              id: true,
              specialty: true,
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: {
              doctors: { where: { isActive: true } },
              appointments: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.establishment.count({ where: whereConditions }),
    ]);

    // Enrichissement des données avec métrics
    const enrichedEstablishments = establishments.map((establishment) => {
      const specialtiesAvailable = Array.from(
        new Set(establishment.doctors.map((doc) => doc.specialty))
      );

      return {
        ...establishment,
        specialtiesAvailable,
        stats: {
          totalDoctors: establishment._count.doctors,
          totalAppointments: establishment._count.appointments,
        },
      };
    });

    // Métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: enrichedEstablishments,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'établissements:", error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/establishments/:id
// Récupération d'un établissement spécifique
// ===================================================================

router.get('/:id', (req: Request, res: Response) => {
  (async () => {
    try {
      const { id } = req.params;

      const establishment = await prisma.establishment.findUnique({
        where: { id },
        include: {
          doctors: {
            where: { isActive: true },
            include: {
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
          appointments: {
            where: {
              appointmentDate: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            select: {
              id: true,
              status: true,
              appointmentDate: true,
            },
          },
        },
      });

      if (!establishment) {
        return res.status(404).json({
          success: false,
          message: 'Établissement non trouvé',
        });
      }

      // Calcul des statistiques
      const appointmentStats = establishment.appointments.reduce(
        (acc, appt) => {
          acc[appt.status] = (acc[appt.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const specialtiesCount = establishment.doctors.reduce(
        (acc, doctor) => {
          acc[doctor.specialty] = (acc[doctor.specialty] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const enrichedEstablishment = {
        ...establishment,
        statistics: {
          totalDoctors: establishment.doctors.length,
          specialtiesCount,
          appointmentStats,
          totalAppointments: establishment.appointments.length,
        },
      };

      // Suppression des données sensibles
      delete (enrichedEstablishment as any).appointments;

      res.json({
        success: true,
        data: enrichedEstablishment,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'établissement:",
        error
      );
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  })();
});

// ===================================================================
// ENDPOINT: POST /api/establishments
// Création d'un nouvel établissement (Authentification requise)
// ===================================================================

const createEstablishmentSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  type: Joi.string()
    .valid(...Object.values(EstablishmentType))
    .required(),
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  phone: Joi.string()
    .pattern(/^\+221[0-9]{8,9}$/)
    .required(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  capacity: Joi.number().integer().min(1).optional(),
});

router.post(
  '/',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = createEstablishmentSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.details,
        });
        return;
      }

      // Vérification des permissions (seuls admin et insurer peuvent créer)
      const userRole = (req as any).user?.role;
      if (!['ADMIN', 'INSURER'].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour créer un établissement',
        });
        return;
      }

      // Vérification de l'unicité du nom dans la région
      const existingEstablishment = await prisma.establishment.findFirst({
        where: {
          name: value.name,
          region: value.region,
          isActive: true,
        },
      });

      if (existingEstablishment) {
        res.status(409).json({
          success: false,
          message: `Un établissement nommé "${value.name}" existe déjà dans la région ${value.region}`,
        });
        return;
      }

      // Validation des assurances (si spécifiées)
      if (value.acceptedInsurances && value.acceptedInsurances.length > 0) {
        const validInsurances = await prisma.insuranceCompany.findMany({
          where: {
            id: { in: value.acceptedInsurances },
            isActive: true,
          },
        });

        if (validInsurances.length !== value.acceptedInsurances.length) {
          res.status(400).json({
            success: false,
            message:
              "Une ou plusieurs compagnies d'assurance spécifiées sont invalides",
          });
          return;
        }
      }

      // Création de l'établissement
      const newEstablishment = await prisma.establishment.create({
        data: {
          name: value.name,
          type: value.type,
          region: value.region,
          city: value.city,
          address: value.address,
          phone: value.phone,
          email: value.email,
          website: value.website,
          capacity: value.capacity,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              doctors: true,
              appointments: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Établissement créé avec succès',
        data: newEstablishment,
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'établissement:", error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }
);

// ===================================================================
// ENDPOINT: PUT /api/establishments/:id
// Mise à jour d'un établissement (Authentification requise)
// ===================================================================

router.put(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      // Vérification que l'établissement existe
      const existingEstablishment = await prisma.establishment.findUnique({
        where: { id },
        include: {
          doctors: {
            where: { userId: userId },
          },
        },
      });

      if (!existingEstablishment) {
        res.status(404).json({
          success: false,
          message: 'Établissement non trouvé',
        });
        return;
      }

      // Vérification des permissions
      const canEdit =
        userRole === 'ADMIN' ||
        (userRole === 'DOCTOR' && existingEstablishment.doctors.length > 0) ||
        userRole === 'INSURER';

      if (!canEdit) {
        res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour modifier cet établissement',
        });
        return;
      }

      // Validation des données (schema partiel pour mise à jour)
      const updateSchema = establishmentCreateSchema.fork(
        ['name', 'type', 'region', 'city', 'address', 'phone'],
        (schema) => schema.optional()
      );
      const { error, value } = updateSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.details,
        });
        return;
      }

      // Mise à jour
      const updatedEstablishment = await prisma.establishment.update({
        where: { id },
        data: {
          ...value,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              doctors: true,
              appointments: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Établissement mis à jour avec succès',
        data: updatedEstablishment,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'établissement:", error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }
);

// ===================================================================
// ENDPOINT: DELETE /api/establishments/:id
// Suppression (désactivation) d'un établissement
// ===================================================================

router.delete(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;

      // Seuls les admins peuvent supprimer
      if (userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message:
            'Seuls les administrateurs peuvent supprimer un établissement',
        });
        return;
      }

      // Vérification de l'existence
      const establishment = await prisma.establishment.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              doctors: { where: { isActive: true } },
              appointments: {
                where: {
                  appointmentDate: { gte: new Date() },
                  status: { in: ['SCHEDULED', 'CONFIRMED'] },
                },
              },
            },
          },
        },
      });

      if (!establishment) {
        res.status(404).json({
          success: false,
          message: 'Établissement non trouvé',
        });
        return;
      }

      // Vérification des contraintes métier
      if (establishment._count.appointments > 0) {
        res.status(409).json({
          success: false,
          message:
            'Impossible de supprimer un établissement avec des rendez-vous programmés',
        });
        return;
      }

      // Désactivation (soft delete)
      const deactivatedEstablishment = await prisma.establishment.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Établissement désactivé avec succès',
        data: { id: deactivatedEstablishment.id, isActive: false },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'établissement:", error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }
);

// ===================================================================
// ENDPOINT: GET /api/establishments/search/nearby
// Recherche d'établissements par proximité (simulation géographique)
// ===================================================================

router.get('/search/nearby', async (req: Request, res: Response) => {
  try {
    const { region, latitude, longitude, radius = 50 } = req.query;

    if (!region && (!latitude || !longitude)) {
      res.status(400).json({
        success: false,
        message: 'Région ou coordonnées géographiques requises',
      });
      return;
    }

    // Simulation simple par région (en réalité, calcul géographique complexe)
    const whereConditions: any = {
      isActive: true,
    };

    if (region) {
      whereConditions.region = region;
    }

    const nearbyEstablishments = await prisma.establishment.findMany({
      where: whereConditions,
      take: 20,
      include: {
        doctors: {
          where: { isActive: true },
          select: {
            specialty: true,
          },
        },
        _count: {
          select: {
            doctors: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    // Enrichissement avec distance simulée
    const enrichedResults = nearbyEstablishments.map((establishment) => {
      const specialties = Array.from(
        new Set(establishment.doctors.map((doc) => doc.specialty))
      );

      return {
        ...establishment,
        specialtiesAvailable: specialties,
        estimatedDistance: Math.floor(Math.random() * Number(radius)), // Simulation
        estimatedTravelTime: Math.floor(5 + Math.random() * 45), // Minutes
        availableToday: Math.random() > 0.3, // 70% chance
      };
    });

    res.json({
      success: true,
      data: enrichedResults,
      meta: {
        searchCenter: { region, latitude, longitude },
        radiusKm: Number(radius),
        total: enrichedResults.length,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de proximité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/establishments/stats/summary
// Statistiques globales des établissements
// ===================================================================

router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const [
      totalEstablishments,
      establishmentsByRegion,
      establishmentsByType,
      averageCapacity,
    ] = await Promise.all([
      // Total établissements actifs
      prisma.establishment.count({
        where: { isActive: true },
      }),

      // Répartition par région
      prisma.establishment.groupBy({
        by: ['region'],
        where: { isActive: true },
        _count: { id: true },
      }),

      // Répartition par type
      prisma.establishment.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: { id: true },
      }),

      // Capacité moyenne
      prisma.establishment.aggregate({
        where: {
          isActive: true,
          capacity: { not: null },
        },
        _avg: { capacity: true },
        _sum: { capacity: true },
      }),
    ]);

    const stats = {
      total: totalEstablishments,
      distribution: {
        byRegion: establishmentsByRegion.reduce(
          (acc, item) => {
            acc[item.region] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        byType: establishmentsByType.reduce(
          (acc, item) => {
            acc[item.type] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      capacity: {
        average: Math.round(averageCapacity._avg.capacity || 0),
        total: averageCapacity._sum.capacity || 0,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

export default router;
