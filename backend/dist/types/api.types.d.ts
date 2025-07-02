import { Request } from 'express';
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
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
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
export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
}
export declare const ERROR_CODES: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly INVALID_TOKEN: "INVALID_TOKEN";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly REQUIRED_FIELD: "REQUIRED_FIELD";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly ALREADY_EXISTS: "ALREADY_EXISTS";
    readonly CONFLICT: "CONFLICT";
    readonly APPOINTMENT_CONFLICT: "APPOINTMENT_CONFLICT";
    readonly INSUFFICIENT_COVERAGE: "INSUFFICIENT_COVERAGE";
    readonly DOCTOR_UNAVAILABLE: "DOCTOR_UNAVAILABLE";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly RATE_LIMITED: "RATE_LIMITED";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export interface MiddlewareContext {
    requestId: string;
    startTime: number;
    user?: AuthenticatedUser;
    metadata?: Record<string, any>;
}
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
