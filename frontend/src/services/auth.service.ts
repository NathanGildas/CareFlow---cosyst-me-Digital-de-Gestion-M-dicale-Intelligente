// src/services/auth.service.ts - Service d'authentification TypeScript strict

import axios from "axios";
import type { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Role,
  RolePermissions,
  AuthError,
  AuthErrorCode,
  ApiResponse,
} from "../types/auth.types";
import { ROLE_PERMISSIONS, AUTH_ERROR_CODES } from "../types/auth.types";

/**
 * Configuration de l'API - UTILISATION DES VARIABLES D'ENVIRONNEMENT
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Interface pour la réponse d'authentification du backend (structure réelle)
 */
interface BackendAuthResponse {
  user: User;
  token: string; // Token JWT direct
  refreshToken: string; // Refresh token direct
}

/**
 * Interface pour les erreurs d'API avec typing strict
 */
interface ApiErrorResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Configuration Axios
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extension du type AxiosRequestConfig pour inclure _retry
 */
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Intercepteur pour ajouter le token aux requêtes
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("careflow_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug en développement
    if (import.meta.env.DEV) {
      console.log("📤 Requête API:", config.method?.toUpperCase(), config.url);
      console.log("📤 Base URL:", API_BASE_URL);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Intercepteur pour gérer le refresh automatique des tokens
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("careflow_refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await apiClient.post("/auth/refresh", {
          refreshToken,
        });

        const authData = response.data.data as BackendAuthResponse;
        localStorage.setItem("careflow_access_token", authData.token);

        // Réessayer la requête originale
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authData.token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Échec du refresh, déconnexion
        localStorage.removeItem("careflow_access_token");
        localStorage.removeItem("careflow_refresh_token");
        localStorage.removeItem("careflow_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Service d'authentification
 */
class AuthService {
  // ===== MÉTHODES D'AUTHENTIFICATION =====

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("🔐 Tentative de connexion...");

      const response: AxiosResponse<ApiResponse<BackendAuthResponse>> =
        await apiClient.post("/auth/login", credentials);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erreur de connexion");
      }

      const backendData = response.data.data;

      // 🎯 ADAPTATION : Convertir la structure backend vers frontend
      localStorage.setItem("careflow_access_token", backendData.token);
      localStorage.setItem("careflow_refresh_token", backendData.refreshToken);
      localStorage.setItem("careflow_user", JSON.stringify(backendData.user));

      // Retourner dans le format attendu par le frontend
      const authResponse: AuthResponse = {
        success: true,
        message: "Connexion réussie",
        data: {
          user: backendData.user,
          token: {
            accessToken: backendData.token,
            refreshToken: backendData.refreshToken,
            expiresIn: 3600,
            tokenType: "Bearer",
          },
        },
      };

      console.log("✅ Connexion réussie");
      return authResponse;
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Inscription utilisateur - NETTOYAGE DES DONNÉES
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log("📝 Tentative d'inscription...");

      // 🎯 NETTOYAGE DES DONNÉES - Enlever confirmPassword et autres champs non acceptés
      const cleanedData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || undefined, // Convertir string vide en undefined
        role: userData.role,
      };

      console.log("📤 Données envoyées au backend:", cleanedData);

      const response: AxiosResponse<ApiResponse<BackendAuthResponse>> =
        await apiClient.post("/auth/register", cleanedData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erreur d'inscription");
      }

      const backendData = response.data.data;

      // 🎯 ADAPTATION : Convertir la structure backend vers frontend
      localStorage.setItem("careflow_access_token", backendData.token);
      localStorage.setItem("careflow_refresh_token", backendData.refreshToken);
      localStorage.setItem("careflow_user", JSON.stringify(backendData.user));

      // Retourner dans le format attendu par le frontend
      const authResponse: AuthResponse = {
        success: true,
        message: "Inscription réussie",
        data: {
          user: backendData.user,
          token: {
            accessToken: backendData.token,
            refreshToken: backendData.refreshToken,
            expiresIn: 3600,
            tokenType: "Bearer",
          },
        },
      };

      console.log("✅ Inscription réussie");
      return authResponse;
    } catch (error) {
      console.error("❌ Erreur d'inscription:", error);
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> =
        await apiClient.get("/auth/profile");

      if (!response.data.success || !response.data.data?.user) {
        throw new Error(response.data.message || "Erreur récupération profil");
      }

      const userData = response.data.data.user;

      // Mettre à jour le localStorage
      localStorage.setItem("careflow_user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.warn("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem("careflow_access_token");
      localStorage.removeItem("careflow_refresh_token");
      localStorage.removeItem("careflow_user");
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("careflow_access_token");
    const user = localStorage.getItem("careflow_user");
    return !!(token && user);
  }

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("careflow_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Erreur parsing utilisateur:", error);
      return null;
    }
  }

  /**
   * Vérifier les permissions d'un rôle
   */
  hasPermission(role: Role, permission: keyof RolePermissions): boolean {
    return ROLE_PERMISSIONS[role]?.[permission] || false;
  }

  /**
   * Obtenir les permissions d'un rôle
   */
  getRolePermissions(role: Role): RolePermissions {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.PATIENT;
  }

  /**
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem("careflow_access_token");
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("careflow_refresh_token");
  }

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Décoder le payload JWT (partie au milieu)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Vérifier si le token expire dans moins de 5 minutes
      return payload.exp < currentTime + 300;
    } catch (error) {
      console.error("Erreur décodage token:", error);
      return true;
    }
  }

  /**
   * Renouveler le token d'accès
   */
  async refreshToken(): Promise<{
    accessToken: string;
    expiresIn: number;
  } | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("Aucun refresh token disponible");
      }

      const response: AxiosResponse<ApiResponse<BackendAuthResponse>> =
        await apiClient.post("/auth/refresh", { refreshToken });

      if (response.data.success && response.data.data) {
        const authData = response.data.data;

        // Mettre à jour les tokens
        localStorage.setItem("careflow_access_token", authData.token);
        localStorage.setItem("careflow_refresh_token", authData.refreshToken);

        console.log("🔄 Token rafraîchi avec succès");
        return {
          accessToken: authData.token,
          expiresIn: 3600,
        };
      }

      throw new Error("Échec du rafraîchissement du token");
    } catch (error) {
      console.error("❌ Erreur refresh token:", error);
      // Nettoyer les tokens invalides
      localStorage.removeItem("careflow_access_token");
      localStorage.removeItem("careflow_refresh_token");
      localStorage.removeItem("careflow_user");
      return null;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> =
        await apiClient.put("/auth/profile", profileData);

      if (!response.data.success || !response.data.data?.user) {
        throw new Error(response.data.message || "Erreur mise à jour profil");
      }

      const updatedUser = response.data.data.user;

      // Mettre à jour le localStorage
      localStorage.setItem("careflow_user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Obtenir les permissions de l'utilisateur (alias pour getRolePermissions)
   */
  getUserPermissions(role: Role): RolePermissions {
    return this.getRolePermissions(role);
  }

  /**
   * Vérifier si l'utilisateur peut accéder à une route
   */
  canAccessRoute(role: Role, routePath: string): boolean {
    // Définir les routes autorisées par rôle
    const roleRoutes: Record<Role, string[]> = {
      PATIENT: [
        "/patient",
        "/patient/appointments",
        "/patient/doctors",
        "/patient/insurance",
        "/patient/medical-history",
        "/patient/profile",
      ],
      DOCTOR: [
        "/doctor",
        "/doctor/patients",
        "/doctor/schedule",
        "/doctor/consultations",
        "/doctor/analytics",
        "/doctor/profile",
      ],
      INSURER: [
        "/insurer",
        "/insurer/subscriptions",
        "/insurer/policies",
        "/insurer/claims",
        "/insurer/establishments",
        "/insurer/analytics",
        "/insurer/profile",
      ],
      ADMIN: [
        "/admin",
        "/admin/users",
        "/admin/establishments",
        "/admin/insurance",
        "/admin/analytics",
        "/admin/settings",
      ],
    };

    // Routes publiques accessibles à tous
    const publicRoutes = ["/", "/login", "/register", "/about", "/contact"];

    if (publicRoutes.includes(routePath)) {
      return true;
    }

    // Vérifier si la route est autorisée pour ce rôle
    const allowedRoutes = roleRoutes[role] || [];
    return allowedRoutes.some((route) => routePath.startsWith(route));
  }

  // ===== GESTION D'ERREURS =====

  /**
   * Gérer les erreurs d'authentification avec types stricts
   */
  private handleAuthError(error: AxiosError): AuthError {
    let message = "Une erreur est survenue";
    let code: AuthErrorCode = AUTH_ERROR_CODES.SERVER_ERROR;

    if (error.response) {
      const { status } = error.response;
      const data = error.response.data as ApiErrorResponse;

      switch (status) {
        case 400:
          message = data?.message || "Données invalides.";
          code = AUTH_ERROR_CODES.VALIDATION_ERROR;
          break;
        case 401:
          message = "Session expirée. Veuillez vous reconnecter.";
          code = AUTH_ERROR_CODES.UNAUTHORIZED;
          break;
        case 403:
          message = "Accès refusé. Permissions insuffisantes.";
          code = AUTH_ERROR_CODES.UNAUTHORIZED;
          break;
        case 409:
          message = "Cette adresse email est déjà utilisée.";
          code = AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS;
          break;
        case 422:
          message = data?.message || "Données invalides.";
          code = AUTH_ERROR_CODES.VALIDATION_ERROR;
          break;
        case 429:
          message = "Trop de tentatives. Réessayez dans quelques minutes.";
          code = AUTH_ERROR_CODES.NETWORK_ERROR;
          break;
        default:
          message = data?.message || "Erreur du serveur.";
      }
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network")
    ) {
      message = "Problème de connexion internet.";
      code = AUTH_ERROR_CODES.NETWORK_ERROR;
    } else if (error.message) {
      message = error.message;
    }

    // 🎯 CORRECTION : Créer AuthError avec type strict
    const authError: AuthError = {
      code,
      message,
    };

    return authError;
  }

  // ===== MÉTHODE DE TEST =====

  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Test de connexion au backend...");
      console.log("🎯 URL testée:", `${API_BASE_URL}/referentials/regions`);

      const response = await apiClient.get("/referentials/regions");
      console.log("✅ Connexion backend réussie:", response.status);
      return true;
    } catch (error) {
      console.error("❌ Connexion backend échouée:", error);
      return false;
    }
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService();

// Export par défaut
export default authService;
