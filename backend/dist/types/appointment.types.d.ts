export type AppointmentType = 'CONSULTATION' | 'TELECONSULTATION' | 'FOLLOWUP' | 'EMERGENCY' | 'SURGERY';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export interface CreateAppointmentRequest {
    doctorId: string;
    establishmentId: string;
    appointmentDate: string;
    duration?: number;
    type?: AppointmentType;
    reason: string;
    notes?: string;
}
export interface UpdateAppointmentRequest {
    appointmentDate?: string;
    duration?: number;
    reason?: string;
    notes?: string;
    status?: AppointmentStatus;
}
export interface AppointmentResponse {
    id: string;
    patientId: string;
    doctorId: string;
    establishmentId: string;
    appointmentDate: string;
    duration: number;
    type: AppointmentType;
    status: AppointmentStatus;
    reason: string;
    notes?: string;
    cost: number;
    isUrgent: boolean;
    createdAt: string;
    updatedAt: string;
}
