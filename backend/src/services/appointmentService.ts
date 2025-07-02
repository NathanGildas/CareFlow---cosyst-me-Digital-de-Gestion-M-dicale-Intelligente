// src/services/appointmentService.ts - Service rendez-vous
import prisma from '../utils/prisma';
import { CreateAppointmentRequest, UpdateAppointmentRequest } from '../types/appointment.types';

class AppointmentService {
  async createAppointment(patientId: string, data: CreateAppointmentRequest) {
    return prisma.appointment.create({
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

  async getAppointmentById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        establishment: true,
      },
    });
  }

  async updateAppointment(id: string, data: UpdateAppointmentRequest) {
    return prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
      },
    });
  }

  async cancelAppointment(id: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

export const appointmentService = new AppointmentService();