// Types pour les APIs CareFlow Sénégal

// Énumérations de base
export type SenegalRegion =
  | "DAKAR"
  | "THIES"
  | "SAINT_LOUIS"
  | "DIOURBEL"
  | "LOUGA"
  | "TAMBACOUNDA"
  | "KAOLACK"
  | "ZIGUINCHOR"
  | "FATICK"
  | "KOLDA"
  | "MATAM"
  | "KAFFRINE"
  | "KEDOUGOU"
  | "SEDHIOU";

export type MedicalSpecialty =
  | "MEDECINE_GENERALE"
  | "PEDIATRIE"
  | "GYNECOLOGIE_OBSTETRIQUE"
  | "CHIRURGIE_GENERALE"
  | "CARDIOLOGIE"
  | "NEUROLOGIE"
  | "DERMATOLOGIE"
  | "OPHTALMOLOGIE"
  | "MALADIES_INFECTIEUSES"
  | "MEDECINE_TROPICALE"
  | "SANTE_PUBLIQUE"
  | "MEDECINE_TRADITIONNELLE";

export type InsuranceType =
  | "IPM"
  | "MUTUELLE_SANTE"
  | "ASSURANCE_PRIVEE"
  | "CMU";

export type EstablishmentType =
  | "HOSPITAL"
  | "CLINIC"
  | "HEALTH_CENTER"
  | "PRIVATE_PRACTICE";

export type LanguageSpoken =
  | "FRANCAIS"
  | "WOLOF"
  | "PULAAR"
  | "SERER"
  | "MANDINKA"
  | "DIOLA"
  | "SONINKE";

// Interfaces pour les référentiels
export interface RegionInfo {
  code: SenegalRegion;
  name: string;
  capital: string;
  population?: number;
  area?: number;
  departments?: string[];
}

export interface SpecialtyInfo {
  code: MedicalSpecialty;
  name: string;
  description?: string;
  category:
    | "PRIMARY_CARE"
    | "SPECIALIST"
    | "SURGICAL"
    | "TROPICAL"
    | "PUBLIC_HEALTH"
    | "TRADITIONAL";
  consultationFee?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface InsuranceCompany {
  id: string;
  name: string;
  shortName?: string;
  type: InsuranceType;
  phone: string;
  email: string;
  website?: string;
  headOfficeAddress: string;
  regionsServed: SenegalRegion[];
  isActive: boolean;
  insurancePlans?: InsurancePlan[];
}

export interface InsurancePlan {
  id: string;
  name: string;
  planType: "BRONZE" | "ARGENT" | "OR" | "PREMIUM";
  monthlyPremium: number;
  coveragePercentage: number;
  annualLimit: number;
  copayment: number;
  benefits: string[];
  exclusions: string[];
  isActive: boolean;
}

// Interfaces pour les établissements
export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  region: SenegalRegion;
  city: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  capacity?: number;
  hasEmergency?: boolean;
  hasMaternity?: boolean;
  hasICU?: boolean;
  languagesSpoken?: LanguageSpoken[];
  acceptedInsurances?: string[];
  isActive: boolean;
  doctors?: Doctor[];
  statistics?: EstablishmentStats;
  createdAt: string;
  updatedAt: string;
}

export interface EstablishmentStats {
  totalDoctors: number;
  specialtiesCount: Record<string, number>;
  appointmentStats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowRate: number;
  };
  occupancyRate: number;
  averageWaitTime: number;
  patientSatisfaction: number;
}

// Interfaces pour les médecins
export interface Doctor {
  id: string;
  licenseNumber: string;
  specialty: MedicalSpecialty;
  subSpecialty?: string;
  experienceYears: number;
  education?: string;
  bio?: string;
  consultationFee: number;
  languagesSpoken: LanguageSpoken[];
  isActive: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  establishment: {
    id: string;
    name: string;
    type: EstablishmentType;
    city: string;
    region: SenegalRegion;
  };
  availabilities?: DoctorAvailability[];
  stats?: DoctorStats;
}

export interface DoctorAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DoctorStats {
  totalPatients: number;
  totalConsultations: number;
  averageRating: number;
  nextAvailableSlot?: string;
}

// Interfaces pour les patients
export interface Patient {
  id: string;
  nationalId?: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  region: SenegalRegion;
  city?: string;
  emergencyContact: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  insurance?: PatientInsurance;
}

export interface PatientInsurance {
  id: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverageLimit: number;
  deductible: number;
  copayment: number;
  insuranceCompany: InsuranceCompany;
  planDetails: InsurancePlan;
}

// Interfaces pour les rendez-vous
export interface Appointment {
  id: string;
  appointmentDate: string;
  duration: number;
  type:
    | "CONSULTATION"
    | "TELECONSULTATION"
    | "EMERGENCY"
    | "FOLLOWUP"
    | "SURGERY";
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  reason: string;
  notes?: string;
  cost: number;
  isUrgent: boolean;
  patient: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  doctor: {
    id: string;
    specialty: MedicalSpecialty;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  establishment: {
    id: string;
    name: string;
    address: string;
  };
}

// Interfaces pour les réponses API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

// Types pour les filtres de recherche
export interface EstablishmentFilters {
  region?: SenegalRegion;
  type?: EstablishmentType;
  specialty?: MedicalSpecialty;
  search?: string;
  hasEmergency?: boolean;
  hasMaternity?: boolean;
  hasICU?: boolean;
  acceptsInsurance?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "capacity" | "region" | "type" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface DoctorFilters {
  specialty?: MedicalSpecialty;
  region?: SenegalRegion;
  establishmentId?: string;
  search?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "specialty" | "experience" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface InsuranceCompanyFilters {
  type?: InsuranceType;
  region?: SenegalRegion;
  search?: string;
  isActive?: boolean;
  limit?: number;
}

// Types pour les statistiques
export interface GeneralStats {
  totals: {
    patients: number;
    doctors: number;
    establishments: number;
    insuranceCompanies: number;
    appointments: number;
    consultations: number;
  };
  distribution: {
    patientsByRegion: Array<{
      region: SenegalRegion;
      count: number;
    }>;
    doctorsBySpecialty: Array<{
      specialty: MedicalSpecialty;
      count: number;
    }>;
  };
}

// Types pour les constantes
export const REGION_NAMES: Record<SenegalRegion, string> = {
  DAKAR: "Dakar",
  THIES: "Thiès",
  SAINT_LOUIS: "Saint-Louis",
  DIOURBEL: "Diourbel",
  LOUGA: "Louga",
  TAMBACOUNDA: "Tambacounda",
  KAOLACK: "Kaolack",
  ZIGUINCHOR: "Ziguinchor",
  FATICK: "Fatick",
  KOLDA: "Kolda",
  MATAM: "Matam",
  KAFFRINE: "Kaffrine",
  KEDOUGOU: "Kédougou",
  SEDHIOU: "Sédhiou",
};

export const SPECIALTY_NAMES: Record<MedicalSpecialty, string> = {
  MEDECINE_GENERALE: "Médecine Générale",
  PEDIATRIE: "Pédiatrie",
  GYNECOLOGIE_OBSTETRIQUE: "Gynécologie-Obstétrique",
  CHIRURGIE_GENERALE: "Chirurgie Générale",
  CARDIOLOGIE: "Cardiologie",
  NEUROLOGIE: "Neurologie",
  DERMATOLOGIE: "Dermatologie",
  OPHTALMOLOGIE: "Ophtalmologie",
  MALADIES_INFECTIEUSES: "Maladies Infectieuses",
  MEDECINE_TROPICALE: "Médecine Tropicale",
  SANTE_PUBLIQUE: "Santé Publique",
  MEDECINE_TRADITIONNELLE: "Médecine Traditionnelle",
};
