"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentStats = exports.cancelAppointment = exports.updateAppointment = exports.getDoctorAppointments = exports.getPatientAppointments = exports.createAppointment = exports.getAvailableSlots = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("../middlewares/errorHandler");
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
/**
 * Vérifier les autorisations d'accès à un rendez-vous
 */
const checkAppointmentAccess = async (appointmentId, userId, userRole) => {
    const appointment = await prisma_1.default.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: { select: { userId: true } },
            doctor: { select: { userId: true } },
        },
    });
    if (!appointment) {
        return { hasAccess: false };
    }
    // Admin a accès à tout
    if (userRole === 'ADMIN') {
        return { hasAccess: true, appointment };
    }
    // Patient peut accéder à ses propres RDV
    if (userRole === 'PATIENT' && appointment.patient.userId === userId) {
        return { hasAccess: true, appointment };
    }
    // Médecin peut accéder aux RDV où il est impliqué
    if (userRole === 'DOCTOR' && appointment.doctor.userId === userId) {
        return { hasAccess: true, appointment };
    }
    return { hasAccess: false };
};
// ===================================================================
// VALIDATION SCHEMAS
// ===================================================================
const createAppointmentSchema = joi_1.default.object({
    doctorId: joi_1.default.string().uuid().required(),
    establishmentId: joi_1.default.string().uuid().required(),
    appointmentDate: joi_1.default.date().min('now').required(),
    duration: joi_1.default.number().integer().min(15).max(120).default(30),
    type: joi_1.default.string()
        .valid(...Object.values(client_1.AppointmentType))
        .default('CONSULTATION'),
    reason: joi_1.default.string().min(3).max(500).required(),
    notes: joi_1.default.string().max(1000).optional(),
});
const updateAppointmentSchema = joi_1.default.object({
    appointmentDate: joi_1.default.date().min('now').optional(),
    duration: joi_1.default.number().integer().min(15).max(120).optional(),
    reason: joi_1.default.string().min(3).max(500).optional(),
    notes: joi_1.default.string().max(1000).optional(),
    status: joi_1.default.string()
        .valid(...Object.values(client_1.AppointmentStatus))
        .optional(),
});
const availableSlotsSchema = joi_1.default.object({
    doctorId: joi_1.default.string().uuid().required(),
    date: joi_1.default.date().required(),
    duration: joi_1.default.number().integer().min(15).max(120).default(30),
});
// ===================================================================
// FONCTIONS UTILITAIRES MÉTIER
// ===================================================================
// Générer les créneaux disponibles pour un médecin
const generateAvailableSlots = async (doctorId, date, duration = 30) => {
    const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    // Récupérer les disponibilités du médecin pour ce jour
    const availability = await prisma_1.default.doctorAvailability.findFirst({
        where: {
            doctorId,
            dayOfWeek,
            isActive: true,
        },
    });
    if (!availability) {
        return []; // Aucune disponibilité ce jour-là
    }
    // Récupérer les RDV existants pour cette date
    const existingAppointments = await prisma_1.default.appointment.findMany({
        where: {
            doctorId,
            appointmentDate: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
            },
            status: {
                in: ['SCHEDULED', 'CONFIRMED'],
            },
        },
        select: {
            appointmentDate: true,
            duration: true,
        },
    });
    // Générer tous les créneaux possibles
    const slots = [];
    const startTime = availability.startTime; // Format "09:00"
    const endTime = availability.endTime; // Format "17:00"
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    let current = new Date(date);
    current.setHours(startHour, startMin, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);
    while (current < end) {
        const slotTime = current.toTimeString().slice(0, 5); // Format "HH:mm"
        // Vérifier si ce créneau est libre
        const isOccupied = existingAppointments.some((apt) => {
            const aptStart = new Date(apt.appointmentDate);
            const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
            const slotStart = current;
            const slotEnd = new Date(current.getTime() + duration * 60000);
            // Vérifier le chevauchement
            return slotStart < aptEnd && slotEnd > aptStart;
        });
        if (!isOccupied) {
            slots.push(slotTime);
        }
        // Passer au créneau suivant (intervalles de 15 minutes)
        current.setMinutes(current.getMinutes() + 15);
    }
    return slots;
};
// Calculer le coût du RDV
const calculateAppointmentCost = async (doctorId, duration, type) => {
    const doctor = await prisma_1.default.doctor.findUnique({
        where: { id: doctorId },
        select: { consultationFee: true },
    });
    if (!doctor) {
        throw new Error('Médecin non trouvé');
    }
    let baseCost = Number(doctor.consultationFee);
    // Ajustements selon le type
    switch (type) {
        case 'TELECONSULTATION':
            baseCost *= 0.8; // 20% de réduction
            break;
        case 'EMERGENCY':
            baseCost *= 1.5; // 50% de majoration
            break;
        case 'SURGERY':
            baseCost *= 3; // Triple tarif
            break;
        default:
            // CONSULTATION et FOLLOWUP gardent le tarif de base
            break;
    }
    // Ajustement selon la durée (si > 30 min)
    if (duration > 30) {
        const extraTime = duration - 30;
        baseCost += (extraTime / 30) * (baseCost * 0.5); // 50% du tarif de base par 30min supplémentaires
    }
    return Math.round(baseCost);
};
// ===================================================================
// CONTROLLERS
// ===================================================================
/**
 * Récupérer les créneaux disponibles pour un médecin
 * GET /api/appointments/available-slots
 */
exports.getAvailableSlots = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = availableSlotsSchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Paramètres invalides',
            errors: error.details,
        });
    }
    const { doctorId, date, duration } = value;
    // Vérifier que le médecin existe
    const doctor = await prisma_1.default.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true, isActive: true },
    });
    if (!doctor || !doctor.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Médecin non trouvé ou inactif',
        });
    }
    const slots = await generateAvailableSlots(doctorId, new Date(date), duration);
    res.status(200).json({
        success: true,
        data: {
            doctorId,
            date: date.toISOString().split('T')[0],
            duration,
            availableSlots: slots,
            totalSlots: slots.length,
        },
    });
});
/**
 * Créer un nouveau rendez-vous
 * POST /api/appointments
 */
exports.createAppointment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = createAppointmentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: error.details,
        });
    }
    const { doctorId, establishmentId, appointmentDate, duration, type, reason, notes, } = value;
    // Récupérer l'ID du patient à partir de l'utilisateur connecté
    const patientId = await getPatientIdFromUser(req.user.id);
    if (!patientId) {
        return res.status(400).json({
            success: false,
            message: 'Profil patient non trouvé pour cet utilisateur',
        });
    }
    // Vérifier que le médecin existe et est actif
    const doctor = await prisma_1.default.doctor.findUnique({
        where: { id: doctorId },
        include: { establishment: true },
    });
    if (!doctor || !doctor.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Médecin non trouvé ou inactif',
        });
    }
    // Vérifier que l'établissement existe
    const establishment = await prisma_1.default.establishment.findUnique({
        where: { id: establishmentId },
    });
    if (!establishment || !establishment.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Établissement non trouvé ou inactif',
        });
    }
    // Vérifier que le créneau est disponible
    const requestedDate = new Date(appointmentDate);
    const availableSlots = await generateAvailableSlots(doctorId, requestedDate, duration);
    const requestedTime = requestedDate.toTimeString().slice(0, 5);
    if (!availableSlots.includes(requestedTime)) {
        return res.status(409).json({
            success: false,
            message: 'Créneau non disponible',
            data: { availableSlots },
        });
    }
    // Calculer le coût
    const cost = await calculateAppointmentCost(doctorId, duration, type);
    // Créer le rendez-vous
    const appointment = await prisma_1.default.appointment.create({
        data: {
            patientId,
            doctorId,
            establishmentId,
            appointmentDate: requestedDate,
            duration,
            type: type,
            status: 'SCHEDULED',
            reason,
            notes,
            cost,
            isUrgent: type === 'EMERGENCY',
        },
        include: {
            patient: {
                include: { user: true },
            },
            doctor: {
                include: { user: true },
            },
            establishment: true,
        },
    });
    res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: appointment,
    });
});
/**
 * Récupérer les rendez-vous d'un patient
 * GET /api/appointments/patient/:patientId
 */
exports.getPatientAppointments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { patientId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    // Vérifications d'autorisation
    if (req.user.role === 'PATIENT') {
        const userPatientId = await getPatientIdFromUser(req.user.id);
        if (userPatientId !== patientId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - vous ne pouvez voir que vos propres rendez-vous',
            });
        }
    }
    else if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Accès non autorisé',
        });
    }
    // Construction de la clause WHERE
    let whereClause = { patientId };
    if (status && status !== 'all') {
        whereClause.status = status;
    }
    if (startDate || endDate) {
        whereClause.appointmentDate = {};
        if (startDate)
            whereClause.appointmentDate.gte = new Date(startDate);
        if (endDate)
            whereClause.appointmentDate.lte = new Date(endDate);
    }
    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const [appointments, totalCount] = await Promise.all([
        prisma_1.default.appointment.findMany({
            where: whereClause,
            include: {
                doctor: {
                    include: { user: true },
                },
                establishment: true,
                consultation: {
                    select: {
                        id: true,
                        diagnosis: true,
                        treatment: true,
                    },
                },
            },
            orderBy: { appointmentDate: 'desc' },
            skip: offset,
            take: Number(limit),
        }),
        prisma_1.default.appointment.count({ where: whereClause }),
    ]);
    const totalPages = Math.ceil(totalCount / Number(limit));
    res.status(200).json({
        success: true,
        data: appointments,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1,
        },
    });
});
/**
 * Récupérer les rendez-vous d'un médecin
 * GET /api/appointments/doctor/:doctorId
 */
exports.getDoctorAppointments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId } = req.params;
    const { status, date, page = 1, limit = 20 } = req.query;
    // Vérifications d'autorisation
    if (req.user.role === 'DOCTOR') {
        const userDoctorId = await getDoctorIdFromUser(req.user.id);
        if (userDoctorId !== doctorId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - vous ne pouvez voir que votre propre planning',
            });
        }
    }
    else if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Accès non autorisé',
        });
    }
    let whereClause = { doctorId };
    if (status && status !== 'all') {
        whereClause.status = status;
    }
    if (date) {
        const targetDate = new Date(date);
        whereClause.appointmentDate = {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
        };
    }
    const offset = (Number(page) - 1) * Number(limit);
    const [appointments, totalCount] = await Promise.all([
        prisma_1.default.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    include: { user: true },
                },
                establishment: true,
                consultation: {
                    select: {
                        id: true,
                        diagnosis: true,
                        treatment: true,
                    },
                },
            },
            orderBy: { appointmentDate: 'asc' },
            skip: offset,
            take: Number(limit),
        }),
        prisma_1.default.appointment.count({ where: whereClause }),
    ]);
    const totalPages = Math.ceil(totalCount / Number(limit));
    res.status(200).json({
        success: true,
        data: appointments,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1,
        },
    });
});
/**
 * Mettre à jour un rendez-vous
 * PUT /api/appointments/:id
 */
exports.updateAppointment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { error, value } = updateAppointmentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: error.details,
        });
    }
    // Vérifier les autorisations d'accès
    const { hasAccess, appointment } = await checkAppointmentAccess(id, req.user.id, req.user.role);
    if (!hasAccess || !appointment) {
        return res.status(404).json({
            success: false,
            message: 'Rendez-vous non trouvé ou accès non autorisé',
        });
    }
    // Mettre à jour
    const updatedAppointment = await prisma_1.default.appointment.update({
        where: { id },
        data: value,
        include: {
            patient: {
                include: { user: true },
            },
            doctor: {
                include: { user: true },
            },
            establishment: true,
        },
    });
    res.status(200).json({
        success: true,
        message: 'Rendez-vous mis à jour avec succès',
        data: updatedAppointment,
    });
});
/**
 * Annuler un rendez-vous
 * DELETE /api/appointments/:id
 */
exports.cancelAppointment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Vérifier les autorisations d'accès
    const { hasAccess, appointment } = await checkAppointmentAccess(id, req.user.id, req.user.role);
    if (!hasAccess || !appointment) {
        return res.status(404).json({
            success: false,
            message: 'Rendez-vous non trouvé ou accès non autorisé',
        });
    }
    // Marquer comme annulé au lieu de supprimer
    const cancelledAppointment = await prisma_1.default.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
    });
    res.status(200).json({
        success: true,
        message: 'Rendez-vous annulé avec succès',
        data: cancelledAppointment,
    });
});
/**
 * Obtenir les statistiques des rendez-vous
 * GET /api/appointments/stats
 */
exports.getAppointmentStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId, patientId, period = 'month' } = req.query;
    // Calculer la période
    const now = new Date();
    let startDate;
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    let whereClause = {
        appointmentDate: {
            gte: startDate,
            lte: now,
        },
    };
    if (doctorId)
        whereClause.doctorId = doctorId;
    if (patientId)
        whereClause.patientId = patientId;
    // Statistiques par statut
    const statsByStatus = await prisma_1.default.appointment.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true },
    });
    // Statistiques par type
    const statsByType = await prisma_1.default.appointment.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { type: true },
    });
    // Total des revenus (pour les médecins)
    const totalRevenue = await prisma_1.default.appointment.aggregate({
        where: {
            ...whereClause,
            status: 'COMPLETED',
        },
        _sum: { cost: true },
    });
    res.status(200).json({
        success: true,
        data: {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            statsByStatus,
            statsByType,
            totalRevenue: Number(totalRevenue._sum.cost || 0),
        },
    });
});
exports.default = {
    getAvailableSlots: exports.getAvailableSlots,
    createAppointment: exports.createAppointment,
    getPatientAppointments: exports.getPatientAppointments,
    getDoctorAppointments: exports.getDoctorAppointments,
    updateAppointment: exports.updateAppointment,
    cancelAppointment: exports.cancelAppointment,
    getAppointmentStats: exports.getAppointmentStats,
};
//# sourceMappingURL=appointmentsController.js.map