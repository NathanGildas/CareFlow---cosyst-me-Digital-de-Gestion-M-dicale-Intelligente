// src/services/referentials.service.ts - Service pour la gestion des r�f�rentiels
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
  // ===== SP�CIALIT�S M�DICALES =====

  /**
   * R�cup�rer toutes les sp�cialit�s m�dicales
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
   * R�cup�rer une sp�cialit� par ID
   */
  async getSpecialtyById(id: string): Promise<Specialty> {
    const response = await apiService.get(`/referentials/specialties/${id}`);
    return response.data.data;
  }

  /**
   * Cr�er une nouvelle sp�cialit� (Admin uniquement)
   */
  async createSpecialty(data: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>): Promise<Specialty> {
    const response = await apiService.post('/referentials/specialties', data);
    return response.data.data;
  }

  /**
   * Mettre � jour une sp�cialit� (Admin uniquement)
   */
  async updateSpecialty(id: string, data: Partial<Specialty>): Promise<Specialty> {
    const response = await apiService.put(`/referentials/specialties/${id}`, data);
    return response.data.data;
  }

  // ===== �TABLISSEMENTS DE SANT� =====

  /**
   * R�cup�rer tous les �tablissements de sant�
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
   * R�cup�rer un �tablissement par ID
   */
  async getEstablishmentById(id: string): Promise<Establishment> {
    const response = await apiService.get(`/referentials/establishments/${id}`);
    return response.data.data;
  }

  /**
   * Rechercher des �tablissements par proximit�
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
   * Cr�er un nouvel �tablissement (Admin uniquement)
   */
  async createEstablishment(data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Establishment> {
    const response = await apiService.post('/referentials/establishments', data);
    return response.data.data;
  }

  /**
   * Mettre � jour un �tablissement (Admin uniquement)
   */
  async updateEstablishment(id: string, data: Partial<Establishment>): Promise<Establishment> {
    const response = await apiService.put(`/referentials/establishments/${id}`, data);
    return response.data.data;
  }

  // ===== R�GIONS ET VILLES =====

  /**
   * R�cup�rer toutes les r�gions
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
   * R�cup�rer toutes les villes
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
   * R�cup�rer les villes d'une r�gion
   */
  async getCitiesByRegion(regionId: string): Promise<City[]> {
    const response = await apiService.get(`/referentials/regions/${regionId}/cities`);
    return response.data.data;
  }

  // ===== COMPAGNIES D'ASSURANCE =====

  /**
   * R�cup�rer toutes les compagnies d'assurance
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
   * R�cup�rer une compagnie d'assurance par ID
   */
  async getInsuranceCompanyById(id: string): Promise<InsuranceCompany> {
    const response = await apiService.get(`/referentials/insurance-companies/${id}`);
    return response.data.data;
  }

  /**
   * Cr�er une nouvelle compagnie d'assurance (Admin uniquement)
   */
  async createInsuranceCompany(data: Omit<InsuranceCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceCompany> {
    const response = await apiService.post('/referentials/insurance-companies', data);
    return response.data.data;
  }

  /**
   * Mettre � jour une compagnie d'assurance (Admin uniquement)
   */
  async updateInsuranceCompany(id: string, data: Partial<InsuranceCompany>): Promise<InsuranceCompany> {
    const response = await apiService.put(`/referentials/insurance-companies/${id}`, data);
    return response.data.data;
  }

  // ===== FONCTIONS UTILITAIRES =====

  /**
   * Recherche globale dans tous les r�f�rentiels
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
   * Obtenir les statistiques des r�f�rentiels
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
   * Synchroniser les donn�es depuis une source externe (Admin uniquement)
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
   * Pr�charger les donn�es fr�quemment utilis�es
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
    // Impl�mentation du nettoyage du cache
    localStorage.removeItem('careflow_referentials_cache');
    sessionStorage.removeItem('careflow_referentials_temp');
  }
}

// ===== EXPORT =====

export const referentialsService = new ReferentialsService();
export default referentialsService;