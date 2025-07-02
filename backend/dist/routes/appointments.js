"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/appointments.ts - Routes complètes pour la gestion des rendez-vous (CORRIGÉES)
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const appointmentsController_1 = __importDefault(require("../controllers/appointmentsController"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// ===================================================================
// FONCTIONS UTILITAIRES POUR LES RELATIONS USER
// ===================================================================
/**
 * Récupérer l'ID du patient à partir de l'utilisateur connecté
 */
const getPatientIdFromUser = async (userId) => {
    const patient = await prisma_1.default.patient.findUnique({
        where: { userId },
        select: { id: true },
    });
    return patient?.id || null;
};
/**
 * Récupérer l'ID du médecin à partir de l'utilisateur connecté
 */
const getDoctorIdFromUser = async (userId) => {
    const doctor = await prisma_1.default.doctor.findUnique({
        where: { userId },
        select: { id: true },
    });
    return doctor?.id || null;
};
// ===================================================================
// RATE LIMITING
// ===================================================================
const appointmentsRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requêtes max par IP
    message: {
        success: false,
        message: 'Trop de requêtes de rendez-vous. Réessayez dans 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const bookingRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 créations de RDV max par heure
    message: {
        success: false,
        message: 'Trop de créations de rendez-vous. Réessayez dans 1 heure.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// ===================================================================
// ROUTES PUBLIQUES (pour la recherche de créneaux)
// ===================================================================
/**
 * @route   GET /api/appointments/available-slots
 * @desc    Récupérer les créneaux disponibles pour un médecin
 * @access  Public
 * @query   { doctorId: string, date: string, duration?: number }
 */
router.get('/available-slots', appointmentsRateLimit, appointmentsController_1.default.getAvailableSlots);
// ===================================================================
// ROUTES PROTÉGÉES - PATIENTS
// ===================================================================
/**
 * @route   POST /api/appointments
 * @desc    Créer un nouveau rendez-vous (patients uniquement)
 * @access  Private (Patient)
 * @body    { doctorId, establishmentId, appointmentDate, duration?, type?, reason, notes? }
 */
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, bookingRateLimit, appointmentsController_1.default.createAppointment);
/**
 * @route   GET /api/appointments/patient/:patientId
 * @desc    Récupérer les rendez-vous d'un patient
 * @access  Private (Patient propriétaire ou Admin)
 * @query   { status?, startDate?, endDate?, page?, limit? }
 */
router.get('/patient/:patientId', authMiddleware_1.authenticateToken, appointmentsRateLimit, appointmentsController_1.default.getPatientAppointments);
/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Récupérer les rendez-vous du patient connecté
 * @access  Private (Patient)
 */
router.get('/my-appointments', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Récupérer l'ID du patient connecté
        const patientId = await getPatientIdFromUser(req.user.id);
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Profil patient non trouvé pour cet utilisateur',
            });
        }
        // Rediriger vers getPatientAppointments avec l'ID du patient connecté
        req.params.patientId = patientId;
        appointmentsController_1.default.getPatientAppointments(req, res, next);
    })().catch(next);
});
// ===================================================================
// ROUTES PROTÉGÉES - MÉDECINS
// ===================================================================
/**
 * @route   GET /api/appointments/doctor/:doctorId
 * @desc    Récupérer les rendez-vous d'un médecin
 * @access  Private (Médecin propriétaire ou Admin)
 * @query   { status?, date?, page?, limit? }
 */
router.get('/doctor/:doctorId', authMiddleware_1.authenticateToken, authMiddleware_1.requireHealthcareProvider, appointmentsRateLimit, appointmentsController_1.default.getDoctorAppointments);
/**
 * @route   GET /api/appointments/my-schedule
 * @desc    Récupérer le planning du médecin connecté
 * @access  Private (Médecin)
 */
router.get('/my-schedule', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Récupérer l'ID du médecin connecté
        const doctorId = await getDoctorIdFromUser(req.user.id);
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Profil médecin non trouvé pour cet utilisateur',
            });
        }
        // Rediriger vers getDoctorAppointments avec l'ID du médecin connecté
        req.params.doctorId = doctorId;
        appointmentsController_1.default.getDoctorAppointments(req, res, next);
    })().catch(next);
});
/**
 * @route   GET /api/appointments/today
 * @desc    Récupérer les rendez-vous du jour pour le médecin connecté
 * @access  Private (Médecin)
 */
router.get('/today', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Récupérer l'ID du médecin connecté
        const doctorId = await getDoctorIdFromUser(req.user.id);
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Profil médecin non trouvé pour cet utilisateur',
            });
        }
        // Ajouter la date du jour aux paramètres de requête
        const today = new Date().toISOString().split('T')[0];
        req.query.date = today;
        req.params.doctorId = doctorId;
        appointmentsController_1.default.getDoctorAppointments(req, res, next);
    })().catch(next);
});
// ===================================================================
// ROUTES DE MODIFICATION (PATIENTS ET MÉDECINS)
// ===================================================================
/**
 * @route   PUT /api/appointments/:id
 * @desc    Mettre à jour un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 * @body    { appointmentDate?, duration?, reason?, notes?, status? }
 */
router.put('/:id', authMiddleware_1.authenticateToken, appointmentsRateLimit, appointmentsController_1.default.updateAppointment);
/**
 * @route   DELETE /api/appointments/:id
 * @desc    Annuler un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 */
router.delete('/:id', authMiddleware_1.authenticateToken, appointmentsRateLimit, appointmentsController_1.default.cancelAppointment);
/**
 * @route   PUT /api/appointments/:id/confirm
 * @desc    Confirmer un rendez-vous (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put('/:id/confirm', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Forcer le statut à CONFIRMED
        req.body = { status: 'CONFIRMED' };
        appointmentsController_1.default.updateAppointment(req, res, next);
    })().catch(next);
});
/**
 * @route   PUT /api/appointments/:id/complete
 * @desc    Marquer un rendez-vous comme terminé (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put('/:id/complete', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Forcer le statut à COMPLETED
        req.body = { status: 'COMPLETED' };
        await appointmentsController_1.default.updateAppointment(req, res, next);
    })().catch(next);
});
/**
 * @route   PUT /api/appointments/:id/no-show
 * @desc    Marquer un patient absent (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put('/:id/no-show', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, async (req, res, next) => {
    // Forcer le statut à NO_SHOW
    req.body = { status: 'NO_SHOW' };
    appointmentsController_1.default.updateAppointment(req, res, next);
});
// ===================================================================
// ROUTES STATISTIQUES ET RAPPORTS
// ===================================================================
/**
 * @route   GET /api/appointments/stats
 * @desc    Obtenir les statistiques des rendez-vous
 * @access  Private (Médecin pour ses stats, Admin pour toutes)
 * @query   { doctorId?, patientId?, period? }
 */
router.get('/stats', authMiddleware_1.authenticateToken, appointmentsRateLimit, appointmentsController_1.default.getAppointmentStats);
/**
 * @route   GET /api/appointments/stats/doctor
 * @desc    Statistiques du médecin connecté
 * @access  Private (Médecin)
 */
router.get('/stats/doctor', authMiddleware_1.authenticateToken, authMiddleware_1.requireDoctor, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Récupérer l'ID du médecin connecté
        const doctorId = await getDoctorIdFromUser(req.user.id);
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Profil médecin non trouvé pour cet utilisateur',
            });
        }
        // Ajouter l'ID du médecin connecté
        req.query.doctorId = doctorId;
        appointmentsController_1.default.getAppointmentStats(req, res, next);
    })().catch(next);
});
/**
 * @route   GET /api/appointments/stats/patient
 * @desc    Statistiques du patient connecté
 * @access  Private (Patient)
 */
router.get('/stats/patient', authMiddleware_1.authenticateToken, authMiddleware_1.requirePatient, appointmentsRateLimit, (req, res, next) => {
    (async () => {
        // Récupérer l'ID du patient connecté
        const patientId = await getPatientIdFromUser(req.user.id);
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Profil patient non trouvé pour cet utilisateur',
            });
        }
        // Ajouter l'ID du patient connecté
        req.query.patientId = patientId;
        appointmentsController_1.default.getAppointmentStats(req, res, next);
    })().catch(next);
});
// ===================================================================
// ROUTES ADMINISTRATIVES
// ===================================================================
/**
 * @route   GET /api/appointments
 * @desc    Récupérer tous les rendez-vous (admin uniquement)
 * @access  Private (Admin)
 * @query   { status?, doctorId?, patientId?, establishmentId?, page?, limit? }
 */
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, appointmentsRateLimit, async (req, res) => {
    // TODO: Implémenter getAllAppointments pour les admins
    res.status(501).json({
        success: false,
        message: 'Endpoint admin pas encore implémenté',
        note: 'Sera développé dans la phase admin',
    });
});
/**
 * @route   GET /api/appointments/:id
 * @desc    Récupérer les détails d'un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 */
router.get('/:id', authMiddleware_1.authenticateToken, appointmentsRateLimit, async (req, res) => {
    // TODO: Implémenter getAppointmentById
    res.status(501).json({
        success: false,
        message: 'Endpoint détails RDV pas encore implémenté',
        note: 'Sera développé prochainement',
    });
});
// ===================================================================
// DOCUMENTATION DES ENDPOINTS
// ===================================================================
/**
 * @route   GET /api/appointments/docs
 * @desc    Documentation des endpoints disponibles
 * @access  Public
 */
router.get('/docs', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Appointments CareFlow Sénégal',
        version: '1.0.0',
        endpoints: {
            public: {
                'GET /api/appointments/available-slots': 'Créneaux disponibles médecin',
                'GET /api/appointments/docs': 'Cette documentation',
            },
            patient: {
                'POST /api/appointments': 'Créer un rendez-vous',
                'GET /api/appointments/my-appointments': 'Mes rendez-vous',
                'PUT /api/appointments/:id': 'Modifier mon rendez-vous',
                'DELETE /api/appointments/:id': 'Annuler mon rendez-vous',
                'GET /api/appointments/stats/patient': 'Mes statistiques',
            },
            doctor: {
                'GET /api/appointments/my-schedule': 'Mon planning',
                'GET /api/appointments/today': 'Rendez-vous du jour',
                'PUT /api/appointments/:id/confirm': 'Confirmer rendez-vous',
                'PUT /api/appointments/:id/complete': 'Terminer rendez-vous',
                'PUT /api/appointments/:id/no-show': 'Marquer absent',
                'GET /api/appointments/stats/doctor': 'Mes statistiques',
            },
            admin: {
                'GET /api/appointments': 'Tous les rendez-vous',
                'GET /api/appointments/stats': 'Statistiques globales',
            },
        },
        statusCodes: {
            SCHEDULED: 'Programmé (nouveau RDV)',
            CONFIRMED: 'Confirmé par le médecin',
            CANCELLED: 'Annulé',
            COMPLETED: 'Terminé',
            NO_SHOW: 'Patient absent',
        },
        appointmentTypes: {
            CONSULTATION: 'Consultation standard',
            TELECONSULTATION: 'Consultation à distance',
            FOLLOWUP: 'Suivi médical',
            EMERGENCY: 'Urgence',
            SURGERY: 'Intervention chirurgicale',
        },
    });
});
exports.default = router;
//# sourceMappingURL=appointments.js.map