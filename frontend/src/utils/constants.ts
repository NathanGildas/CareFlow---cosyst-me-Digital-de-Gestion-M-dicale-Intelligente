// src/utils/constants.ts - Constantes globales de l'application CareFlow
export const APP_CONFIG = {
  name: 'CareFlow Sénégal',
  version: '1.0.0',
  description: 'Plateforme e-santé pour le Sénégal',
  author: 'CareFlow Team',
  website: 'https://careflow.sn',
  supportEmail: 'support@careflow.sn',
  contactPhone: '+221 33 123 45 67',
  emergencyPhone: '+221 77 999 88 77',
  address: 'Avenue Léopold Sédar Senghor, Dakar, Sénégal',
} as const;

// ===== API ET CONFIGURATION =====

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 30000, // 30 secondes
  maxRetries: 3,
  retryDelay: 1000, // 1 seconde
} as const;

export const STORAGE_KEYS = {
  authToken: 'careflow_auth_token',
  refreshToken: 'careflow_refresh_token',
  user: 'careflow_user',
  settings: 'careflow_settings',
  appData: 'careflow_app_data',
  appDataTimestamp: 'careflow_app_data_timestamp',
  theme: 'careflow_theme',
  language: 'careflow_language',
} as const;

// ===== ROUTES =====

export const ROUTES = {
  // Authentification
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Pages publiques
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Patient
  PATIENT_DASHBOARD: '/patient',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_DOCTORS: '/patient/doctors',
  PATIENT_INSURANCE: '/patient/insurance',
  PATIENT_MEDICAL_HISTORY: '/patient/medical-history',

  // Médecin
  DOCTOR_DASHBOARD: '/doctor',
  DOCTOR_PROFILE: '/doctor/profile',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_SCHEDULE: '/doctor/schedule',
  DOCTOR_CONSULTATIONS: '/doctor/consultations',
  DOCTOR_ANALYTICS: '/doctor/analytics',

  // Assureur
  INSURER_DASHBOARD: '/insurer',
  INSURER_PROFILE: '/insurer/profile',
  INSURER_SUBSCRIPTIONS: '/insurer/subscriptions',
  INSURER_POLICIES: '/insurer/policies',
  INSURER_CLAIMS: '/insurer/claims',
  INSURER_ESTABLISHMENTS: '/insurer/establishments',
  INSURER_ANALYTICS: '/insurer/analytics',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ESTABLISHMENTS: '/admin/establishments',
  ADMIN_INSURANCE: '/admin/insurance',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// ===== DONNÉES MÉTIER =====

export const APPOINTMENT_TYPES = [
  { value: 'CONSULTATION', label: 'Consultation', color: 'blue' },
  { value: 'TELECONSULTATION', label: 'Téléconsultation', color: 'green' },
  { value: 'FOLLOWUP', label: 'Suivi', color: 'yellow' },
  { value: 'EMERGENCY', label: 'Urgence', color: 'red' },
  { value: 'SURGERY', label: 'Chirurgie', color: 'purple' },
] as const;

export const APPOINTMENT_STATUS = [
  { value: 'SCHEDULED', label: 'Programmé', color: 'blue' },
  { value: 'CONFIRMED', label: 'Confirmé', color: 'green' },
  { value: 'CANCELLED', label: 'Annulé', color: 'red' },
  { value: 'COMPLETED', label: 'Terminé', color: 'gray' },
  { value: 'NO_SHOW', label: 'Absent', color: 'orange' },
] as const;

export const ESTABLISHMENT_TYPES = [
  { value: 'HOSPITAL', label: 'Hôpital', icon: 'building-2' },
  { value: 'CLINIC', label: 'Clinique', icon: 'heart' },
  { value: 'MEDICAL_CENTER', label: 'Centre médical', icon: 'stethoscope' },
  { value: 'PHARMACY', label: 'Pharmacie', icon: 'pill' },
] as const;

export const INSURANCE_TYPES = [
  { value: 'BASIC', label: 'Essentiel', premium: 25000, coverage: [500000, 2000000] },
  { value: 'STANDARD', label: 'Confort', premium: 45000, coverage: [1000000, 5000000] },
  { value: 'PREMIUM', label: 'Premium', premium: 75000, coverage: [2000000, 10000000] },
  { value: 'FAMILY', label: 'Famille', premium: 120000, coverage: [3000000, 15000000] },
] as const;

export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export const GENDERS = [
  { value: 'MALE', label: 'Homme' },
  { value: 'FEMALE', label: 'Femme' },
  { value: 'OTHER', label: 'Autre' },
] as const;

// ===== RÉGIONS DU SÉNÉGAL =====

export const SENEGAL_REGIONS = [
  { code: 'DK', name: 'Dakar', capital: 'Dakar' },
  { code: 'TH', name: 'Thiès', capital: 'Thiès' },
  { code: 'SL', name: 'Saint-Louis', capital: 'Saint-Louis' },
  { code: 'DI', name: 'Diourbel', capital: 'Diourbel' },
  { code: 'LG', name: 'Louga', capital: 'Louga' },
  { code: 'FK', name: 'Fatick', capital: 'Fatick' },
  { code: 'KF', name: 'Kaffrine', capital: 'Kaffrine' },
  { code: 'KL', name: 'Kaolack', capital: 'Kaolack' },
  { code: 'MT', name: 'Matam', capital: 'Matam' },
  { code: 'TC', name: 'Tambacounda', capital: 'Tambacounda' },
  { code: 'KD', name: 'Kédougou', capital: 'Kédougou' },
  { code: 'ZG', name: 'Ziguinchor', capital: 'Ziguinchor' },
  { code: 'SK', name: 'Sédhiou', capital: 'Sédhiou' },
  { code: 'KB', name: 'Kolda', capital: 'Kolda' },
] as const;

// ===== LANGUES =====

export const LANGUAGES = [
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'en', name: 'Anglais', nativeName: 'English' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof' },
] as const;

// ===== DEVISES =====

export const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' },
  { code: 'EUR', name: 'Euro', symbol: '¬' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
] as const;

// ===== FORMATS DE DATE =====

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
] as const;

// ===== PLAGES HORAIRES =====

export const TIME_SLOTS = [
  '08:00', '08:15', '08:30', '08:45',
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
] as const;

export const WORKING_HOURS = {
  start: '08:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  slotDuration: 15, // minutes
} as const;

// ===== MOYENS DE PAIEMENT =====

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces', icon: 'banknote' },
  { value: 'CARD', label: 'Carte bancaire', icon: 'credit-card' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'smartphone' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: 'building-bank' },
  { value: 'INSURANCE', label: 'Assurance', icon: 'shield' },
] as const;

// ===== OPÉRATEURS MOBILE MONEY =====

export const MOBILE_MONEY_OPERATORS = [
  { code: 'orange', name: 'Orange Money', pattern: /^77[0-9]{7}$/ },
  { code: 'free', name: 'Free Money', pattern: /^76[0-9]{7}$/ },
  { code: 'expresso', name: 'Expresso', pattern: /^70[0-9]{7}$/ },
  { code: 'tigo', name: 'Tigo Cash', pattern: /^78[0-9]{7}$/ },
] as const;

// ===== VALIDATION =====

export const VALIDATION_RULES = {
  phone: {
    senegal: /^(\+221|221)?[0-9]{9}$/,
    international: /^\+[1-9]\d{1,14}$/,
  },
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  licenseNumber: {
    doctor: /^SN-MED-\d{4}-\d{4,6}$/,
    insurance: /^ASS-SN-\d{4}-\d{3,6}$/,
    establishment: /^ETB-SN-\d{4}-\d{3,6}$/,
  },
} as const;

// ===== LIMITES ET QUOTAS =====

export const LIMITS = {
  appointments: {
    maxPerDay: 20,
    maxPerWeek: 120,
    advanceBookingDays: 90,
    cancellationHours: 24,
  },
  file: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
} as const;

// ===== STATUTS ET PRIORITÉS =====

export const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Faible', color: 'gray' },
  { value: 'MEDIUM', label: 'Moyen', color: 'yellow' },
  { value: 'HIGH', label: 'Élevé', color: 'orange' },
  { value: 'URGENT', label: 'Urgent', color: 'red' },
] as const;

export const NOTIFICATION_TYPES = [
  { value: 'APPOINTMENT', label: 'Rendez-vous', icon: 'calendar' },
  { value: 'INSURANCE', label: 'Assurance', icon: 'shield' },
  { value: 'SYSTEM', label: 'Système', icon: 'settings' },
  { value: 'MEDICAL', label: 'Médical', icon: 'stethoscope' },
  { value: 'SECURITY', label: 'Sécurité', icon: 'lock' },
] as const;

// ===== MESSAGES ET TEXTES =====

export const MESSAGES = {
  errors: {
    generic: 'Une erreur inattendue s\'est produite',
    network: 'Problème de connexion réseau',
    unauthorized: 'Accès non autorisé',
    forbidden: 'Action non autorisée',
    notFound: 'Ressource non trouvée',
    validation: 'Données invalides',
    server: 'Erreur serveur',
  },
  success: {
    save: 'Données sauvegardées avec succès',
    delete: 'Suppression effectuée avec succès',
    update: 'Mise à jour effectuée avec succès',
    create: 'Création effectuée avec succès',
    send: 'Envoi effectué avec succès',
  },
  loading: {
    generic: 'Chargement en cours...',
    saving: 'Sauvegarde en cours...',
    loading: 'Chargement...',
    processing: 'Traitement en cours...',
  },
} as const;

// ===== THÈMES ET COULEURS =====

export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
} as const;

// ===== EXPORT DES TYPES UTILITAIRES =====

export type AppointmentType = typeof APPOINTMENT_TYPES[number]['value'];
export type AppointmentStatus = typeof APPOINTMENT_STATUS[number]['value'];
export type EstablishmentType = typeof ESTABLISHMENT_TYPES[number]['value'];
export type InsuranceType = typeof INSURANCE_TYPES[number]['value'];
export type BloodType = typeof BLOOD_TYPES[number];
export type Gender = typeof GENDERS[number]['value'];
export type SenegalRegion = typeof SENEGAL_REGIONS[number]['code'];
export type Language = typeof LANGUAGES[number]['code'];
export type Currency = typeof CURRENCIES[number]['code'];
export type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];
export type PriorityLevel = typeof PRIORITY_LEVELS[number]['value'];
export type NotificationType = typeof NOTIFICATION_TYPES[number]['value'];