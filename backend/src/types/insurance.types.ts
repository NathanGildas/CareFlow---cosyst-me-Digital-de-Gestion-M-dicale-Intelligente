// src/types/insurance.types.ts - Types assurance backend
export type InsuranceType = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'FAMILY';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface CreateInsurancePolicyRequest {
  patientId: string;
  companyId: string;
  type: InsuranceType;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  validFrom: string;
  validUntil: string;
}

export interface CreateClaimRequest {
  policyId: string;
  appointmentId?: string;
  amount: number;
  description: string;
  receipts: string[];
}

export interface InsurancePolicyResponse {
  id: string;
  patientId: string;
  companyId: string;
  type: InsuranceType;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}