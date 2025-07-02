// src/types/user.types.ts - Types pour les utilisateurs et profils CareFlow
import type { Role } from './auth.types';

// ===== TYPES DE BASE UTILISATEUR =====

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
}

export interface UserProfile extends BaseUser {
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  nationality?: string;
  preferredLanguage?: 'fr' | 'en' | 'wo';
  timezone?: string;
}

// ===== PROFIL PATIENT =====

export interface PatientProfile extends UserProfile {
  role: 'PATIENT';
  patient?: {
    id: string;
    userId: string;
    patientNumber: string;
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    height?: number; // en cm
    weight?: number; // en kg
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    insurance?: {
      companyId: string;
      companyName: string;
      policyNumber: string;
      coverageType: string;
      validUntil: string;
      coverageAmount: number;
    };
    preferences: {
      appointmentReminders: boolean;
      smsNotifications: boolean;
      emailNotifications: boolean;
      dataSharing: boolean;
    };
  };
}

// ===== PROFIL MÉDECIN =====

export interface DoctorProfile extends UserProfile {
  role: 'DOCTOR';
  doctor?: {
    id: string;
    userId: string;
    doctorNumber: string;
    licenseNumber: string;
    specialtyId: string;
    specialtyName: string;
    establishmentId: string;
    establishmentName: string;
    yearsOfExperience: number;
    consultationFee: number;
    biography?: string;
    isActive: boolean;
    
    // Formation et certifications
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      country?: string;
    }>;
    
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
      expiryDate?: string;
      certificateNumber?: string;
    }>;
    
    // Langues parlées
    languages: string[];
    
    // Disponibilités
    availability: {
      [key: string]: {
        isAvailable: boolean;
        startTime: string;
        endTime: string;
        breakStart?: string;
        breakEnd?: string;
      };
    };
    
    // Statistiques
    stats: {
      totalPatients: number;
      totalConsultations: number;
      averageRating: number;
      responseTime: string;
      completionRate: number;
    };
    
    // Préférences
    preferences: {
      allowOnlineBooking: boolean;
      allowTeleconsultation: boolean;
      maxDailyAppointments: number;
      appointmentDuration: number; // en minutes
      advanceBookingDays: number;
      cancellationPolicy: string;
    };
  };
}

// ===== PROFIL ASSUREUR =====

export interface InsurerProfile extends UserProfile {
  role: 'INSURER';
  insurer?: {
    id: string;
    userId: string;
    companyId: string;
    companyName: string;
    position: string;
    department?: string;
    licenseNumber: string;
    territory: string[]; // Régions couvertes
    
    // Informations de l'entreprise
    company: {
      id: string;
      name: string;
      code: string;
      description?: string;
      logo?: string;
      website?: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      licenseNumber: string;
      foundedYear?: number;
      employeeCount?: number;
    };
    
    // Services proposés
    services: Array<{
      type: string;
      name: string;
      description: string;
      coveragePercentage: number;
      maxAmount?: number;
      isActive: boolean;
    }>;
    
    // Partenariats
    partnerships: Array<{
      establishmentId: string;
      establishmentName: string;
      type: 'DIRECT_PAYMENT' | 'THIRD_PARTY' | 'PREFERRED_PROVIDER';
      discountRate?: number;
      since: string;
    }>;
    
    // Statistiques
    stats: {
      totalPolicies: number;
      activeClaims: number;
      monthlyRevenue: number;
      customerSatisfaction: number;
      averageClaimTime: string;
      approvalRate: number;
    };
    
    // Autorisations
    permissions: {
      viewAllClaims: boolean;
      approveClaims: boolean;
      managePartners: boolean;
      viewAnalytics: boolean;
      manageTeam: boolean;
    };
  };
}

// ===== PROFIL ADMINISTRATEUR =====

export interface AdminProfile extends UserProfile {
  role: 'ADMIN';
  admin?: {
    id: string;
    userId: string;
    adminLevel: 'SUPER_ADMIN' | 'SYSTEM_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN';
    department: string;
    permissions: string[];
    lastActivity: string;
    accessLevel: number; // 1-10
  };
}

// ===== UNION TYPES =====

export type AnyUserProfile = PatientProfile | DoctorProfile | InsurerProfile | AdminProfile;

// ===== TYPES POUR LA GESTION DES PROFILS =====

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  preferredLanguage?: 'fr' | 'en' | 'wo';
}

export interface UserSearchParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
  city?: string;
  region?: string;
  specialtyId?: string; // Pour les médecins
  establishmentId?: string; // Pour les médecins
  companyId?: string; // Pour les assureurs
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  roles: Role[];
  isActive?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: {
    city?: string;
    region?: string;
  };
  specialty?: string; // Pour filtrer les médecins
  establishment?: string; // Pour filtrer les médecins
  company?: string; // Pour filtrer les assureurs
}

// ===== TYPES POUR LES INTERACTIONS =====

export interface UserActivity {
  id: string;
  userId: string;
  type: 'LOGIN' | 'LOGOUT' | 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'APPOINTMENT_BOOKED' | 'CONSULTATION_COMPLETED' | 'CLAIM_SUBMITTED';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'APPOINTMENT' | 'INSURANCE' | 'SYSTEM' | 'MEDICAL' | 'SECURITY';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    insurance: boolean;
    system: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
    dataSharing: boolean;
    analyticsTracking: boolean;
    marketingCommunications: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fr' | 'en' | 'wo';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    currency: 'XOF' | 'EUR' | 'USD';
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}

// ===== TYPES POUR LES STATISTIQUES =====

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<Role, number>;
  byRegion: Record<string, number>;
  recentRegistrations: number; // 30 derniers jours
  pendingVerifications: number;
  lastMonth: {
    newUsers: number;
    activeUsers: number;
    retention: number; // pourcentage
  };
}

export interface UserAnalytics {
  userId: string;
  loginFrequency: number; // logins par mois
  lastLoginDays: number; // jours depuis dernière connexion
  profileCompleteness: number; // pourcentage 0-100
  activityScore: number; // score d'activité 0-100
  engagementLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // score de risque sécurité 0-100
  features: {
    mostUsed: string[];
    leastUsed: string[];
    timeSpent: Record<string, number>; // minutes par fonctionnalité
  };
}

// ===== EXPORT DES TYPES UTILITAIRES =====

export type UserWithProfile<T extends Role> = 
  T extends 'PATIENT' ? PatientProfile :
  T extends 'DOCTOR' ? DoctorProfile :
  T extends 'INSURER' ? InsurerProfile :
  T extends 'ADMIN' ? AdminProfile :
  never;

export type UserById = Record<string, AnyUserProfile>;

export type PartialUserProfile<T extends AnyUserProfile> = Partial<T> & Pick<T, 'id' | 'role'>;

// ===== CONSTANTES =====

export const USER_ROLES = ['PATIENT', 'DOCTOR', 'INSURER', 'ADMIN'] as const;
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const LANGUAGES = ['fr', 'en', 'wo'] as const;
export const ADMIN_LEVELS = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN'] as const;