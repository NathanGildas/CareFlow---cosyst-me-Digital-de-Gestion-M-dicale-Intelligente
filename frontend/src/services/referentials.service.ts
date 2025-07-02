// src/services/referentials.service.ts - Service pour la gestion des référentiels
import { apiService } from './api';

// ===== TYPES =====

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'CLINIC' | 'MEDICAL_CENTER' | 'PHARMACY';
  address: string;
  city: string;
  region: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  country: string;
  isActive: boolean;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
  region?: Region;
  postalCode?: string;
  isActive: boolean;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  licenseNumber: string;
  isActive: boolean;
  coverageTypes: string[];
  createdAt: string;
  updatedAt: string;
}

// ===== SERVICE CLASS =====

class ReferentialsService {
  // ===== SPÉCIALITÉS MÉDICALES =====

  /**
   * Récupérer toutes les spécialités médicales
   */
  async getSpecialties(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Specialty[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiService.get('/referentials/specialties', { params });
    return response.data;
  }

  /**
   * Récupérer une spécialité par ID
   */
  async getSpecialtyById(id: string): Promise<Specialty> {
    const response = await apiService.get(`/referentials/specialties/${id}`);
    return response.data.data;
  }

  /**
   * Créer une nouvelle spécialité (Admin uniquement)
   */
  async createSpecialty(data: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>): Promise<Specialty> {
    const response = await apiService.post('/referentials/specialties', data);
    return response.data.data;
  }

  /**
   * Mettre à jour une spécialité (Admin uniquement)
   */
  async updateSpecialty(id: string, data: Partial<Specialty>): Promise<Specialty> {
    const response = await apiService.put(`/referentials/specialties/${id}`, data);
    return response.data.data;
  }

  // ===== ÉTABLISSEMENTS DE SANTÉ =====

  /**
   * Récupérer tous les établissements de santé
   */
  async getEstablishments(params?: {
    search?: string;
    type?: string;
    city?: string;
    region?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Establishment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiService.get('/referentials/establishments', { params });
    return response.data;
  }

  /**
   * Récupérer un établissement par ID
   */
  async getEstablishmentById(id: string): Promise<Establishment> {
    const response = await apiService.get(`/referentials/establishments/${id}`);
    return response.data.data;
  }

  /**
   * Rechercher des établissements par proximité
   */
  async getEstablishmentsByLocation(
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<Establishment[]> {
    const response = await apiService.get('/referentials/establishments/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data.data;
  }

  /**
   * Créer un nouvel établissement (Admin uniquement)
   */
  async createEstablishment(data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Establishment> {
    const response = await apiService.post('/referentials/establishments', data);
    return response.data.data;
  }

  /**
   * Mettre à jour un établissement (Admin uniquement)
   */
  async updateEstablishment(id: string, data: Partial<Establishment>): Promise<Establishment> {
    const response = await apiService.put(`/referentials/establishments/${id}`, data);
    return response.data.data;
  }

  // ===== RÉGIONS ET VILLES =====

  /**
   * Récupérer toutes les régions
   */
  async getRegions(params?: {
    search?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<Region[]> {
    const response = await apiService.get('/referentials/regions', { params });
    return response.data.data;
  }

  /**
   * Récupérer toutes les villes
   */
  async getCities(params?: {
    search?: string;
    regionId?: string;
    isActive?: boolean;
  }): Promise<City[]> {
    const response = await apiService.get('/referentials/cities', { params });
    return response.data.data;
  }

  /**
   * Récupérer les villes d'une région
   */
  async getCitiesByRegion(regionId: string): Promise<City[]> {
    const response = await apiService.get(`/referentials/regions/${regionId}/cities`);
    return response.data.data;
  }

  // ===== COMPAGNIES D'ASSURANCE =====

  /**
   * Récupérer toutes les compagnies d'assurance
   */
  async getInsuranceCompanies(params?: {
    search?: string;
    isActive?: boolean;
    coverageType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: InsuranceCompany[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiService.get('/referentials/insurance-companies', { params });
    return response.data;
  }

  /**
   * Récupérer une compagnie d'assurance par ID
   */
  async getInsuranceCompanyById(id: string): Promise<InsuranceCompany> {
    const response = await apiService.get(`/referentials/insurance-companies/${id}`);
    return response.data.data;
  }

  /**
   * Créer une nouvelle compagnie d'assurance (Admin uniquement)
   */
  async createInsuranceCompany(data: Omit<InsuranceCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceCompany> {
    const response = await apiService.post('/referentials/insurance-companies', data);
    return response.data.data;
  }

  /**
   * Mettre à jour une compagnie d'assurance (Admin uniquement)
   */
  async updateInsuranceCompany(id: string, data: Partial<InsuranceCompany>): Promise<InsuranceCompany> {
    const response = await apiService.put(`/referentials/insurance-companies/${id}`, data);
    return response.data.data;
  }

  // ===== FONCTIONS UTILITAIRES =====

  /**
   * Recherche globale dans tous les référentiels
   */
  async globalSearch(query: string, types?: string[]): Promise<{
    specialties: Specialty[];
    establishments: Establishment[];
    cities: City[];
    insuranceCompanies: InsuranceCompany[];
  }> {
    const response = await apiService.get('/referentials/search', {
      params: { query, types: types?.join(',') }
    });
    return response.data.data;
  }

  /**
   * Obtenir les statistiques des référentiels
   */
  async getStats(): Promise<{
    specialties: { total: number; active: number };
    establishments: { total: number; active: number; byType: Record<string, number> };
    regions: { total: number; active: number };
    cities: { total: number; active: number };
    insuranceCompanies: { total: number; active: number };
  }> {
    const response = await apiService.get('/referentials/stats');
    return response.data.data;
  }

  /**
   * Synchroniser les données depuis une source externe (Admin uniquement)
   */
  async syncData(source: 'government' | 'insurance' | 'medical'): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    errors: number;
  }> {
    const response = await apiService.post('/referentials/sync', { source });
    return response.data.data;
  }

  // ===== CACHE ET OPTIMISATION =====

  /**
   * Précharger les données fréquemment utilisées
   */
  async preloadEssentialData(): Promise<{
    specialties: Specialty[];
    regions: Region[];
    cities: City[];
    establishmentTypes: string[];
  }> {
    const [specialties, regions, cities] = await Promise.all([
      this.getSpecialties({ isActive: true, limit: 100 }),
      this.getRegions({ isActive: true }),
      this.getCities({ isActive: true })
    ]);

    return {
      specialties: specialties.data,
      regions,
      cities,
      establishmentTypes: ['HOSPITAL', 'CLINIC', 'MEDICAL_CENTER', 'PHARMACY']
    };
  }

  /**
   * Nettoyer le cache local
   */
  clearCache(): void {
    // Implémentation du nettoyage du cache
    localStorage.removeItem('careflow_referentials_cache');
    sessionStorage.removeItem('careflow_referentials_temp');
  }
}

// ===== EXPORT =====

export const referentialsService = new ReferentialsService();
export default referentialsService;