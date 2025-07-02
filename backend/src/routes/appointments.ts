// src/routes/appointments.ts - Routes complètes pour la gestion des rendez-vous (CORRIGÉES)
import express from 'express';
import rateLimit from 'express-rate-limit';
import appointmentsController from '../controllers/appointmentsController';
import prisma from '../utils/prisma';
import {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireHealthcareProvider,
} from '../middlewares/authMiddleware';

const router = express.Router();

// ===================================================================
// FONCTIONS UTILITAIRES POUR LES RELATIONS USER
// ===================================================================

/**
 * Récupérer l'ID du patient à partir de l'utilisateur connecté
 */
const getPatientIdFromUser = async (userId: string): Promise<string | null> => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });
  return patient?.id || null;
};

/**
 * Récupérer l'ID du médecin à partir de l'utilisateur connecté
 */
const getDoctorIdFromUser = async (userId: string): Promise<string | null> => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return doctor?.id || null;
};

// ===================================================================
// RATE LIMITING
// ===================================================================

const appointmentsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requêtes max par IP
  message: {
    success: false,
    message: 'Trop de requêtes de rendez-vous. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingRateLimit = rateLimit({
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
router.get(
  '/available-slots',
  appointmentsRateLimit,
  appointmentsController.getAvailableSlots
);

// ===================================================================
// ROUTES PROTÉGÉES - PATIENTS
// ===================================================================

/**
 * @route   POST /api/appointments
 * @desc    Créer un nouveau rendez-vous (patients uniquement)
 * @access  Private (Patient)
 * @body    { doctorId, establishmentId, appointmentDate, duration?, type?, reason, notes? }
 */
router.post(
  '/',
  authenticateToken,
  requirePatient,
  bookingRateLimit,
  appointmentsController.createAppointment
);

/**
 * @route   GET /api/appointments/patient/:patientId
 * @desc    Récupérer les rendez-vous d'un patient
 * @access  Private (Patient propriétaire ou Admin)
 * @query   { status?, startDate?, endDate?, page?, limit? }
 */
router.get(
  '/patient/:patientId',
  authenticateToken,
  appointmentsRateLimit,
  appointmentsController.getPatientAppointments
);

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Récupérer les rendez-vous du patient connecté
 * @access  Private (Patient)
 */
router.get(
  '/my-appointments',
  authenticateToken,
  requirePatient,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Récupérer l'ID du patient connecté
      const patientId = await getPatientIdFromUser(req.user!.id);
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Profil patient non trouvé pour cet utilisateur',
        });
      }

      // Rediriger vers getPatientAppointments avec l'ID du patient connecté
      req.params.patientId = patientId;
      appointmentsController.getPatientAppointments(req, res, next);
    })().catch(next);
  }
);

// ===================================================================
// ROUTES PROTÉGÉES - MÉDECINS
// ===================================================================

/**
 * @route   GET /api/appointments/doctor/:doctorId
 * @desc    Récupérer les rendez-vous d'un médecin
 * @access  Private (Médecin propriétaire ou Admin)
 * @query   { status?, date?, page?, limit? }
 */
router.get(
  '/doctor/:doctorId',
  authenticateToken,
  requireHealthcareProvider,
  appointmentsRateLimit,
  appointmentsController.getDoctorAppointments
);

/**
 * @route   GET /api/appointments/my-schedule
 * @desc    Récupérer le planning du médecin connecté
 * @access  Private (Médecin)
 */
router.get(
  '/my-schedule',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Récupérer l'ID du médecin connecté
      const doctorId = await getDoctorIdFromUser(req.user!.id);
      if (!doctorId) {
        return res.status(400).json({
          success: false,
          message: 'Profil médecin non trouvé pour cet utilisateur',
        });
      }

      // Rediriger vers getDoctorAppointments avec l'ID du médecin connecté
      req.params.doctorId = doctorId;
      appointmentsController.getDoctorAppointments(req, res, next);
    })().catch(next);
  }
);

/**
 * @route   GET /api/appointments/today
 * @desc    Récupérer les rendez-vous du jour pour le médecin connecté
 * @access  Private (Médecin)
 */
router.get(
  '/today',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Récupérer l'ID du médecin connecté
      const doctorId = await getDoctorIdFromUser(req.user!.id);
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
      appointmentsController.getDoctorAppointments(req, res, next);
    })().catch(next);
  }
);

// ===================================================================
// ROUTES DE MODIFICATION (PATIENTS ET MÉDECINS)
// ===================================================================

/**
 * @route   PUT /api/appointments/:id
 * @desc    Mettre à jour un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 * @body    { appointmentDate?, duration?, reason?, notes?, status? }
 */
router.put(
  '/:id',
  authenticateToken,
  appointmentsRateLimit,
  appointmentsController.updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Annuler un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  appointmentsRateLimit,
  appointmentsController.cancelAppointment
);

/**
 * @route   PUT /api/appointments/:id/confirm
 * @desc    Confirmer un rendez-vous (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put(
  '/:id/confirm',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Forcer le statut à CONFIRMED
      req.body = { status: 'CONFIRMED' };
      appointmentsController.updateAppointment(req, res, next);
    })().catch(next);
  }
);

/**
 * @route   PUT /api/appointments/:id/complete
 * @desc    Marquer un rendez-vous comme terminé (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put(
  '/:id/complete',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Forcer le statut à COMPLETED
      req.body = { status: 'COMPLETED' };
      await appointmentsController.updateAppointment(req, res, next);
    })().catch(next);
  }
);

/**
 * @route   PUT /api/appointments/:id/no-show
 * @desc    Marquer un patient absent (médecins uniquement)
 * @access  Private (Médecin)
 */
router.put(
  '/:id/no-show',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  async (req, res, next) => {
    // Forcer le statut à NO_SHOW
    req.body = { status: 'NO_SHOW' };
    appointmentsController.updateAppointment(req, res, next);
  }
);

// ===================================================================
// ROUTES STATISTIQUES ET RAPPORTS
// ===================================================================

/**
 * @route   GET /api/appointments/stats
 * @desc    Obtenir les statistiques des rendez-vous
 * @access  Private (Médecin pour ses stats, Admin pour toutes)
 * @query   { doctorId?, patientId?, period? }
 */
router.get(
  '/stats',
  authenticateToken,
  appointmentsRateLimit,
  appointmentsController.getAppointmentStats
);

/**
 * @route   GET /api/appointments/stats/doctor
 * @desc    Statistiques du médecin connecté
 * @access  Private (Médecin)
 */
router.get(
  '/stats/doctor',
  authenticateToken,
  requireDoctor,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Récupérer l'ID du médecin connecté
      const doctorId = await getDoctorIdFromUser(req.user!.id);
      if (!doctorId) {
        return res.status(400).json({
          success: false,
          message: 'Profil médecin non trouvé pour cet utilisateur',
        });
      }

      // Ajouter l'ID du médecin connecté
      req.query.doctorId = doctorId;
      appointmentsController.getAppointmentStats(req, res, next);
    })().catch(next);
  }
);

/**
 * @route   GET /api/appointments/stats/patient
 * @desc    Statistiques du patient connecté
 * @access  Private (Patient)
 */
router.get(
  '/stats/patient',
  authenticateToken,
  requirePatient,
  appointmentsRateLimit,
  (req, res, next) => {
    (async () => {
      // Récupérer l'ID du patient connecté
      const patientId = await getPatientIdFromUser(req.user!.id);
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Profil patient non trouvé pour cet utilisateur',
        });
      }

      // Ajouter l'ID du patient connecté
      req.query.patientId = patientId;
      appointmentsController.getAppointmentStats(req, res, next);
    })().catch(next);
  }
);

// ===================================================================
// ROUTES ADMINISTRATIVES
// ===================================================================

/**
 * @route   GET /api/appointments
 * @desc    Récupérer tous les rendez-vous (admin uniquement)
 * @access  Private (Admin)
 * @query   { status?, doctorId?, patientId?, establishmentId?, page?, limit? }
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  appointmentsRateLimit,
  async (req, res) => {
    // TODO: Implémenter getAllAppointments pour les admins
    res.status(501).json({
      success: false,
      message: 'Endpoint admin pas encore implémenté',
      note: 'Sera développé dans la phase admin',
    });
  }
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Récupérer les détails d'un rendez-vous
 * @access  Private (Patient propriétaire, Médecin concerné, ou Admin)
 */
router.get(
  '/:id',
  authenticateToken,
  appointmentsRateLimit,
  async (req, res) => {
    // TODO: Implémenter getAppointmentById
    res.status(501).json({
      success: false,
      message: 'Endpoint détails RDV pas encore implémenté',
      note: 'Sera développé prochainement',
    });
  }
);

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

export default router;
