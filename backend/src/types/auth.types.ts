// src/types/auth.types.ts - Types d'authentification backend V2.0
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ESTABLISHMENT_ADMIN' | 'INSURER_AGENT' | 'SUPER_ADMIN';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  licenseNumber?: string;
  specialtyId?: string;
  companyId?: string;
  establishmentId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    };
    token: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
  };
}