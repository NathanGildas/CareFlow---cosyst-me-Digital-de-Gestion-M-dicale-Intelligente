// src/services/insurance.service.ts - Service API pour le module d'assurance
import axios from "axios";
import type { AxiosResponse } from "axios";
import type {
  InsuranceCompany,
  InsurancePlan,
  InsuranceSearchFilters,
  InsuranceSearchResults,
  QuoteRequest,
  Quote,
  PlanComparison,
  InsuranceSubscription,
  InsuranceClaim,
  SubscriptionForm,
  ApiResponse,
  //PaginatedApiResponse,
} from "../types/insurance.types";

/**
 * Configuration de l'API
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Client API configuré
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Intercepteur pour ajouter le token d'authentification
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Gestion des erreurs API
 */
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw new Error("Erreur réseau inconnue");
};

/**
 * Service Insurance - Toutes les opérations liées à l'assurance
 */
export class InsuranceService {
  // ===== COMPAGNIES D'ASSURANCE =====

  /**
   * Récupérer toutes les compagnies d'assurance
   */
  static async getCompanies(params?: {
    region?: string;
    city?: string;
    minRating?: number;
    isActive?: boolean;
  }): Promise<InsuranceCompany[]> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceCompany[]>> =
        await apiClient.get("/insurance/companies", { params });

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message ||
            "Erreur lors de la récupération des compagnies"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer une compagnie par ID
   */
  static async getCompanyById(id: string): Promise<InsuranceCompany> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceCompany>> =
        await apiClient.get(`/insurance/companies/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Compagnie non trouvée");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== PLANS D'ASSURANCE =====

  /**
   * Rechercher des plans d'assurance avec filtres
   */
  static async searchPlans(
    filters: InsuranceSearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<InsuranceSearchResults> {
    try {
      const params = {
        ...filters,
        page,
        limit,
      };

      const response: AxiosResponse<ApiResponse<InsuranceSearchResults>> =
        await apiClient.get("/insurance/plans/search", { params });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erreur lors de la recherche");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer un plan par ID
   */
  static async getPlanById(id: string): Promise<InsurancePlan> {
    try {
      const response: AxiosResponse<ApiResponse<InsurancePlan>> =
        await apiClient.get(`/insurance/plans/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Plan non trouvé");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer les plans d'une compagnie
   */
  static async getPlansByCompany(companyId: string): Promise<InsurancePlan[]> {
    try {
      const response: AxiosResponse<ApiResponse<InsurancePlan[]>> =
        await apiClient.get(`/insurance/companies/${companyId}/plans`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la récupération des plans"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== COMPARAISON DE PLANS =====

  /**
   * Comparer plusieurs plans
   */
  static async comparePlans(planIds: string[]): Promise<PlanComparison> {
    try {
      const response: AxiosResponse<ApiResponse<PlanComparison>> =
        await apiClient.post("/insurance/plans/compare", { planIds });

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la comparaison"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== DEVIS =====

  /**
   * Demander un devis
   */
  static async requestQuote(quoteRequest: QuoteRequest): Promise<Quote[]> {
    try {
      const response: AxiosResponse<ApiResponse<Quote[]>> =
        await apiClient.post("/insurance/quotes/request", quoteRequest);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la demande de devis"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer un devis par ID
   */
  static async getQuoteById(id: string): Promise<Quote> {
    try {
      const response: AxiosResponse<ApiResponse<Quote>> = await apiClient.get(
        `/insurance/quotes/${id}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Devis non trouvé");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Accepter un devis
   */
  static async acceptQuote(
    quoteId: string
  ): Promise<{ subscriptionId: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ subscriptionId: string }>> =
        await apiClient.post(`/insurance/quotes/${quoteId}/accept`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de l'acceptation du devis"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== SOUSCRIPTIONS =====

  /**
   * Créer une souscription
   */
  static async createSubscription(
    subscriptionData: SubscriptionForm
  ): Promise<InsuranceSubscription> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceSubscription>> =
        await apiClient.post("/insurance/subscriptions", subscriptionData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la souscription"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer les souscriptions de l'utilisateur connecté
   */
  static async getUserSubscriptions(): Promise<InsuranceSubscription[]> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceSubscription[]>> =
        await apiClient.get("/insurance/subscriptions/me");

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message ||
            "Erreur lors de la récupération des souscriptions"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer une souscription par ID
   */
  static async getSubscriptionById(id: string): Promise<InsuranceSubscription> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceSubscription>> =
        await apiClient.get(`/insurance/subscriptions/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Souscription non trouvée");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== SINISTRES / CLAIMS =====

  /**
   * Créer un sinistre
   */
  static async createClaim(claimData: {
    subscriptionId: string;
    amount: number;
    description: string;
    medicalProvider: string;
    consultationDate: string;
    documents?: File[];
  }): Promise<InsuranceClaim> {
    try {
      const formData = new FormData();

      // Ajouter les données du sinistre
      Object.entries(claimData).forEach(([key, value]) => {
        if (key !== "documents" && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter les documents
      if (claimData.documents) {
        claimData.documents.forEach((file, index) => {
          formData.append(`documents[${index}]`, file);
        });
      }

      const response: AxiosResponse<ApiResponse<InsuranceClaim>> =
        await apiClient.post("/insurance/claims", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la création du sinistre"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer les sinistres de l'utilisateur
   */
  static async getUserClaims(): Promise<InsuranceClaim[]> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceClaim[]>> =
        await apiClient.get("/insurance/claims/me");

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message ||
            "Erreur lors de la récupération des sinistres"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer un sinistre par ID
   */
  static async getClaimById(id: string): Promise<InsuranceClaim> {
    try {
      const response: AxiosResponse<ApiResponse<InsuranceClaim>> =
        await apiClient.get(`/insurance/claims/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Sinistre non trouvé");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ===== UTILITAIRES =====

  /**
   * Calculer le prix d'un plan selon l'âge et les options
   */
  static async calculatePremium(params: {
    planId: string;
    age: number;
    beneficiariesCount: number;
    hasPreexistingConditions: boolean;
  }): Promise<{ monthlyPremium: number; annualPremium: number }> {
    try {
      const response: AxiosResponse<
        ApiResponse<{ monthlyPremium: number; annualPremium: number }>
      > = await apiClient.post("/insurance/plans/calculate-premium", params);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erreur lors du calcul");
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Vérifier l'éligibilité pour un plan
   */
  static async checkEligibility(params: {
    planId: string;
    age: number;
    hasPreexistingConditions: boolean;
    preexistingConditions?: string[];
  }): Promise<{ eligible: boolean; reasons?: string[] }> {
    try {
      const response: AxiosResponse<
        ApiResponse<{ eligible: boolean; reasons?: string[] }>
      > = await apiClient.post("/insurance/plans/check-eligibility", params);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Erreur lors de la vérification"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Récupérer les statistiques d'assurance par région
   */
  static async getRegionStats(): Promise<
    {
      region: string;
      companiesCount: number;
      plansCount: number;
      averagePremium: number;
      popularPlans: string[];
    }[]
  > {
    try {
      const response: AxiosResponse<
        ApiResponse<
          {
            region: string;
            companiesCount: number;
            plansCount: number;
            averagePremium: number;
            popularPlans: string[];
          }[]
        >
      > = await apiClient.get("/insurance/stats/regions");

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message ||
            "Erreur lors de la récupération des statistiques"
        );
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Export du service
export default InsuranceService;
