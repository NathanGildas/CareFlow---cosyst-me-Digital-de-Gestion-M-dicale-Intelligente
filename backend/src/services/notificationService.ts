// src/services/notificationService.ts - Service de notifications
import prisma from '../utils/prisma';
import { emailService } from './emailService';

export interface NotificationData {
  userId: string;
  type: 'APPOINTMENT' | 'INSURANCE' | 'SYSTEM' | 'MEDICAL' | 'SECURITY';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionUrl?: string;
  metadata?: Record<string, any>;
  channels?: ('email' | 'sms' | 'push')[];
}

class NotificationService {
  async create(data: NotificationData): Promise<any> {
    // TODO: Créer le modèle Notification dans le schéma Prisma
    const notification = {
      id: Math.random().toString(36),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
      isRead: false,
      createdAt: new Date(),
    };

    // Envoyer selon les canaux demandés
    if (data.channels?.includes('email')) {
      await this.sendEmail(data);
    }

    if (data.channels?.includes('sms')) {
      await this.sendSMS(data);
    }

    if (data.channels?.includes('push')) {
      await this.sendPush(data);
    }

    return notification;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // TODO: Implémenter avec le modèle Notification
    console.log(`Notification ${notificationId} marquée comme lue pour ${userId}`);
  }

  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  } = {}) {
    // TODO: Implémenter avec le modèle Notification
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  private async sendEmail(data: NotificationData): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (user?.email) {
        await emailService.sendNotification({
          to: user.email,
          subject: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
        });
      }
    } catch (error) {
      console.error('Erreur envoi email notification:', error);
    }
  }

  private async sendSMS(data: NotificationData): Promise<void> {
    // TODO: Implémenter l'envoi SMS
    console.log('SMS notification:', data);
  }

  private async sendPush(data: NotificationData): Promise<void> {
    // TODO: Implémenter les notifications push
    console.log('Push notification:', data);
  }

  // Notifications spécialisées
  async notifyAppointmentCreated(appointmentId: string): Promise<void> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        establishment: true,
      },
    });

    if (!appointment) return;

    // Notifier le patient
    await this.create({
      userId: appointment.patient.userId,
      type: 'APPOINTMENT',
      title: 'Rendez-vous confirmé',
      message: `Votre rendez-vous avec Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} est confirmé pour le ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}.`,
      priority: 'MEDIUM',
      actionUrl: `/patient/appointments/${appointmentId}`,
      channels: ['email', 'sms'],
    });

    // Notifier le médecin
    await this.create({
      userId: appointment.doctor.userId,
      type: 'APPOINTMENT',
      title: 'Nouveau rendez-vous',
      message: `Nouveau rendez-vous avec ${appointment.patient.user.firstName} ${appointment.patient.user.lastName} le ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}.`,
      priority: 'MEDIUM',
      actionUrl: `/doctor/appointments/${appointmentId}`,
      channels: ['email'],
    });
  }

  async notifyAppointmentCancelled(appointmentId: string): Promise<void> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) return;

    // Notifier les deux parties
    const notifications = [
      {
        userId: appointment.patient.userId,
        message: `Votre rendez-vous avec Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} a été annulé.`,
        actionUrl: '/patient/appointments',
      },
      {
        userId: appointment.doctor.userId,
        message: `Le rendez-vous avec ${appointment.patient.user.firstName} ${appointment.patient.user.lastName} du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} a été annulé.`,
        actionUrl: '/doctor/schedule',
      },
    ];

    for (const notif of notifications) {
      await this.create({
        ...notif,
        type: 'APPOINTMENT',
        title: 'Rendez-vous annulé',
        priority: 'MEDIUM',
        channels: ['email', 'sms'],
      });
    }
  }
}

export const notificationService = new NotificationService();