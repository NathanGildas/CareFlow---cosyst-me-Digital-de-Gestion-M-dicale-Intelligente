// src/contexts/AuthContext.tsx - Contexte d'authentification corrigé

import React, { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.service";
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
  Role,
  RolePermissions,
} from "../types/auth.types";

// Contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ===== ACTIONS D'AUTHENTIFICATION =====

  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await authService.logout();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Émission d'un événement pour notifier la déconnexion
      window.dispatchEvent(new CustomEvent("auth:logout"));
    } catch (logoutError) {
      console.error("Erreur lors de la déconnexion:", logoutError);
      // Forcer la déconnexion même en cas d'erreur
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // ===== INITIALISATION =====

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Vérifier si un utilisateur est déjà connecté
        const currentUser = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();

        if (isAuthenticated && currentUser) {
          // Vérifier si le token n'est pas expiré
          if (authService.isTokenExpired()) {
            // Tenter de rafraîchir le token
            const newTokens = await authService.refreshToken();
            if (!newTokens) {
              // Si le refresh échoue, déconnecter
              await logout();
              return;
            }
          }

          // Récupérer le profil à jour depuis le serveur
          try {
            const profile = await authService.getProfile();
            setAuthState({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch {
            // Si la récupération du profil échoue, déconnecter
            await logout();
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'auth:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Erreur lors de l'initialisation",
        });
      }
    };

    const setupAuthListeners = () => {
      const handleUnauthorized = () => {
        console.log("Utilisateur non autorisé - déconnexion forcée");
        logout();
      };

      const handleTokenExpired = async () => {
        console.log("Token expiré - tentative de renouvellement");
        const newTokens = await authService.refreshToken();
        if (!newTokens) {
          logout();
        }
      };

      // Écouter les événements d'authentification
      window.addEventListener("auth:unauthorized", handleUnauthorized);
      window.addEventListener("auth:token_expired", handleTokenExpired);

      // Retourner la fonction de nettoyage
      return () => {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
        window.removeEventListener("auth:token_expired", handleTokenExpired);
      };
    };

    initializeAuth();
    const cleanup = setupAuthListeners();

    // Nettoyer les listeners au démontage
    return cleanup;
  }, [logout]); // ✅ Ajouter logout dans les dépendances

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const authResponse = await authService.login(credentials);

        setAuthState({
          user: authResponse.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Émission d'un événement pour notifier la connexion
        window.dispatchEvent(
          new CustomEvent("auth:login", {
            detail: { user: authResponse.data.user },
          })
        );
      } catch (loginError) {
        const errorMessage =
          loginError instanceof Error
            ? loginError.message
            : "Erreur de connexion";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw loginError;
      }
    },
    []
  );

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const authResponse = await authService.register(data);

      setAuthState({
        user: authResponse.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Émission d'un événement pour notifier l'inscription
      window.dispatchEvent(
        new CustomEvent("auth:register", {
          detail: { user: authResponse.data.user },
        })
      );
    } catch (registerError) {
      const errorMessage =
        registerError instanceof Error
          ? registerError.message
          : "Erreur d'inscription";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw registerError;
    }
  }, []);

  const updateProfile = useCallback(
    async (profileData: Partial<User>): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const updatedUser = await authService.updateProfile(profileData);

        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));

        // Émission d'un événement pour notifier la mise à jour du profil
        window.dispatchEvent(
          new CustomEvent("auth:profile_updated", {
            detail: { user: updatedUser },
          })
        );
      } catch (updateError) {
        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : "Erreur de mise à jour";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw updateError;
      }
    },
    []
  );

  const clearError = useCallback((): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // ===== HELPERS ET UTILITAIRES =====

  const getUserRole = useCallback((): Role | null => {
    return authState.user?.role || null;
  }, [authState.user?.role]);

  const getUserPermissions = useCallback((): RolePermissions | null => {
    const role = getUserRole();
    return role ? authService.getUserPermissions(role) : null;
  }, [getUserRole]);

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      const role = getUserRole();
      return role ? authService.hasPermission(role, permission) : false;
    },
    [getUserRole]
  );

  const canAccessRoute = useCallback(
    (routePath: string): boolean => {
      const role = getUserRole();
      return role ? authService.canAccessRoute(role, routePath) : false;
    },
    [getUserRole]
  );

  const isRole = useCallback(
    (role: Role): boolean => {
      return authState.user?.role === role;
    },
    [authState.user?.role]
  );

  const getDisplayName = useCallback((): string => {
    if (!authState.user) return "";
    return `${authState.user.firstName} ${authState.user.lastName}`;
  }, [authState.user]);

  const getInitials = useCallback((): string => {
    if (!authState.user) return "";
    return `${authState.user.firstName.charAt(
      0
    )}${authState.user.lastName.charAt(0)}`.toUpperCase();
  }, [authState.user]);

  // ===== VALEUR DU CONTEXTE =====

  const contextValue: AuthContextType = {
    // État
    ...authState,

    // Actions principales
    login,
    register,
    logout,
    updateProfile,
    clearError,

    // Helpers supplémentaires
    getUserRole,
    getUserPermissions,
    hasPermission,
    canAccessRoute,
    isRole,
    getDisplayName,
    getInitials,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Export du contexte pour usage avancé si nécessaire
export { AuthContext };
