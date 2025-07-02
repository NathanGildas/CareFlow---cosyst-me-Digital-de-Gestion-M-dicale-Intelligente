// src/types/user.types.ts - Types utilisateur backend
import { Role } from './auth.types';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserResponse {
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