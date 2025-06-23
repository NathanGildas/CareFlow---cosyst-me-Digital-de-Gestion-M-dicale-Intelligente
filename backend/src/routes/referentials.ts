// ===================================================================
// ROUTE: /src/routes/referentials.ts
// APIs Référentiels complets pour CareFlow Sénégal
// ===================================================================

import express, { Request, Response } from "express";
import {
  SenegalRegion,
  MedicalSpecialty,
  LanguageSpoken,
  EstablishmentType,
  InsuranceType,
} from "@prisma/client";
import prisma from "../utils/prisma";
import Joi from "joi";

const router = express.Router();

// ===================================================================
// VALIDATION SCHEMAS
// ===================================================================

const regionQuerySchema = Joi.object({
  search: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const insuranceQuerySchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(InsuranceType))
    .optional(),
  region: Joi.string()
    .valid(...Object.values(SenegalRegion))
    .optional(),
  search: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

// ===================================================================
// ENDPOINT: GET /api/referentials/regions
// Récupération des régions du Sénégal
// ===================================================================

router.get("/regions", async (req: Request, res: Response) => {
  try {
    const { error, value } = regionQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Paramètres invalides",
        errors: error.details,
      });
      return;
    }

    const { search, limit } = value;

    // Données des régions sénégalaises avec informations détaillées
    const regions = [
      {
        code: "DAKAR",
        name: "Dakar",
        population: 3732284,
        area: 547, // km²
        capital: "Dakar",
        departments: ["Dakar", "Guédiawaye", "Pikine", "Rufisque"],
      },
      {
        code: "THIES",
        name: "Thiès",
        population: 2016266,
        area: 6670,
        capital: "Thiès",
        departments: ["Thiès", "Mbour", "Tivaouane"],
      },
      {
        code: "SAINT_LOUIS",
        name: "Saint-Louis",
        population: 1039138,
        area: 19034,
        capital: "Saint-Louis",
        departments: ["Saint-Louis", "Dagana", "Podor"],
      },
      {
        code: "DIOURBEL",
        name: "Diourbel",
        population: 1739824,
        area: 4859,
        capital: "Diourbel",
        departments: ["Diourbel", "Mbacké", "Bambey"],
      },
      {
        code: "LOUGA",
        name: "Louga",
        population: 1006963,
        area: 24889,
        capital: "Louga",
        departments: ["Louga", "Linguère", "Kébémer"],
      },
      {
        code: "TAMBACOUNDA",
        name: "Tambacounda",
        population: 754667,
        area: 42364,
        capital: "Tambacounda",
        departments: ["Tambacounda", "Bakel", "Goudiry", "Koumpentoum"],
      },
      {
        code: "KAOLACK",
        name: "Kaolack",
        population: 1016324,
        area: 5357,
        capital: "Kaolack",
        departments: ["Kaolack", "Kaffrine", "Nioro du Rip"],
      },
      {
        code: "ZIGUINCHOR",
        name: "Ziguinchor",
        population: 674993,
        area: 7339,
        capital: "Ziguinchor",
        departments: ["Ziguinchor", "Bignona", "Oussouye"],
      },
      {
        code: "FATICK",
        name: "Fatick",
        population: 833549,
        area: 7935,
        capital: "Fatick",
        departments: ["Fatick", "Foundiougne", "Gossas"],
      },
      {
        code: "KOLDA",
        name: "Kolda",
        population: 805675,
        area: 21011,
        capital: "Kolda",
        departments: ["Kolda", "Vélingara", "Médina Yoro Foulah"],
      },
      {
        code: "MATAM",
        name: "Matam",
        population: 645014,
        area: 29445,
        capital: "Matam",
        departments: ["Matam", "Kanel", "Ranérou"],
      },
      {
        code: "KAFFRINE",
        name: "Kaffrine",
        population: 575711,
        area: 11262,
        capital: "Kaffrine",
        departments: ["Kaffrine", "Birkelane", "Koungheul", "Malem-Hodar"],
      },
      {
        code: "KEDOUGOU",
        name: "Kédougou",
        population: 197216,
        area: 16896,
        capital: "Kédougou",
        departments: ["Kédougou", "Salemata", "Saraya"],
      },
      {
        code: "SEDHIOU",
        name: "Sédhiou",
        population: 520416,
        area: 7341,
        capital: "Sédhiou",
        departments: ["Sédhiou", "Bounkiling", "Goudomp"],
      },
    ];

    // Filtrage par recherche si spécifié
    let filteredRegions = regions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRegions = regions.filter(
        (region) =>
          region.name.toLowerCase().includes(searchLower) ||
          region.capital.toLowerCase().includes(searchLower) ||
          region.departments.some((dept) =>
            dept.toLowerCase().includes(searchLower)
          )
      );
    }

    // Limitation des résultats
    const limitedRegions = filteredRegions.slice(0, limit);

    res.json({
      success: true,
      data: limitedRegions,
      meta: {
        total: regions.length,
        filtered: filteredRegions.length,
        returned: limitedRegions.length,
        search: search || null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des régions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/referentials/medical-specialties
// Récupération des spécialités médicales adaptées au Sénégal
// ===================================================================

router.get("/medical-specialties", async (req: Request, res: Response) => {
  try {
    const specialties = [
      {
        code: "MEDECINE_GENERALE",
        name: "Médecine Générale",
        description: "Soins de santé primaires et médecine de famille",
        consultationFee: { min: 8000, max: 15000, currency: "FCFA" },
        category: "PRIMARY_CARE",
      },
      {
        code: "PEDIATRIE",
        name: "Pédiatrie",
        description: "Médecine des enfants et adolescents",
        consultationFee: { min: 10000, max: 20000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "GYNECOLOGIE_OBSTETRIQUE",
        name: "Gynécologie-Obstétrique",
        description: "Santé des femmes, grossesse et accouchement",
        consultationFee: { min: 12000, max: 25000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "CHIRURGIE_GENERALE",
        name: "Chirurgie Générale",
        description: "Interventions chirurgicales générales",
        consultationFee: { min: 15000, max: 30000, currency: "FCFA" },
        category: "SURGICAL",
      },
      {
        code: "CARDIOLOGIE",
        name: "Cardiologie",
        description: "Maladies du cœur et du système cardiovasculaire",
        consultationFee: { min: 20000, max: 40000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "MALADIES_INFECTIEUSES",
        name: "Maladies Infectieuses",
        description:
          "Paludisme, tuberculose, VIH/SIDA et infections tropicales",
        consultationFee: { min: 15000, max: 25000, currency: "FCFA" },
        category: "TROPICAL",
      },
      {
        code: "MEDECINE_TROPICALE",
        name: "Médecine Tropicale",
        description: "Pathologies spécifiques aux zones tropicales",
        consultationFee: { min: 18000, max: 30000, currency: "FCFA" },
        category: "TROPICAL",
      },
      {
        code: "NEUROLOGIE",
        name: "Neurologie",
        description: "Maladies du système nerveux",
        consultationFee: { min: 25000, max: 45000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "DERMATOLOGIE",
        name: "Dermatologie",
        description: "Maladies de la peau",
        consultationFee: { min: 15000, max: 30000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "OPHTALMOLOGIE",
        name: "Ophtalmologie",
        description: "Maladies des yeux et de la vision",
        consultationFee: { min: 12000, max: 25000, currency: "FCFA" },
        category: "SPECIALIST",
      },
      {
        code: "SANTE_PUBLIQUE",
        name: "Santé Publique",
        description: "Prévention et promotion de la santé communautaire",
        consultationFee: { min: 10000, max: 20000, currency: "FCFA" },
        category: "PUBLIC_HEALTH",
      },
      {
        code: "MEDECINE_TRADITIONNELLE",
        name: "Médecine Traditionnelle",
        description: "Thérapies traditionnelles africaines complémentaires",
        consultationFee: { min: 5000, max: 15000, currency: "FCFA" },
        category: "TRADITIONAL",
      },
    ];

    res.json({
      success: true,
      data: specialties,
      meta: {
        total: specialties.length,
        categories: [
          "PRIMARY_CARE",
          "SPECIALIST",
          "SURGICAL",
          "TROPICAL",
          "PUBLIC_HEALTH",
          "TRADITIONAL",
        ],
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/referentials/insurance-companies
// Récupération des compagnies d'assurance sénégalaises
// ===================================================================

router.get(
  "/insurance-companies",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = insuranceQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: "Paramètres invalides",
          errors: error.details,
        });
        return;
      }

      // Récupération depuis la base de données
      const { type, region, search, limit } = value;

      const whereConditions: any = {};

      if (type) {
        whereConditions.type = type;
      }

      if (search) {
        whereConditions.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { shortName: { contains: search, mode: "insensitive" } },
        ];
      }

      const companies = await prisma.insuranceCompany.findMany({
        where: whereConditions,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          website: true,
          address: true,
          regionsServed: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              agents: true,
              policyHolders: true,
            },
          },
        },
        orderBy: [{ name: "asc" }],
      });

      // Filtrage par région si spécifié
      let filteredCompanies = companies;
      if (region) {
        filteredCompanies = companies.filter((company) =>
          company.regionsServed.includes(region as SenegalRegion)
        );
      }

      res.json({
        success: true,
        data: filteredCompanies,
        meta: {
          total: companies.length,
          filtered: filteredCompanies.length,
          filters: { type, region, search },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des assurances:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }
);

// ===================================================================
// ENDPOINT: GET /api/referentials/languages
// Langues parlées au Sénégal
// ===================================================================

router.get("/languages", async (req: Request, res: Response) => {
  try {
    const languages = [
      {
        code: "FRANCAIS",
        name: "Français",
        nativeName: "Français",
        speakerPercentage: 100, // Langue officielle
        regions: ["ALL"],
        isOfficial: true,
      },
      {
        code: "WOLOF",
        name: "Wolof",
        nativeName: "Wolof",
        speakerPercentage: 85,
        regions: ["DAKAR", "THIES", "DIOURBEL", "LOUGA", "FATICK"],
        isOfficial: false,
      },
      {
        code: "PULAAR",
        name: "Pulaar",
        nativeName: "Pulaar",
        speakerPercentage: 23,
        regions: ["SAINT_LOUIS", "MATAM", "TAMBACOUNDA", "KOLDA"],
        isOfficial: false,
      },
      {
        code: "SERER",
        name: "Sérère",
        nativeName: "Sérère",
        speakerPercentage: 15,
        regions: ["FATICK", "THIES", "KAOLACK"],
        isOfficial: false,
      },
      {
        code: "MANDINKA",
        name: "Mandinka",
        nativeName: "Mandinka",
        speakerPercentage: 8,
        regions: ["TAMBACOUNDA", "KEDOUGOU", "KOLDA"],
        isOfficial: false,
      },
      {
        code: "DIOLA",
        name: "Diola",
        nativeName: "Diola",
        speakerPercentage: 5,
        regions: ["ZIGUINCHOR", "SEDHIOU"],
        isOfficial: false,
      },
      {
        code: "SONINKE",
        name: "Soninké",
        nativeName: "Soninké",
        speakerPercentage: 3,
        regions: ["SAINT_LOUIS", "MATAM", "TAMBACOUNDA"],
        isOfficial: false,
      },
    ];

    res.json({
      success: true,
      data: languages,
      meta: {
        total: languages.length,
        officialLanguages: languages.filter((l) => l.isOfficial).length,
        nationalLanguages: languages.filter((l) => !l.isOfficial).length,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des langues:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/referentials/establishment-types
// Types d'établissements de santé
// ===================================================================

router.get("/establishment-types", async (req: Request, res: Response) => {
  try {
    const establishmentTypes = [
      {
        code: "HOSPITAL",
        name: "Hôpital",
        description:
          "Établissement public de référence avec plateau technique complet",
        characteristics: [
          "Urgences 24h/24",
          "Hospitalisation",
          "Bloc opératoire",
          "Maternité",
        ],
        minServices: 5,
      },
      {
        code: "CLINIC",
        name: "Clinique",
        description: "Établissement privé avec services spécialisés",
        characteristics: [
          "Consultations spécialisées",
          "Chirurgie ambulatoire",
          "Imagerie",
        ],
        minServices: 3,
      },
      {
        code: "HEALTH_CENTER",
        name: "Centre de Santé",
        description: "Structure de soins de santé primaires communautaire",
        characteristics: [
          "Consultations générales",
          "Vaccination",
          "Soins maternels",
          "Pharmacie",
        ],
        minServices: 2,
      },
      {
        code: "PRIVATE_PRACTICE",
        name: "Cabinet Privé",
        description: "Cabinet médical ou dentaire individuel ou de groupe",
        characteristics: ["Consultations", "Soins spécialisés"],
        minServices: 1,
      },
    ];

    res.json({
      success: true,
      data: establishmentTypes,
      meta: {
        total: establishmentTypes.length,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types d'établissements:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
});

export default router;
