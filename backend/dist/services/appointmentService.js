"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentService = void 0;
// src/services/appointmentService.ts - Service rendez-vous
const prisma_1 = __importDefault(require("../utils/prisma"));
class AppointmentService {
    async createAppointment(patientId, data) {
        return prisma_1.default.appointment.create({
            data: {
                ...data,
                patientId,
                appointmentDate: new Date(data.appointmentDate),
                status: 'SCHEDULED',
                isUrgent: data.type === 'EMERGENCY',
                cost: 0, // TODO: Calculer le coût selon le tarif du médecin
            },
        });
    }
    async getAppointmentById(id) {
        return prisma_1.default.appointment.findUnique({
            where: { id },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                establishment: true,
            },
        });
    }
    async updateAppointment(id, data) {
        return prisma_1.default.appointment.update({
            where: { id },
            data: {
                ...data,
                appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
            },
        });
    }
    async cancelAppointment(id) {
        return prisma_1.default.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
}
exports.appointmentService = new AppointmentService();
//# sourceMappingURL=appointmentService.js.map