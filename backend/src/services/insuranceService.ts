// src/services/insuranceService.ts - Service assurance
import prisma from '../utils/prisma';
import { CreateInsurancePolicyRequest, CreateClaimRequest } from '../types/insurance.types';

class InsuranceService {
  async createPolicy(data: CreateInsurancePolicyRequest) {
    // TODO: Créer les modèles Insurance dans le schéma Prisma
    return {
      id: Math.random().toString(36),
      ...data,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getPolicyById(id: string) {
    // TODO: Implémenter avec le modèle InsurancePolicy
    return null;
  }

  async createClaim(data: CreateClaimRequest) {
    // TODO: Implémenter avec le modèle InsuranceClaim
    return {
      id: Math.random().toString(36),
      ...data,
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getClaimById(id: string) {
    // TODO: Implémenter avec le modèle InsuranceClaim
    return null;
  }
}

export const insuranceService = new InsuranceService();