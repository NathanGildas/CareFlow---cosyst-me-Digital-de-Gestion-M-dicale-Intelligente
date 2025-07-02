// src/services/api.ts
import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ===== TYPES DE BASE =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, string | number | boolean>;
}

// ===== TYPES SPÉCIFIQUES AUX ENTITÉS =====

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "PATIENT" | "DOCTOR" | "INSURER" | "ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  city?: string;
  region?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialtyId: string;
  specialty?: {
    id: string;
    name: string;
    code: string;
  };
  establishmentId?: string;
  establishment?: {
    id: string;
    name: string;
    address: string;
  };
  consultationFee?: number;
  bio?: string;
  experience?: number;
  languages?: string[];
  availableSlots?: string[];
}

export interface Establishment {
  id: string;
  name: string;
  type: "HOSPITAL" | "CLINIC" | "PHARMACY" | "LABORATORY";
  address: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  website?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  services?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  establishmentId: string;
  scheduledAt: string;
  duration: number;
  status: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  reason?: string;
  notes?: string;
  consultation?: {
    id: string;
    diagnosis?: string;
    prescription?: string;
    followUpDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  isActive: boolean;
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  companyId: string;
  policyNumber: string;
  formulaType: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  startDate: string;
  endDate: string;
  premium: number;
  coverage: {
    consultations: number;
    hospitalizations: number;
    medications: number;
    diagnostics: number;
  };
  isActive: boolean;
}

// ===== TYPES POUR LES REQUÊTES =====

export interface CreateAppointmentRequest {
  doctorId: string;
  establishmentId: string;
  scheduledAt: string;
  duration: number;
  reason?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt?: string;
  duration?: number;
  reason?: string;
  notes?: string;
}

export interface SearchDoctorsRequest extends SearchParams, PaginationParams {
  specialtyId?: string;
  region?: string;
  availableFrom?: string;
  availableTo?: string;
}

export interface SearchEstablishmentsRequest
  extends SearchParams,
    PaginationParams {
  type?: string;
  region?: string;
  services?: string[];
}

// ===== CONFIGURATION AXIOS =====

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("careflow_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré - tenter le refresh
      const refreshToken = localStorage.getItem("careflow_refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken } = refreshResponse.data.data;
          localStorage.setItem("careflow_access_token", accessToken);

          // Relancer la requête originale
          if (error.config?.headers) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient.request(error.config);
          }
        } catch {
          // Refresh échoué - déconnecter l'utilisateur
          localStorage.removeItem("careflow_access_token");
          localStorage.removeItem("careflow_refresh_token");
          localStorage.removeItem("careflow_user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===== SERVICE API PRINCIPAL =====

export class ApiService {
  // ===== AUTHENTIFICATION =====

  async login(credentials: { email: string; password: string }): Promise<
    ApiResponse<{
      user: User;
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    }>
  > {
    const response: AxiosResponse<
      ApiResponse<{
        user: User;
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        };
      }>
    > = await apiClient.post("/auth/login", credentials);
    return response.data;
  }

  async register(userData: Record<string, unknown>): Promise<
    ApiResponse<{
      user: User;
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    }>
  > {
    const response: AxiosResponse<
      ApiResponse<{
        user: User;
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        };
      }>
    > = await apiClient.post("/auth/register", userData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get(
      "/auth/profile"
    );
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put(
      "/auth/profile",
      profileData
    );
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(
      "/auth/logout"
    );
    return response.data;
  }

  // ===== RÉFÉRENTIELS =====

  async getRegions(): Promise<
    ApiResponse<Array<{ id: string; name: string; code: string }>>
  > {
    const response: AxiosResponse<
      ApiResponse<Array<{ id: string; name: string; code: string }>>
    > = await apiClient.get("/referentials/regions");
    return response.data;
  }

  async getSpecialties(): Promise<
    ApiResponse<
      Array<{ id: string; name: string; code: string; description?: string }>
    >
  > {
    const response: AxiosResponse<
      ApiResponse<
        Array<{ id: string; name: string; code: string; description?: string }>
      >
    > = await apiClient.get("/referentials/specialties");
    return response.data;
  }

  async getInsuranceCompanies(): Promise<ApiResponse<InsuranceCompany[]>> {
    const response: AxiosResponse<ApiResponse<InsuranceCompany[]>> =
      await apiClient.get("/referentials/insurance-companies");
    return response.data;
  }

  async getStats(): Promise<ApiResponse<Record<string, number>>> {
    const response: AxiosResponse<ApiResponse<Record<string, number>>> =
      await apiClient.get("/referentials/stats");
    return response.data;
  }

  // ===== ÉTABLISSEMENTS =====

  async searchEstablishments(
    params: SearchEstablishmentsRequest
  ): Promise<ApiResponse<PaginatedResponse<Establishment>>> {
    const response: AxiosResponse<
      ApiResponse<PaginatedResponse<Establishment>>
    > = await apiClient.get("/establishments", { params });
    return response.data;
  }

  async getEstablishment(id: string): Promise<ApiResponse<Establishment>> {
    const response: AxiosResponse<ApiResponse<Establishment>> =
      await apiClient.get(`/establishments/${id}`);
    return response.data;
  }

  async createEstablishment(
    data: Omit<Establishment, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Establishment>> {
    const response: AxiosResponse<ApiResponse<Establishment>> =
      await apiClient.post("/establishments", data);
    return response.data;
  }

  async updateEstablishment(
    id: string,
    data: Partial<Establishment>
  ): Promise<ApiResponse<Establishment>> {
    const response: AxiosResponse<ApiResponse<Establishment>> =
      await apiClient.put(`/establishments/${id}`, data);
    return response.data;
  }

  // ===== MÉDECINS =====

  async searchDoctors(
    params: SearchDoctorsRequest
  ): Promise<ApiResponse<PaginatedResponse<Doctor>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Doctor>>> =
      await apiClient.get("/doctors", { params });
    return response.data;
  }

  async getDoctor(id: string): Promise<ApiResponse<Doctor>> {
    const response: AxiosResponse<ApiResponse<Doctor>> = await apiClient.get(
      `/doctors/${id}`
    );
    return response.data;
  }

  async getDoctorAvailability(
    doctorId: string,
    date: string
  ): Promise<
    ApiResponse<Array<{ start: string; end: string; available: boolean }>>
  > {
    const response: AxiosResponse<
      ApiResponse<Array<{ start: string; end: string; available: boolean }>>
    > = await apiClient.get(`/doctors/${doctorId}/availability`, {
      params: { date },
    });
    return response.data;
  }

  // ===== RENDEZ-VOUS =====

  async getAppointments(
    params?: PaginationParams & { status?: string; from?: string; to?: string }
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Appointment>>> =
      await apiClient.get("/appointments", { params });
    return response.data;
  }

  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const response: AxiosResponse<ApiResponse<Appointment>> =
      await apiClient.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(
    data: CreateAppointmentRequest
  ): Promise<ApiResponse<Appointment>> {
    const response: AxiosResponse<ApiResponse<Appointment>> =
      await apiClient.post("/appointments", data);
    return response.data;
  }

  async updateAppointment(
    id: string,
    data: UpdateAppointmentRequest
  ): Promise<ApiResponse<Appointment>> {
    const response: AxiosResponse<ApiResponse<Appointment>> =
      await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  }

  async cancelAppointment(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Appointment>> {
    const response: AxiosResponse<ApiResponse<Appointment>> =
      await apiClient.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  }

  // ===== ASSURANCES =====

  async getInsurancePolicies(): Promise<ApiResponse<InsurancePolicy[]>> {
    const response: AxiosResponse<ApiResponse<InsurancePolicy[]>> =
      await apiClient.get("/insurance/policies");
    return response.data;
  }

  async getInsurancePolicy(id: string): Promise<ApiResponse<InsurancePolicy>> {
    const response: AxiosResponse<ApiResponse<InsurancePolicy>> =
      await apiClient.get(`/insurance/policies/${id}`);
    return response.data;
  }

  async createInsurancePolicy(
    data: Omit<InsurancePolicy, "id">
  ): Promise<ApiResponse<InsurancePolicy>> {
    const response: AxiosResponse<ApiResponse<InsurancePolicy>> =
      await apiClient.post("/insurance/policies", data);
    return response.data;
  }

  // ===== PATIENTS =====

  async getPatients(
    params?: PaginationParams & SearchParams
  ): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Patient>>> =
      await apiClient.get("/patients", { params });
    return response.data;
  }

  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    const response: AxiosResponse<ApiResponse<Patient>> = await apiClient.get(
      `/patients/${id}`
    );
    return response.data;
  }

  async updatePatient(
    id: string,
    data: Partial<Patient>
  ): Promise<ApiResponse<Patient>> {
    const response: AxiosResponse<ApiResponse<Patient>> = await apiClient.put(
      `/patients/${id}`,
      data
    );
    return response.data;
  }

  // ===== NOTIFICATIONS =====

  async getNotifications(params?: PaginationParams): Promise<
    ApiResponse<
      PaginatedResponse<{
        id: string;
        title: string;
        message: string;
        type: string;
        read: boolean;
        createdAt: string;
      }>
    >
  > {
    const response: AxiosResponse<
      ApiResponse<
        PaginatedResponse<{
          id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          createdAt: string;
        }>
      >
    > = await apiClient.get("/notifications", { params });
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await apiClient.patch(
      `/notifications/${id}/read`
    );
    return response.data;
  }

  // ===== ANALYTICS =====

  async getAnalytics(
    type: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
      await apiClient.get(`/analytics/${type}`, { params });
    return response.data;
  }

  // ===== UTILITAIRES =====

  async uploadFile(
    file: File,
    category: string
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response: AxiosResponse<
      ApiResponse<{ url: string; filename: string }>
    > = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async downloadFile(url: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await apiClient.get(url, {
      responseType: "blob",
    });
    return response.data;
  }
}

// ===== GESTION D'ERREURS =====

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      code?: string;
    }>;

    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Une erreur est survenue",
      code: axiosError.response?.data?.code || axiosError.code,
      status: axiosError.response?.status,
      details: axiosError.response?.data as Record<string, unknown>,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Une erreur inconnue est survenue",
  };
};

// ===== INSTANCE SINGLETON =====

export const apiService = new ApiService();

// Export par défaut
export default apiService;
