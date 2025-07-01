// src/utils/index.ts
// Fonctions utilitaires pour CareFlow

/**
 * Utilitaires pour les classes CSS
 */
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Formatage des dates
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Dakar",
  };

  return new Intl.DateTimeFormat("fr-SN", {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
};

/**
 * Formatage des heures
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("fr-SN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dakar",
  }).format(dateObj);
};

/**
 * Formatage de la date et heure
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("fr-SN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dakar",
  }).format(dateObj);
};

/**
 * Formatage des montants en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatage des numéros de téléphone sénégalais
 */
export const formatPhoneNumber = (phone: string): string => {
  // Enlever tous les caractères non numériques sauf le +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Format sénégalais +221XXXXXXXXX
  if (cleaned.startsWith("+221") && cleaned.length === 13) {
    const number = cleaned.slice(4);
    return `+221 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(
      5,
      7
    )} ${number.slice(7)}`;
  }

  return phone;
};

/**
 * Validation d'email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validation de numéro de téléphone sénégalais
 */
export const isValidSenegalPhone = (phone: string): boolean => {
  const phoneRegex = /^\+221[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Génération d'un ID unique
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Délai d'attente (sleep)
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Capitaliser la première lettre
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Tronquer un texte
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Debounce pour les fonctions
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

/**
 * Throttle pour les fonctions
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

/**
 * Copier du texte dans le presse-papiers
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Erreur lors de la copie:", error);
    return false;
  }
};

/**
 * Télécharger un fichier
 */
export const downloadFile = (
  data: Blob | string,
  filename: string,
  mimeType?: string
): void => {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: mimeType || "text/plain" })
      : data;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Obtenir les initiales d'un nom complet
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Générer une couleur basée sur un nom
 */
export const getColorFromName = (name: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Conversion de fichier en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validation de la force d'un mot de passe
 */
export const getPasswordStrength = (
  password: string
): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Au moins 8 caractères");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Au moins une minuscule");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Au moins une majuscule");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Au moins un chiffre");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Au moins un caractère spécial");
  }

  return { score, feedback };
};

/**
 * Nettoyer et formatter un numéro de téléphone
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

/**
 * Vérifier si on est en environnement mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

/**
 * Vérifier si on est en environnement tactile
 */
export const isTouchDevice = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * Obtenir l'URL complète d'une route
 */
export const getFullUrl = (path: string): string => {
  return `${window.location.origin}${path}`;
};

/**
 * Parser les paramètres de l'URL
 */
export const parseQueryParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
};

/**
 * Créer des paramètres d'URL
 */
export const createQueryString = (
  params: Record<string, string | number>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

/**
 * Utilitaires de localStorage sécurisé
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Erreur lors du nettoyage du localStorage:", error);
      return false;
    }
  },
};

/**
 * Constants utiles
 */
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
];

export const MEDICAL_SPECIALTIES = [
  "Médecine générale",
  "Cardiologie",
  "Pédiatrie",
  "Gynécologie",
  "Dermatologie",
  "Neurologie",
  "Psychiatrie",
  "Orthopédie",
  "Ophtalmologie",
  "ORL",
  "Gastroentérologie",
  "Endocrinologie",
  "Rhumatologie",
  "Pneumologie",
  "Urologie",
  "Radiologie",
  "Anesthésie",
  "Chirurgie générale",
];

export const INSURANCE_COMPANIES = [
  "NSIA Assurances",
  "ASKIA Assurance",
  "AMSA Assurances",
  "AXA Assurances Sénégal",
  "SALAMA Assurances",
];

// Export par défaut d'un objet contenant tous les utilitaires
export default {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatPhoneNumber,
  isValidEmail,
  isValidSenegalPhone,
  generateId,
  sleep,
  capitalize,
  truncate,
  debounce,
  throttle,
  copyToClipboard,
  downloadFile,
  getInitials,
  getColorFromName,
  fileToBase64,
  getPasswordStrength,
  cleanPhoneNumber,
  isMobile,
  isTouchDevice,
  getFullUrl,
  parseQueryParams,
  createQueryString,
  storage,
  SENEGAL_REGIONS,
  MEDICAL_SPECIALTIES,
  INSURANCE_COMPANIES,
};
