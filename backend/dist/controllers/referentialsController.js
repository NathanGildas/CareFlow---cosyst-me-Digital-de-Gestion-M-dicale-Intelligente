"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getDoctors = exports.getEstablishmentById = exports.getEstablishments = exports.getInsuranceCompanyById = exports.getInsuranceCompanies = exports.getInsuranceTypes = exports.getSpecialties = exports.getRegions = void 0;
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const prisma = new client_1.PrismaClient();
// =====================================================
// ENUMS ET RÉFÉRENTIELS
// =====================================================
/**
 * Liste des régions du Sénégal
 * GET /api/referentials/regions
 */
const getRegions = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur récupération régions:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getRegions = getRegions;
/**
 * Liste des spécialités médicales
 * GET /api/referentials/specialties
 */
const getSpecialties = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur récupération spécialités:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getSpecialties = getSpecialties;
/**
 * Liste des types d'assurance
 * GET /api/referentials/insurance-types
 */
const getInsuranceTypes = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur récupération types assurance:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getInsuranceTypes = getInsuranceTypes;
// =====================================================
// COMPAGNIES D'ASSURANCE
// =====================================================
/**
 * Liste des compagnies d'assurance
 * GET /api/referentials/insurance-companies
 */
const getInsuranceCompanies = async (req, res) => {
    try {
        const { region } = req.query;
        let whereClause = { isActive: true };
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
    }
    catch (error) {
        console.error("Erreur récupération compagnies:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getInsuranceCompanies = getInsuranceCompanies;
/**
 * Détails d'une compagnie d'assurance
 * GET /api/referentials/insurance-companies/:id
 */
const getInsuranceCompanyById = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur récupération compagnie:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getInsuranceCompanyById = getInsuranceCompanyById;
// =====================================================
// ÉTABLISSEMENTS DE SANTÉ
// =====================================================
/**
 * Liste des établissements de santé
 * GET /api/referentials/establishments
 */
const getEstablishments = async (req, res) => {
    try {
        const { region, type, city } = req.query;
        // Validation des paramètres
        const querySchema = joi_1.default.object({
            region: joi_1.default.string().optional(),
            type: joi_1.default.string()
                .valid("HOSPITAL", "CLINIC", "PRIVATE_PRACTICE", "HEALTH_CENTER")
                .optional(),
            city: joi_1.default.string().optional(),
        });
        const { error } = querySchema.validate(req.query);
        if (error) {
            res.status(400).json({
                success: false,
                message: "Paramètres de recherche invalides",
            });
            return;
        }
        let whereClause = { isActive: true };
        if (region)
            whereClause.region = region;
        if (type)
            whereClause.type = type;
        if (city)
            whereClause.city = { contains: city, mode: "insensitive" };
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
    }
    catch (error) {
        console.error("Erreur récupération établissements:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getEstablishments = getEstablishments;
/**
 * Détails d'un établissement
 * GET /api/referentials/establishments/:id
 */
const getEstablishmentById = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erreur récupération établissement:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getEstablishmentById = getEstablishmentById;
// =====================================================
// MÉDECINS
// =====================================================
/**
 * Liste des médecins avec filtres
 * GET /api/referentials/doctors
 */
const getDoctors = async (req, res) => {
    try {
        const { specialty, region, establishmentId, page = 1, limit = 20, } = req.query;
        // Validation
        const querySchema = joi_1.default.object({
            specialty: joi_1.default.string().optional(),
            region: joi_1.default.string().optional(),
            establishmentId: joi_1.default.string().optional(),
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(50).default(20),
        });
        const { error, value } = querySchema.validate(req.query);
        if (error) {
            res.status(400).json({
                success: false,
                message: "Paramètres invalides",
            });
            return;
        }
        let whereClause = { isActive: true };
        if (specialty)
            whereClause.specialty = specialty;
        if (establishmentId)
            whereClause.establishmentId = establishmentId;
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
    }
    catch (error) {
        console.error("Erreur récupération médecins:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getDoctors = getDoctors;
/**
 * Statistiques générales
 * GET /api/referentials/stats
 */
const getStats = async (req, res) => {
    try {
        const [totalPatients, totalDoctors, totalEstablishments, totalInsuranceCompanies, totalAppointments, totalConsultations,] = await Promise.all([
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
    }
    catch (error) {
        console.error("Erreur récupération statistiques:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};
exports.getStats = getStats;
exports.default = {
    getRegions: exports.getRegions,
    getSpecialties: exports.getSpecialties,
    getInsuranceTypes: exports.getInsuranceTypes,
    getInsuranceCompanies: exports.getInsuranceCompanies,
    getInsuranceCompanyById: exports.getInsuranceCompanyById,
    getEstablishments: exports.getEstablishments,
    getEstablishmentById: exports.getEstablishmentById,
    getDoctors: exports.getDoctors,
    getStats: exports.getStats,
};
//# sourceMappingURL=referentialsController.js.map