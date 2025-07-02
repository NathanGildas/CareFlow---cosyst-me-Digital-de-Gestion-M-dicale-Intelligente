// src/types/auth.types.ts - Types d'authentification CareFlow (VERSION UNIFIÉE)

// ===== TYPES DE BASE =====

export type Role = "PATIENT" | "DOCTOR" | "INSURER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== PERMISSIONS =====

export interface RolePermissions {
  // Permissions générales
  readProfile?: boolean;
  updateProfile?: boolean;
  viewMedicalHistory?: boolean;
  bookAppointments?: boolean;
  viewInsurance?: boolean;

  // Permissions Médecin
  viewPatients?: boolean;
  createConsultations?: boolean;
  managePrescriptions?: boolean;
  viewSchedule?: boolean;

  // Permissions Assureur
  viewPolicies?: boolean;
  manageClaims?: boolean;
  viewAnalytics?: boolean;
  manageSubscriptions?: boolean;

  // Permissions Admin
  manageUsers?: boolean;
  manageEstablishments?: boolean;
  viewSystemAnalytics?: boolean;
  manageSettings?: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  PATIENT: {
    readProfile: true,
    updateProfile: true,
    viewMedicalHistory: true,
    bookAppointments: true,
    viewInsurance: true,
  },
  DOCTOR: {
    readProfile: true,
    updateProfile: true,
    viewPatients: true,
    createConsultations: true,
    managePrescriptions: true,
    viewSchedule: true,
  },
  INSURER: {
    readProfile: true,
    updateProfile: true,
    viewPolicies: true,
    manageClaims: true,
    viewAnalytics: true,
    manageSubscriptions: true,
  },
  ADMIN: {
    readProfile: true,
    updateProfile: true,
    manageUsers: true,
    manageEstablishments: true,
    viewSystemAnalytics: true,
    manageSettings: true,
  },
};

// ===== AUTHENTIFICATION =====

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string; // Optionnel, pas envoyé au backend
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;

  // Données supplémentaires selon le rôle
  licenseNumber?: string; // Pour DOCTOR
  specialtyId?: string; // Pour DOCTOR
  companyId?: string; // Pour INSURER
  establishmentId?: string; // Pour DOCTOR
}

// Structure des tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// 🎯 STRUCTURE UNIFIÉE - Compatible backend et frontend
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: AuthTokens; // Structure unifiée avec tokens
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===== CONTEXTE D'AUTHENTIFICATION =====

export interface AuthContextType extends AuthState {
  // Actions principales
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;

  // Helpers
  getUserRole: () => Role | null;
  getUserPermissions: () => RolePermissions | null;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  isRole: (role: Role) => boolean;
  getDisplayName: () => string;
  getInitials: () => string;
}

// ===== NAVIGATION =====

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  requiredPermission?: keyof RolePermissions;
}

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  PATIENT: [
    { label: "Tableau de bord", path: "/patient", icon: "home" },
    {
      label: "Mes rendez-vous",
      path: "/patient/appointments",
      icon: "calendar",
    },
    { label: "Trouver un médecin", path: "/patient/doctors", icon: "search" },
    { label: "Mon assurance", path: "/patient/insurance", icon: "shield" },
    {
      label: "Historique médical",
      path: "/patient/medical-history",
      icon: "file-text",
    },
    { label: "Mon profil", path: "/patient/profile", icon: "user" },
  ],
  DOCTOR: [
    { label: "Tableau de bord", path: "/doctor", icon: "home" },
    { label: "Mes patients", path: "/doctor/patients", icon: "users" },
    { label: "Planning", path: "/doctor/schedule", icon: "calendar" },
    {
      label: "Consultations",
      path: "/doctor/consultations",
      icon: "stethoscope",
    },
    { label: "Statistiques", path: "/doctor/analytics", icon: "bar-chart" },
    { label: "Mon profil", path: "/doctor/profile", icon: "user" },
  ],
  INSURER: [
    { label: "Tableau de bord", path: "/insurer", icon: "home" },
    {
      label: "Demandes souscription",
      path: "/insurer/subscriptions",
      icon: "file-plus",
    },
    {
      label: "Polices actives",
      path: "/insurer/policies",
      icon: "shield-check",
    },
    { label: "Remboursements", path: "/insurer/claims", icon: "credit-card" },
    {
      label: "Établissements",
      path: "/insurer/establishments",
      icon: "building",
    },
    { label: "Statistiques", path: "/insurer/analytics", icon: "trending-up" },
    { label: "Mon profil", path: "/insurer/profile", icon: "user" },
  ],
  ADMIN: [
    { label: "Tableau de bord", path: "/admin", icon: "home" },
    { label: "Utilisateurs", path: "/admin/users", icon: "users" },
    {
      label: "Établissements",
      path: "/admin/establishments",
      icon: "building",
    },
    { label: "Assurances", path: "/admin/insurance", icon: "shield" },
    { label: "Analytics", path: "/admin/analytics", icon: "pie-chart" },
    { label: "Paramètres", path: "/admin/settings", icon: "settings" },
  ],
};

// ===== ERREURS =====

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  NETWORK_ERROR: "NETWORK_ERROR",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

// ===== UTILITAIRES =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: AuthError;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== TYPES POUR LES FORMULAIRES =====

export type FormErrors<T extends object = Record<string, unknown>> = {
  [K in keyof T]?: string;
};

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "tel" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  options?: Array<{ value: string; label: string }>;
}

// Export des types utilitaires
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
