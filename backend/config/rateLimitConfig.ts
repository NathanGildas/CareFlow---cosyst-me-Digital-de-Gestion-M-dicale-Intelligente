// src/config/rateLimitConfig.ts - Configuration intelligente du rate limiting
import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

// Étendre le type Request pour inclure 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      email?: string;
      [key: string]: any;
    };
  }
}

/**
 * Configuration du rate limiting selon l'environnement
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * IPs exemptées du rate limiting (développement et CI/CD)
 */
const WHITELISTED_IPS = [
  '127.0.0.1', // Localhost
  '::1', // IPv6 localhost
  '192.168.1.0/24', // Réseau local
  // Ajoutez vos IPs de développement ici
];

/**
 * Fonction pour vérifier si une IP est exemptée
 */
const isWhitelistedIP = (ip: string): boolean => {
  if (isDevelopment || isTest) return true; // Pas de limite en dev/test

  return WHITELISTED_IPS.some((whitelistedIP) => {
    if (whitelistedIP.includes('/')) {
      // Vérification de plage CIDR (simplifiée)
      const [network] = whitelistedIP.split('/');
      return ip.startsWith(network.substring(0, network.lastIndexOf('.')));
    }
    return ip === whitelistedIP;
  });
};

/**
 * Fonction skip personnalisée
 */
const skipFunction = (req: Request): boolean => {
  // Toujours autoriser en développement et test
  if (isDevelopment || isTest) return true;

  // Vérifier la whitelist d'IPs
  const clientIP = req.ip || req.connection.remoteAddress || '';
  if (isWhitelistedIP(clientIP)) return true;

  // Autoriser les health checks
  if (req.path === '/health' || req.path === '/api/health') return true;

  return false;
};

/**
 * Configuration pour les inscriptions
 */
export const registerRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1min en dev, 15min en prod
  max: isDevelopment ? 1000 : isProduction ? 20 : 50, // Très généreux en dev, réaliste en prod
  message: {
    success: false,
    message: isDevelopment
      ? 'Rate limiting désactivé en développement'
      : "Trop d'inscriptions depuis cette IP. Réessayez dans quelques minutes.",
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: isDevelopment ? 0 : 15 * 60, // Secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipFunction,

  // En cas de dépassement, donner des informations utiles

  // Clé personnalisée (par IP + User-Agent pour éviter les abus)
  keyGenerator: (req: Request): string => {
    return isDevelopment
      ? 'dev-key'
      : `${req.ip}-${req.get('User-Agent')?.substring(0, 50)}`;
  },
});

/**
 * Configuration pour les connexions
 */
export const loginRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1min en dev, 15min en prod
  max: isDevelopment ? 1000 : isProduction ? 30 : 100, // Généreux même en prod
  message: {
    success: false,
    message: isDevelopment
      ? 'Rate limiting désactivé en développement'
      : 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    retryAfter: isDevelopment ? 0 : 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipFunction,

  // Logging spécifique pour la sécurité
  // onLimitReached n'est plus supporté dans express-rate-limit v6+
  // Pour du logging, utilisez un middleware séparé ou custom handler si besoin.

  keyGenerator: (req: Request): string => {
    // En production, combiner IP + email pour un rate limiting plus fin
    if (isProduction && req.body?.email) {
      return `login-${req.ip}-${req.body.email}`;
    }
    return isDevelopment ? 'dev-login' : `login-${req.ip}`;
  },
});

/**
 * Rate limiting général pour les autres endpoints auth
 */
export const authRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 1000 : isProduction ? 100 : 200,
  message: {
    success: false,
    message: isDevelopment
      ? 'Rate limiting désactivé en développement'
      : "Trop de requêtes d'authentification. Réessayez dans quelques minutes.",
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: isDevelopment ? 0 : 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipFunction,

  keyGenerator: (req: Request): string => {
    return isDevelopment ? 'dev-auth' : `auth-${req.ip}`;
  },
});

/**
 * Rate limiting global (plus permissif)
 */
export const globalRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 10000 : isProduction ? 2000 : 5000, // Très généreux
  message: {
    success: false,
    message: isDevelopment
      ? 'Rate limiting global désactivé en développement'
      : 'Trop de requêtes depuis cette IP. Réessayez plus tard.',
    code: 'GLOBAL_RATE_LIMIT_EXCEEDED',
    retryAfter: isDevelopment ? 0 : 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipFunction,
});

/**
 * Rate limiting spécial pour les endpoints d'upload de fichiers
 */
export const uploadRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 10 * 60 * 1000,
  max: isDevelopment ? 1000 : isProduction ? 20 : 50,
  message: {
    success: false,
    message: "Trop d'uploads depuis cette IP. Réessayez dans quelques minutes.",
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
  skip: skipFunction,
});

/**
 * Configuration avancée pour éviter les attaques par déni de service
 */
export const createProgressiveRateLimit = (baseMax: number) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      // Augmenter la limite pour les utilisateurs authentifiés
      if (req.user) {
        return baseMax * 3; // 3x plus pour les utilisateurs connectés
      }

      // Réduire pour les User-Agents suspects
      const userAgent = req.get('User-Agent') || '';
      if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        return Math.floor(baseMax * 0.1); // 10x moins pour les bots
      }

      return baseMax;
    },
    skip: skipFunction,
    message: {
      success: false,
      message:
        'Limite de requêtes dépassée. Connectez-vous pour des limites plus élevées.',
      code: 'PROGRESSIVE_RATE_LIMIT_EXCEEDED',
    },
  });
};

/**
 * Configuration spéciale pour les APIs publiques (recherche, etc.)
 */
export const publicApiRateLimit = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 10 * 60 * 1000,
  max: isDevelopment ? 1000 : isProduction ? 500 : 1000, // Très généreux pour les APIs publiques
  message: {
    success: false,
    message:
      "Trop de requêtes vers l'API publique. Réessayez dans quelques minutes.",
    code: 'PUBLIC_API_RATE_LIMIT_EXCEEDED',
  },
  skip: skipFunction,

  // Clé plus permissive pour les APIs publiques
  keyGenerator: (req: Request): string => {
    // Grouper par plage IP pour éviter les limitations trop strictes
    const ip = req.ip || '';
    const ipPrefix = ip.substring(0, ip.lastIndexOf('.'));
    return isDevelopment ? 'dev-public' : `public-${ipPrefix}`;
  },
});

/**
 * Middleware pour logger les informations de rate limiting
 */
export const rateLimitLogger = (req: Request, res: any, next: any) => {
  if (isDevelopment) {
    console.log(
      `[Rate Limit] ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?.email || 'Anonymous'}`
    );
  }
  next();
};

/**
 * Fonction utilitaire pour créer des exceptions temporaires
 */
export const createTemporaryException = (
  ip: string,
  durationMinutes: number = 60
) => {
  const exceptionKey = `temp_exception_${ip}`;
  const expirationTime = Date.now() + durationMinutes * 60 * 1000;

  // En vrai, vous stockeriez ça en Redis
  // Pour l'instant, just log
  console.log(
    `Exception temporaire créée pour IP ${ip} pendant ${durationMinutes} minutes`
  );

  return {
    key: exceptionKey,
    expires: expirationTime,
  };
};

/**
 * Configuration d'export selon l'environnement
 */
export const getRateLimitConfig = () => {
  const config = {
    environment: process.env.NODE_ENV,
    development: {
      enabled: false,
      message: 'Rate limiting désactivé en développement',
    },
    test: {
      enabled: false,
      message: 'Rate limiting désactivé pour les tests',
    },
    production: {
      enabled: true,
      register: { windowMs: 15 * 60 * 1000, max: 20 },
      login: { windowMs: 15 * 60 * 1000, max: 30 },
      auth: { windowMs: 15 * 60 * 1000, max: 100 },
      global: { windowMs: 15 * 60 * 1000, max: 2000 },
    },
  };

  console.log(
    `🔒 Rate limiting configuré pour l'environnement: ${config.environment}`
  );
  console.log(
    `🔒 Rate limiting ${isDevelopment || isTest ? 'DÉSACTIVÉ' : 'ACTIVÉ'}`
  );

  return config;
};

// Initialisation et logging
getRateLimitConfig();
