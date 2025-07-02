// src/types/api.types.ts - Types API backend CareFlow
import { Request } from 'express';

// ===== TYPES DE BASE =====

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filters?: Record<string, any>;
}

// ===== REQUÊTE AUTHENTIFIÉE =====

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'INSURER' | 'ADMIN';
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// ===== VALIDATION =====

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ===== FILTRES ET TRI =====

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions extends PaginationQuery {
  sort?: SortOptions[];
  filters?: FilterOptions;
  include?: string[];
  exclude?: string[];
}

// ===== RÉPONSES SPÉCIALISÉES =====

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
  filters?: FilterOptions;
  sort?: SortOptions[];
}

export interface CreateResponse<T> {
  item: T;
  message: string;
}

export interface UpdateResponse<T> {
  item: T;
  changes: Partial<T>;
  message: string;
}

export interface DeleteResponse {
  id: string;
  message: string;
  soft?: boolean;
}

// ===== ERREURS =====

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export const ERROR_CODES = {
  // Authentification
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Ressources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Métier
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  INSUFFICIENT_COVERAGE: 'INSUFFICIENT_COVERAGE',
  DOCTOR_UNAVAILABLE: 'DOCTOR_UNAVAILABLE',
  
  // Système
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ===== MIDDLEWARE =====

export interface MiddlewareContext {
  requestId: string;
  startTime: number;
  user?: AuthenticatedUser;
  metadata?: Record<string, any>;
}

// ===== UPLOAD =====

export interface FileUpload {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export interface UploadResponse {
  file: FileUpload;
  message: string;
}

// ===== AUDIT =====

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}