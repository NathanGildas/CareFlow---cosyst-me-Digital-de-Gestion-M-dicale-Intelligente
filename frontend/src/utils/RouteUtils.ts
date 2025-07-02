// src/utils/RouteUtils.ts
import React from "react";
import { useAuth } from "../hooks/AuthHooks";
import type { Role, RolePermissions } from "../types/auth.types";

/**
 * Fonction utilitaire pour obtenir le chemin du dashboard selon le rôle
 */
export const getDashboardPath = (role: Role): string => {
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

/**
 * Hook personnalisé pour vérifier l'accès dans les composants
 */
export const useRouteAccess = () => {
  const { isAuthenticated, user, hasPermission } = useAuth();

  const canAccess = (
    requiredRoles?: Role[],
    requiredPermission?: keyof RolePermissions
  ): boolean => {
    if (!isAuthenticated || !user) return false;

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return false;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }

    return true;
  };

  const canAccessRoute = (routePath: string): boolean => {
    // Mapping simplifié route -> rôle requis
    const routeRoleMapping: Record<string, Role[]> = {
      "/patient": ["PATIENT"],
      "/doctor": ["DOCTOR"],
      "/insurer": ["INSURER"],
      "/admin": ["ADMIN"],
    };

    const requiredRoles = routeRoleMapping[routePath];
    return requiredRoles ? canAccess(requiredRoles) : true;
  };

  const getUserAccessLevel = (): number => {
    if (!user) return 0;

    // Niveaux d'accès par rôle
    const accessLevels: Record<Role, number> = {
      PATIENT: 1,
      DOCTOR: 2,
      INSURER: 3,
      ADMIN: 4,
    };

    return accessLevels[user.role] || 0;
  };

  return {
    canAccess,
    canAccessRoute,
    getUserAccessLevel,
    isAuthenticated,
    userRole: user?.role || null,
  };
};

/**
 * Interface pour les options du HOC withAuth
 */
interface WithAuthOptions {
  requiredRoles?: Role[];
  requiredPermission?: keyof RolePermissions;
  fallbackPath?: string;
  requireAuth?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * HOC (Higher-Order Component) pour protéger des composants
 * Version simplifiée sans dépendance circulaire
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, user, hasPermission } = useAuth();

    // Vérifications d'authentification directement dans le HOC
    if (options.requireAuth !== false && !isAuthenticated) {
      // Rediriger vers la page de login ou afficher un message
      return React.createElement(
        "div",
        {
          className: "min-h-screen flex items-center justify-center bg-gray-50",
        },
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h1",
            { className: "text-2xl font-bold text-gray-900 mb-4" },
            "Authentification requise"
          ),
          React.createElement(
            "p",
            { className: "text-gray-600 mb-4" },
            "Vous devez vous connecter pour accéder à cette page."
          ),
          React.createElement(
            "a",
            {
              href: options.fallbackPath || "/login",
              className: "text-primary-600 hover:text-primary-700 underline",
            },
            "Se connecter"
          )
        )
      );
    }

    // Vérification des rôles requis
    if (
      options.requiredRoles &&
      user &&
      !options.requiredRoles.includes(user.role)
    ) {
      return React.createElement(
        "div",
        {
          className: "min-h-screen flex items-center justify-center bg-gray-50",
        },
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h1",
            { className: "text-2xl font-bold text-red-600 mb-4" },
            "Accès refusé"
          ),
          React.createElement(
            "p",
            { className: "text-gray-600 mb-4" },
            "Vous n'avez pas les permissions nécessaires pour accéder à cette page."
          ),
          React.createElement(
            "button",
            {
              onClick: () => window.history.back(),
              className: "text-primary-600 hover:text-primary-700 underline",
            },
            "Retour"
          )
        )
      );
    }

    // Vérification des permissions requises
    if (
      options.requiredPermission &&
      user &&
      !hasPermission(options.requiredPermission)
    ) {
      return React.createElement(
        "div",
        {
          className: "min-h-screen flex items-center justify-center bg-gray-50",
        },
        React.createElement(
          "div",
          { className: "text-center" },
          React.createElement(
            "h1",
            { className: "text-2xl font-bold text-red-600 mb-4" },
            "Permission insuffisante"
          ),
          React.createElement(
            "p",
            { className: "text-gray-600 mb-4" },
            `Vous n'avez pas la permission requise: ${options.requiredPermission}`
          ),
          React.createElement(
            "button",
            {
              onClick: () => window.history.back(),
              className: "text-primary-600 hover:text-primary-700 underline",
            },
            "Retour"
          )
        )
      );
    }

    // Si toutes les vérifications passent, rendre le composant
    // Utilisation de Component ici pour éviter l'erreur "is declared but its value is never read"
    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

/**
 * Hook pour la navigation conditionnelle selon les permissions
 */
export const useConditionalNavigation = () => {
  const { canAccess, userRole } = useRouteAccess();

  const getAvailableRoutes = (): Array<{
    path: string;
    label: string;
    role: Role;
  }> => {
    const allRoutes = [
      { path: "/patient", label: "Espace Patient", role: "PATIENT" as Role },
      { path: "/doctor", label: "Espace Médecin", role: "DOCTOR" as Role },
      { path: "/insurer", label: "Espace Assureur", role: "INSURER" as Role },
      { path: "/admin", label: "Administration", role: "ADMIN" as Role },
    ];

    return allRoutes.filter((route) => canAccess([route.role]));
  };

  const getDefaultRoute = (): string => {
    return userRole ? getDashboardPath(userRole) : "/";
  };

  const canSwitchToRole = (targetRole: Role): boolean => {
    // Logique pour déterminer si l'utilisateur peut accéder à un autre rôle
    // Par exemple, un admin peut voir tous les espaces
    if (userRole === "ADMIN") return true;
    return userRole === targetRole;
  };

  return {
    getAvailableRoutes,
    getDefaultRoute,
    canSwitchToRole,
    currentRole: userRole,
  };
};

/**
 * Hook pour la gestion des breadcrumbs
 */
export const useBreadcrumbs = () => {
  const { userRole } = useRouteAccess();

  const getBreadcrumbsForPath = (
    pathname: string
  ): Array<{ label: string; path: string }> => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string }> = [];

    // Mapping des segments vers les labels
    const segmentLabels: Record<string, string> = {
      patient: "Patient",
      doctor: "Médecin",
      insurer: "Assureur",
      admin: "Administration",
      appointments: "Rendez-vous",
      doctors: "Médecins",
      insurance: "Assurance",
      "medical-history": "Historique médical",
      patients: "Patients",
      schedule: "Planning",
      consultations: "Consultations",
      analytics: "Statistiques",
      subscriptions: "Souscriptions",
      policies: "Polices",
      claims: "Remboursements",
      establishments: "Établissements",
      users: "Utilisateurs",
      settings: "Paramètres",
      profile: "Profil",
    };

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segmentLabels[segment] || segment;

      breadcrumbs.push({
        label: index === 0 ? `Tableau de bord ${label}` : label,
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  return {
    getBreadcrumbsForPath,
    userRole,
  };
};

/**
 * Utilitaires pour la validation des permissions
 */
export const PermissionUtils = {
  /**
   * Vérifier si un utilisateur peut effectuer une action
   */
  canPerformAction: (
    userRole: Role | null,
    requiredPermissions: Array<keyof RolePermissions>,
    hasPermissionFn: (permission: keyof RolePermissions) => boolean
  ): boolean => {
    if (!userRole) return false;
    return requiredPermissions.every((permission) =>
      hasPermissionFn(permission)
    );
  },

  /**
   * Obtenir les permissions manquantes pour une action
   */
  getMissingPermissions: (
    requiredPermissions: Array<keyof RolePermissions>,
    hasPermissionFn: (permission: keyof RolePermissions) => boolean
  ): Array<keyof RolePermissions> => {
    return requiredPermissions.filter(
      (permission) => !hasPermissionFn(permission)
    );
  },

  /**
   * Créer un message d'erreur de permission
   */
  createPermissionErrorMessage: (
    missingPermissions: Array<keyof RolePermissions>
  ): string => {
    if (missingPermissions.length === 0) return "";

    if (missingPermissions.length === 1) {
      return `Permission requise : ${missingPermissions[0]}`;
    }

    return `Permissions requises : ${missingPermissions.join(", ")}`;
  },
};

/**
 * Hook pour la gestion des erreurs de route
 */
export const useRouteErrorHandler = () => {
  const handleRouteError = (error: Error, routePath: string): void => {
    console.error(`Erreur sur la route ${routePath}:`, error);

    // Ici vous pourriez intégrer un service de logging
    // LoggingService.logError('ROUTE_ERROR', { error, routePath });
  };

  const handlePermissionDenied = (
    requiredPermissions: Array<keyof RolePermissions>,
    currentRoute: string
  ): void => {
    const message =
      PermissionUtils.createPermissionErrorMessage(requiredPermissions);
    console.warn(`Accès refusé à ${currentRoute}: ${message}`);

    // Ici vous pourriez afficher une notification
    // NotificationService.showWarning(message);
  };

  return {
    handleRouteError,
    handlePermissionDenied,
  };
};

/**
 * Export par défaut d'un objet contenant tous les utilitaires
 */
export default {
  getDashboardPath,
  useRouteAccess,
  withAuth,
  useConditionalNavigation,
  useBreadcrumbs,
  PermissionUtils,
  useRouteErrorHandler,
};
