// src/controllers/referentialsController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const prisma = new PrismaClient();

// =====================================================
// ENUMS ET RÉFÉRENTIELS
// =====================================================

/**
 * Liste des régions du Sénégal
 * GET /api/referentials/regions
 */
export const getRegions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const regions = [
      { code: "DAKAR", name: "Dakar", capital: "Dakar" },
      { code: "THIES", name: "Thiès", capital: "Thiès" },
      { code: "SAINT_LOUIS", name: "Saint-Louis", capital: "Saint-Louis" },
      { code: "DIOURBEL", name: "Diourbel", capital: "Diourbel" },
      { code: "LOUGA", name: "Louga", capital: "Louga" },
      { code: "TAMBACOUNDA", name: "Tambacounda", capital: "Tambacounda" },
      { code: "KAOLACK", name: "Kaolack", capital: "Kaolack" },
      { code: "ZIGUINCHOR", name: "Ziguinchor", capital: "Ziguinchor" },
      { code: "FATICK", name: "Fatick", capital: "Fatick" },
      { code: "KOLDA", name: "Kolda", capital: "Kolda" },
      { code: "MATAM", name: "Matam", capital: "Matam" },
      { code: "KAFFRINE", name: "Kaffrine", capital: "Kaffrine" },
      { code: "KEDOUGOU", name: "Kédougou", capital: "Kédougou" },
      { code: "SEDHIOU", name: "Sédhiou", capital: "Sédhiou" },
    ];

    res.status(200).json({
      success: true,
      data: { regions },
    });
  } catch (error) {
    console.error("Erreur récupération régions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * Liste des spécialités médicales
 * GET /api/referentials/specialties
 */
export const getSpecialties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const specialties = [
      { code: "MEDECINE_GENERALE", name: "Médecine Générale" },
      { code: "PEDIATRIE", name: "Pédiatrie" },
      { code: "GYNECOLOGIE_OBSTETRIQUE", name: "Gynécologie-Obstétrique" },
      { code: "CHIRURGIE_GENERALE", name: "Chirurgie Générale" },
      { code: "MEDECINE_INTERNE", name: "Médecine Interne" },
      { code: "CARDIOLOGIE", name: "Cardiologie" },
      { code: "NEUROLOGIE", name: "Neurologie" },
      { code: "DERMATOLOGIE", name: "Dermatologie" },
      { code: "OPHTALMOLOGIE", name: "Ophtalmologie" },
      { code: "ORL", name: "ORL" },
      { code: "ORTHOPEDE", name: "Orthopédie" },
      { code: "UROLOGIE", name: "Urologie" },
      { code: "ANESTHESIE_REANIMATION", name: "Anesthésie-Réanimation" },
      { code: "RADIOLOGIE", name: "Radiologie" },
      { code: "MALADIES_INFECTIEUSES", name: "Maladies Infectieuses" },
      { code: "MEDECINE_TROPICALE", name: "Médecine Tropicale" },
      { code: "SANTE_PUBLIQUE", name: "Santé Publique" },
      { code: "MEDECINE_TRADITIONNELLE", name: "Médecine Traditionnelle" },
    ];

    res.status(200).json({
      success: true,
      data: { specialties },
    });
  } catch (error) {
    console.error("Erreur récupération spécialités:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * Liste des types d'assurance
 * GET /api/referentials/insurance-types
 */
export const getInsuranceTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const insuranceTypes = [
      {
        code: "IPM",
        name: "Institution Prévoyance Maladie",
        description: "Assurance pour salariés du secteur public et privé",
      },
      {
        code: "MUTUELLE_SANTE",
        name: "Mutuelle de Santé",
        description: "Mutuelles communautaires et sectorielles",
      },
      {
        code: "ASSURANCE_PRIVEE",
        name: "Assurance Privée",
        description: "Compagnies d'assurance privées (NSIA, ASKIA, etc.)",
      },
      {
        code: "CMU",
        name: "Couverture Maladie Universelle",
        description: "Couverture de base pour tous",
      },
      {
        code: "PRIVE",
        name: "Paiement Privé",
        description: "Paiement direct sans assurance",
      },
    ];

    res.status(200).json({
      success: true,
      data: { insuranceTypes },
    });
  } catch (error) {
    console.error("Erreur récupération types assurance:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// =====================================================
// COMPAGNIES D'ASSURANCE
// =====================================================

/**
 * Liste des compagnies d'assurance
 * GET /api/referentials/insurance-companies
 */
export const getInsuranceCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { region } = req.query;

    let whereClause: any = { isActive: true };

    if (region && typeof region === "string") {
      whereClause = {
        ...whereClause,
        regionsServed: {
          has: region,
        },
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
        insurancePlans: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            planType: true,
            monthlyPremium: true,
            coveragePercentage: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: { companies },
      total: companies.length,
    });
  } catch (error) {
    console.error("Erreur récupération compagnies:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * Détails d'une compagnie d'assurance
 * GET /api/referentials/insurance-companies/:id
 */
export const getInsuranceCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await prisma.insuranceCompany.findUnique({
      where: { id },
      include: {
        insurancePlans: {
          where: { isActive: true },
          orderBy: { monthlyPremium: "asc" },
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
      },
    });

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Compagnie d'assurance non trouvée",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    console.error("Erreur récupération compagnie:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// =====================================================
// ÉTABLISSEMENTS DE SANTÉ
// =====================================================

/**
 * Liste des établissements de santé
 * GET /api/referentials/establishments
 */
export const getEstablishments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { region, type, city } = req.query;

    // Validation des paramètres
    const querySchema = Joi.object({
      region: Joi.string().optional(),
      type: Joi.string()
        .valid("HOSPITAL", "CLINIC", "PRIVATE_PRACTICE", "HEALTH_CENTER")
        .optional(),
      city: Joi.string().optional(),
    });

    const { error } = querySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Paramètres de recherche invalides",
      });
      return;
    }

    let whereClause: any = { isActive: true };

    if (region) whereClause.region = region;
    if (type) whereClause.type = type;
    if (city) whereClause.city = { contains: city, mode: "insensitive" };

    const establishments = await prisma.establishment.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        type: true,
        region: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        capacity: true,
        doctors: {
          where: { isActive: true },
          select: {
            id: true,
            specialty: true,
            consultationFee: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ region: "asc" }, { name: "asc" }],
    });

    res.status(200).json({
      success: true,
      data: { establishments },
      total: establishments.length,
    });
  } catch (error) {
    console.error("Erreur récupération établissements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * Détails d'un établissement
 * GET /api/referentials/establishments/:id
 */
export const getEstablishmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
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
          orderBy: { specialty: "asc" },
        },
      },
    });

    if (!establishment) {
      res.status(404).json({
        success: false,
        message: "Établissement non trouvé",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { establishment },
    });
  } catch (error) {
    console.error("Erreur récupération établissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// =====================================================
// MÉDECINS
// =====================================================

/**
 * Liste des médecins avec filtres
 * GET /api/referentials/doctors
 */
export const getDoctors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      specialty,
      region,
      establishmentId,
      page = 1,
      limit = 20,
    } = req.query;

    // Validation
    const querySchema = Joi.object({
      specialty: Joi.string().optional(),
      region: Joi.string().optional(),
      establishmentId: Joi.string().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20),
    });

    const { error, value } = querySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Paramètres invalides",
      });
      return;
    }

    let whereClause: any = { isActive: true };

    if (specialty) whereClause.specialty = specialty;
    if (establishmentId) whereClause.establishmentId = establishmentId;
    if (region) {
      whereClause.establishment = {
        region: region,
      };
    }

    const skip = (Number(value.page) - 1) * Number(value.limit);

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: whereClause,
        select: {
          id: true,
          licenseNumber: true,
          specialty: true,
          subSpecialty: true,
          experienceYears: true,
          consultationFee: true,
          languagesSpoken: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          establishment: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              region: true,
            },
          },
        },
        orderBy: [{ specialty: "asc" }, { user: { lastName: "asc" } }],
        skip,
        take: Number(value.limit),
      }),
      prisma.doctor.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / Number(value.limit));

    res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: Number(value.page),
          limit: Number(value.limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération médecins:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * Statistiques générales
 * GET /api/referentials/stats
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalEstablishments,
      totalInsuranceCompanies,
      totalAppointments,
      totalConsultations,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.establishment.count({ where: { isActive: true } }),
      prisma.insuranceCompany.count({ where: { isActive: true } }),
      prisma.appointment.count(),
      prisma.consultation.count(),
    ]);

    // Répartition par région
    const patientsByRegion = await prisma.patient.groupBy({
      by: ["region"],
      _count: { region: true },
      orderBy: { _count: { region: "desc" } },
    });

    const doctorsBySpecialty = await prisma.doctor.groupBy({
      by: ["specialty"],
      where: { isActive: true },
      _count: { specialty: true },
      orderBy: { _count: { specialty: "desc" } },
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          patients: totalPatients,
          doctors: totalDoctors,
          establishments: totalEstablishments,
          insuranceCompanies: totalInsuranceCompanies,
          appointments: totalAppointments,
          consultations: totalConsultations,
        },
        distribution: {
          patientsByRegion: patientsByRegion.map((item) => ({
            region: item.region,
            count: item._count.region,
          })),
          doctorsBySpecialty: doctorsBySpecialty.map((item) => ({
            specialty: item.specialty,
            count: item._count.specialty,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

export default {
  getRegions,
  getSpecialties,
  getInsuranceTypes,
  getInsuranceCompanies,
  getInsuranceCompanyById,
  getEstablishments,
  getEstablishmentById,
  getDoctors,
  getStats,
};
