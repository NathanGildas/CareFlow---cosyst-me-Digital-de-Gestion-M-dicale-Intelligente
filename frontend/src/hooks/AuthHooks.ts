// src/hooks/AuthHooks.ts - Hooks d'authentification CareFlow (CORRIGÉ)

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // 🎯 IMPORT CORRIGÉ
import type { AuthContextType, Role } from "../types/auth.types";
import { ROLE_NAVIGATION } from "../types/auth.types";

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }

  return context;
};

/**
 * Hook pour la gestion des permissions
 */
export const usePermissions = () => {
  const { getUserPermissions, hasPermission, getUserRole } = useAuth();

  return {
    permissions: getUserPermissions(),
    hasPermission,
    userRole: getUserRole(),
  };
};

/**
 * Hook pour la navigation conditionnelle selon le rôle
 */
export const useRoleNavigation = () => {
  const { getUserRole, canAccessRoute } = useAuth();

  const getDefaultRoute = (): string => {
    const role = getUserRole();
    switch (role) {
      case "PATIENT":
        return "/patient";
      case "DOCTOR":
        return "/doctor";
      case "INSURER":
        return "/insurer";
      case "ADMIN":
        return "/admin";
      default:
        return "/";
    }
  };

  const getNavItems = () => {
    const role = getUserRole();
    if (!role) return [];

    // Retourner les éléments de navigation selon le rôle
    return ROLE_NAVIGATION[role] || [];
  };

  const getCurrentNavItems = () => {
    const role = getUserRole();
    return role ? ROLE_NAVIGATION[role] : [];
  };

  const getNavItemsForRole = (role: Role) => {
    return ROLE_NAVIGATION[role] || [];
  };

  return {
    getDefaultRoute,
    getNavItems,
    getCurrentNavItems,
    getNavItemsForRole,
    canAccessRoute,
  };
};

/**
 * Hook pour la gestion de l'état de connexion
 */
export const useAuthState = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    getUserRole,
    getDisplayName,
    getInitials,
    isRole,
  } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    role: getUserRole(),
    displayName: getDisplayName(),
    initials: getInitials(),
    isPatient: isRole("PATIENT"),
    isDoctor: isRole("DOCTOR"),
    isInsurer: isRole("INSURER"),
    isAdmin: isRole("ADMIN"),
  };
};

/**
 * Hook pour les actions d'authentification
 */
export const useAuthActions = () => {
  const { login, register, logout, updateProfile, clearError } = useAuth();

  return {
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
};

/**
 * Hook pour vérifier les permissions spécifiques
 */
export const usePermissionCheck = () => {
  const { hasPermission } = useAuth();

  return {
    canRead: hasPermission("readProfile"),
    canUpdate: hasPermission("updateProfile"),
    canViewPatients: hasPermission("viewPatients"),
    canCreateConsultations: hasPermission("createConsultations"),
    canManageClaims: hasPermission("manageClaims"),
    canManageUsers: hasPermission("manageUsers"),
    canViewAnalytics: hasPermission("viewAnalytics"),
    canManageSettings: hasPermission("manageSettings"),
    hasPermission, // Pour vérifications personnalisées
  };
};

/**
 * Hook pour la redirection automatique selon le rôle
 */
export const useRoleRedirect = () => {
  const { getDefaultRoute } = useRoleNavigation();
  const { isAuthenticated, getUserRole } = useAuth();

  const redirectToRoleDashboard = (): string => {
    if (!isAuthenticated) return "/login";
    return getDefaultRoute();
  };

  const shouldRedirectToLogin = (): boolean => {
    return !isAuthenticated;
  };

  const shouldRedirectToDashboard = (currentPath: string): boolean => {
    if (!isAuthenticated) return false;

    // Si on est sur la page d'accueil ou de login et qu'on est connecté
    const publicPaths = ["/", "/login", "/register"];
    return publicPaths.includes(currentPath);
  };

  return {
    redirectToRoleDashboard,
    shouldRedirectToLogin,
    shouldRedirectToDashboard,
    defaultRoute: getDefaultRoute(),
    userRole: getUserRole(),
  };
};
