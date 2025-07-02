import { CreateInsurancePolicyRequest, CreateClaimRequest } from '../types/insurance.types';
declare class InsuranceService {
    createPolicy(data: CreateInsurancePolicyRequest): Promise<{
        validFrom: Date;
        validUntil: Date;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        companyId: string;
        type: import("../types/insurance.types").InsuranceType;
        policyNumber: string;
        coverageAmount: number;
        premium: number;
        id: string;
    }>;
    getPolicyById(id: string): Promise<null>;
    createClaim(data: CreateClaimRequest): Promise<{
        status: "PENDING";
        createdAt: Date;
        updatedAt: Date;
        policyId: string;
        appointmentId?: string;
        amount: number;
        description: string;
        receipts: string[];
        id: string;
    }>;
    getClaimById(id: string): Promise<null>;
}
export declare const insuranceService: InsuranceService;
export {};
