// src/types/insurance.types.ts - Types pour le module d'assurance CareFlow

// ===== TYPES DE BASE =====

export interface InsuranceCompany {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  licenseNumber: string;
  rating: number; // Note sur 5
  reviewsCount: number;
  foundedYear: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePlan {
  id: string;
  companyId: string;
  company?: InsuranceCompany;
  name: string;
  type: InsurancePlanType;
  category: InsurancePlanCategory;
  description: string;
  coveragePercentage: number; // Pourcentage de remboursement
  monthlyPremium: number; // Prime mensuelle en FCFA
  annualPremium: number; // Prime annuelle en FCFA
  deductible: number; // Franchise en FCFA
  maxCoverage: number; // Plafond de couverture en FCFA
  benefits: string[]; // Liste des avantages
  exclusions: string[]; // Liste des exclusions
  requirements: string[]; // Conditions d'éligibilité
  waitingPeriod: number; // Délai de carence en jours
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InsurancePlanType = "INDIVIDUAL" | "FAMILY" | "GROUP" | "CORPORATE";

export type InsurancePlanCategory = "BASIC" | "STANDARD" | "PREMIUM" | "VIP";

// ===== SUBSCRIPTION ET CLAIMS =====

export interface InsuranceSubscription {
  id: string;
  userId: string;
  planId: string;
  plan?: InsurancePlan;
  subscriptionNumber: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  monthlyPremium: number;
  lastPaymentDate?: string;
  nextPaymentDate: string;
  beneficiaries: Beneficiary[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export interface Beneficiary {
  id: string;
  subscriptionId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: BeneficiaryRelationship;
  isActive: boolean;
}

export type BeneficiaryRelationship =
  | "SELF"
  | "SPOUSE"
  | "CHILD"
  | "PARENT"
  | "OTHER";

export interface InsuranceClaim {
  id: string;
  subscriptionId: string;
  subscription?: InsuranceSubscription;
  claimNumber: string;
  amount: number;
  reimbursedAmount: number;
  status: ClaimStatus;
  description: string;
  medicalProvider: string;
  consultationDate: string;
  submittedDate: string;
  processedDate?: string;
  documents: ClaimDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

export interface ClaimDocument {
  id: string;
  claimId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export type DocumentType =
  | "MEDICAL_INVOICE"
  | "PRESCRIPTION"
  | "MEDICAL_REPORT"
  | "IDENTITY_CARD"
  | "OTHER";

// ===== FILTRES ET RECHERCHE =====

export interface InsuranceSearchFilters {
  // Géographique
  region?: string;
  city?: string;

  // Type et catégorie
  planType?: InsurancePlanType[];
  planCategory?: InsurancePlanCategory[];

  // Tarification
  minPremium?: number;
  maxPremium?: number;
  minCoverage?: number;
  maxCoverage?: number;

  // Couverture
  minCoveragePercentage?: number;
  maxDeductible?: number;

  // Compagnie
  companyIds?: string[];
  minRating?: number;

  // Tri
  sortBy?: InsuranceSortOption;
  sortOrder?: "asc" | "desc";
}

export type InsuranceSortOption =
  | "premium"
  | "coverage"
  | "rating"
  | "name"
  | "coveragePercentage";

export interface InsuranceSearchResults {
  companies: InsuranceCompany[];
  plans: InsurancePlan[];
  totalResults: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: InsuranceSearchFilters;
}

// ===== DEVIS ET SOUSCRIPTION =====

export interface QuoteRequest {
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  city: string;
  region: string;

  // Détails de la demande
  planIds: string[];
  planType: InsurancePlanType;
  beneficiariesCount: number;
  hasPreexistingConditions: boolean;
  preexistingConditions?: string[];

  // Préférences
  preferredStartDate: string;
  additionalNotes?: string;
}

export interface Quote {
  id: string;
  requestId: string;
  planId: string;
  plan?: InsurancePlan;
  monthlyPremium: number;
  annualPremium: number;
  coverageDetails: CoverageDetail[];
  validUntil: string;
  status: QuoteStatus;
  createdAt: string;
}

export type QuoteStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ACCEPTED"
  | "EXPIRED"
  | "CANCELLED";

export interface CoverageDetail {
  category: string;
  description: string;
  coveragePercentage: number;
  maxAmount?: number;
  conditions?: string[];
}

// ===== COMPARAISON =====

export interface PlanComparison {
  plans: InsurancePlan[];
  comparisonCategories: ComparisonCategory[];
}

export interface ComparisonCategory {
  name: string;
  items: ComparisonItem[];
}

export interface ComparisonItem {
  label: string;
  values: ComparisonValue[];
  type: "text" | "number" | "percentage" | "currency" | "boolean";
  isHighlight?: boolean;
}

export interface ComparisonValue {
  planId: string;
  value: string | number | boolean;
  formattedValue: string;
  isAdvantage?: boolean;
}

// ===== FORMULAIRES =====

export interface SubscriptionForm {
  // Informations personnelles
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    region: string;
    occupation: string;
  };

  // Plan sélectionné
  selectedPlan: {
    planId: string;
    startDate: string;
    paymentFrequency: "MONTHLY" | "ANNUAL";
  };

  // Bénéficiaires
  beneficiaries: BeneficiaryForm[];

  // Informations médicales
  medicalInfo: {
    hasPreexistingConditions: boolean;
    conditions: string[];
    currentMedications: string[];
    allergies: string[];
  };

  // Documents
  documents: {
    identityCard: File | null;
    proofOfAddress: File | null;
    medicalCertificate: File | null;
  };

  // Acceptation des conditions
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

export interface BeneficiaryForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: BeneficiaryRelationship;
}

// ===== API RESPONSES =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== ERREURS =====

export interface InsuranceError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export const INSURANCE_ERROR_CODES = {
  COMPANY_NOT_FOUND: "COMPANY_NOT_FOUND",
  PLAN_NOT_FOUND: "PLAN_NOT_FOUND",
  PLAN_NOT_AVAILABLE: "PLAN_NOT_AVAILABLE",
  ELIGIBILITY_FAILED: "ELIGIBILITY_FAILED",
  INVALID_QUOTE: "INVALID_QUOTE",
  QUOTE_EXPIRED: "QUOTE_EXPIRED",
  SUBSCRIPTION_FAILED: "SUBSCRIPTION_FAILED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CLAIM_PROCESSING_ERROR: "CLAIM_PROCESSING_ERROR",
  DOCUMENT_UPLOAD_FAILED: "DOCUMENT_UPLOAD_FAILED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

// ===== UTILITAIRES =====

export type FormErrors<T extends object = Record<string, unknown>> = {
  [K in keyof T]?: string;
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== CONSTANTES =====

export const SENEGAL_REGIONS = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Diourbel",
  "Louga",
  "Fatick",
  "Kaolack",
  "Kolda",
  "Ziguinchor",
  "Tambacounda",
  "Kaffrine",
  "Kédougou",
  "Matam",
  "Sédhiou",
] as const;

export const PLAN_CATEGORIES_LABELS = {
  BASIC: "Basique",
  STANDARD: "Standard",
  PREMIUM: "Premium",
  VIP: "VIP",
} as const;

export const PLAN_TYPES_LABELS = {
  INDIVIDUAL: "Individuel",
  FAMILY: "Famille",
  GROUP: "Groupe",
  CORPORATE: "Entreprise",
} as const;
