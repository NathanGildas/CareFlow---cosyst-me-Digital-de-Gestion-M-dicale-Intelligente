// src/utils/helpers.ts - Fonctions utilitaires pour CareFlow
import { CURRENCIES, VALIDATION_RULES, MOBILE_MONEY_OPERATORS } from './constants';
import type { Currency, BloodType, PaymentMethod } from './constants';

// ===== FORMATAGE DE DONNÉES =====

/**
 * Formate un montant en devise locale
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'XOF',
  options: { 
    compact?: boolean; 
    showSymbol?: boolean; 
    locale?: string;
  } = {}
): string => {
  const { compact = false, showSymbol = true, locale = 'fr-FR' } = options;
  
  if (isNaN(amount)) return '0';
  
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || currency;
  
  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: millions % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    }).format(millions);
    return showSymbol ? `${formatted}M ${symbol}` : `${formatted}M`;
  }
  
  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: thousands % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    }).format(thousands);
    return showSymbol ? `${formatted}K ${symbol}` : `${formatted}K`;
  }
  
  const formatted = new Intl.NumberFormat(locale).format(amount);
  return showSymbol ? `${formatted} ${symbol}` : formatted;
};

/**
 * Formate une date selon le format spécifié
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' | 'relative' = 'medium',
  locale: string = 'fr-FR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    case 'full':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'relative':
      return formatRelativeDate(dateObj, locale);
    default:
      return dateObj.toLocaleDateString(locale);
  }
};

/**
 * Formate une date de manière relative (il y a X temps)
 */
export const formatRelativeDate = (date: Date | string, locale: string = 'fr-FR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (locale === 'fr-FR') {
    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (weeks < 4) return `Il y a ${weeks} sem.`;
    if (months < 12) return `Il y a ${months} mois`;
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
  
  // Fallback pour autres langues
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');
  
  // Format sénégalais
  if (cleaned.length === 9) {
    return `+221 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  // Avec indicatif Sénégal
  if (cleaned.length === 12 && cleaned.startsWith('221')) {
    const number = cleaned.substring(3);
    return `+221 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
  }
  
  // Format international générique
  if (cleaned.length > 9) {
    return `+${cleaned}`;
  }
  
  return phone; // Retourner tel quel si format non reconnu
};

// ===== VALIDATION =====

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_RULES.email.test(email.trim());
};

/**
 * Valide un numéro de téléphone sénégalais
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return VALIDATION_RULES.phone.senegal.test(phone.replace(/\s/g, ''));
};

/**
 * Valide un mot de passe
 */
export const isValidPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION_RULES.password.minLength) {
    errors.push(`Au moins ${VALIDATION_RULES.password.minLength} caractères`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une lettre minuscule');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une lettre majuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Au moins un caractère spécial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide un numéro de licence
 */
export const isValidLicenseNumber = (
  licenseNumber: string,
  type: 'doctor' | 'insurance' | 'establishment'
): boolean => {
  return VALIDATION_RULES.licenseNumber[type].test(licenseNumber);
};

// ===== MANIPULATION DE DONNÉES =====

/**
 * Supprime les accents d'une chaîne
 */
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Convertit une chaîne en slug (URL-friendly)
 */
export const createSlug = (str: string): string => {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalise la première lettre de chaque mot
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Tronque un texte avec des points de suspension
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Génère des initiales à partir d'un nom complet
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
};

// ===== MANIPULATION D'OBJETS =====

/**
 * Deep merge de deux objets
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key] as any);
    } else {
      result[key] = source[key] as any;
    }
  }
  
  return result;
};

/**
 * Supprime les propriétés undefined/null d'un objet
 */
export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  }
  
  return cleaned;
};

/**
 * Convertit un objet en paramètres de requête URL
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, String(item)));
      } else {
        params.append(key, String(value));
      }
    }
  }
  
  return params.toString();
};

// ===== UTILITAIRES SPÉCIFIQUES MÉTIER =====

/**
 * Calcule l'âge à partir de la date de naissance
 */
export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  
  return age;
};

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 */
export const calculateBMI = (weight: number, height: number): {
  value: number;
  category: string;
  categoryColor: string;
} => {
  const heightInM = height / 100;
  const bmi = weight / (heightInM * heightInM);
  
  let category = '';
  let categoryColor = '';
  
  if (bmi < 18.5) {
    category = 'Insuffisance pondérale';
    categoryColor = 'blue';
  } else if (bmi < 25) {
    category = 'Poids normal';
    categoryColor = 'green';
  } else if (bmi < 30) {
    category = 'Surpoids';
    categoryColor = 'yellow';
  } else {
    category = 'Obésité';
    categoryColor = 'red';
  }
  
  return {
    value: Math.round(bmi * 10) / 10,
    category,
    categoryColor,
  };
};

/**
 * Détermine l'opérateur Mobile Money à partir du numéro
 */
export const getMobileMoneyOperator = (phoneNumber: string): string | null => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const number = cleaned.length === 12 ? cleaned.substring(3) : cleaned;
  
  for (const operator of MOBILE_MONEY_OPERATORS) {
    if (operator.pattern.test(number)) {
      return operator.name;
    }
  }
  
  return null;
};

/**
 * Génère une couleur pour un groupe sanguin
 */
export const getBloodTypeColor = (bloodType: BloodType): string => {
  const colors: Record<BloodType, string> = {
    'A+': 'red',
    'A-': 'red',
    'B+': 'blue',
    'B-': 'blue',
    'AB+': 'purple',
    'AB-': 'purple',
    'O+': 'green',
    'O-': 'green',
  };
  
  return colors[bloodType] || 'gray';
};

/**
 * Vérifie si un créneau horaire est dans les heures ouvrables
 */
export const isWorkingHours = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  const startWorkingHours = 8 * 60; // 08:00
  const endWorkingHours = 18 * 60; // 18:00
  const lunchStart = 12 * 60; // 12:00
  const lunchEnd = 13 * 60; // 13:00
  
  return timeInMinutes >= startWorkingHours && 
         timeInMinutes <= endWorkingHours && 
         (timeInMinutes < lunchStart || timeInMinutes >= lunchEnd);
};

// ===== UTILITAIRES DE DÉVELOPPEMENT =====

/**
 * Ajoute un délai (pour les tests et démos)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Génère un ID unique
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Vérifie si on est en mode développement
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Log conditionnel (seulement en dev)
 */
export const devLog = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log('[CareFlow Dev]', ...args);
  }
};

// ===== UTILITAIRES DE PERFORMANCE =====

/**
 * Debounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== EXPORT DES TYPES =====

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type BMIResult = {
  value: number;
  category: string;
  categoryColor: string;
};