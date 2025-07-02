import { CreateAppointmentRequest, UpdateAppointmentRequest } from '../types/appointment.types';
declare class AppointmentService {
    createAppointment(patientId: string, data: CreateAppointmentRequest): Promise<{
        type: import(".prisma/client").$Enums.AppointmentType;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        establishmentId: string;
        appointmentDate: Date;
        duration: number;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        reason: string;
        notes: string | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        isUrgent: boolean;
    }>;
    getAppointmentById(id: string): Promise<({
        patient: {
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                phone: string | null;
                id: string;
                isActive: boolean;
                updatedAt: Date;
            };
        } & {
            region: import(".prisma/client").$Enums.SenegalRegion;
            createdAt: Date;
            city: string | null;
            address: string;
            id: string;
            updatedAt: Date;
            userId: string;
            nationalId: string | null;
            dateOfBirth: Date;
            gender: import(".prisma/client").$Enums.Gender;
            emergencyContact: string;
            bloodType: string | null;
            allergies: string[];
            chronicConditions: string[];
        };
        doctor: {
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                phone: string | null;
                id: string;
                isActive: boolean;
                updatedAt: Date;
            };
        } & {
            specialty: import(".prisma/client").$Enums.MedicalSpecialty;
            createdAt: Date;
            id: string;
            isActive: boolean;
            updatedAt: Date;
            userId: string;
            establishmentId: string;
            licenseNumber: string;
            subSpecialty: string | null;
            experienceYears: number;
            education: string;
            bio: string | null;
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            languagesSpoken: import(".prisma/client").$Enums.LanguageSpoken[];
        };
        establishment: {
            email: string | null;
            type: import(".prisma/client").$Enums.EstablishmentType;
            region: import(".prisma/client").$Enums.SenegalRegion;
            name: string;
            capacity: number | null;
            createdAt: Date;
            city: string;
            address: string;
            phone: string;
            id: string;
            isActive: boolean;
            updatedAt: Date;
            website: string | null;
        };
    } & {
        type: import(".prisma/client").$Enums.AppointmentType;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        establishmentId: string;
        appointmentDate: Date;
        duration: number;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        reason: string;
        notes: string | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        isUrgent: boolean;
    }) | null>;
    updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<{
        type: import(".prisma/client").$Enums.AppointmentType;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        establishmentId: string;
        appointmentDate: Date;
        duration: number;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        reason: string;
        notes: string | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        isUrgent: boolean;
    }>;
    cancelAppointment(id: string): Promise<{
        type: import(".prisma/client").$Enums.AppointmentType;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        establishmentId: string;
        appointmentDate: Date;
        duration: number;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        reason: string;
        notes: string | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        isUrgent: boolean;
    }>;
}
export declare const appointmentService: AppointmentService;
export {};
