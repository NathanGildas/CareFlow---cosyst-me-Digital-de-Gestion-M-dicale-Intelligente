// src/components/auth/ProtectedRoute.tsx
import React from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/AuthHooks";
import type { Role, RolePermissions } from "../../types/auth.types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role[];
  requiredPermission?: keyof RolePermissions;
  fallbackPath?: string;
  requireAuth?: boolean;
  loadingComponent?: ReactNode;
}

// Composant de chargement par défaut
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// Route protégée générique
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermission,
  fallbackPath = "/login",
  requireAuth = true,
  loadingComponent,
}) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const location = useLocation();

  // Affichage du loading pendant la vérification de l'authentification
  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  // Redirection vers login si authentification requise mais utilisateur non connecté
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{
          from: location,
          message: "Vous devez vous connecter pour accéder à cette page.",
        }}
        replace
      />
    );
  }

  // Vérification des rôles requis
  if (requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            from: location,
            message: `Accès refusé. Rôle requis: ${requiredRoles.join(
              " ou "
            )}.`,
          }}
          replace
        />
      );
    }
  }

  // Vérification des permissions spécifiques
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          from: location,
          message: "Vous n'avez pas les permissions nécessaires.",
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Route pour les invités uniquement (non connectés)
export const GuestRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    // Rediriger vers le dashboard selon le rôle
    const getDashboardPath = (role: Role): string => {
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

    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

// Routes spécifiques par rôle
export const PatientRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ProtectedRoute requiredRoles={["PATIENT"]}>{children}</ProtectedRoute>;

export const DoctorRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ProtectedRoute requiredRoles={["DOCTOR"]}>{children}</ProtectedRoute>;

export const InsurerRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ProtectedRoute requiredRoles={["INSURER"]}>{children}</ProtectedRoute>;

export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["ADMIN"]}>{children}</ProtectedRoute>
);

// Route pour les professionnels de santé (médecins + admin)
export const MedicalRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={["DOCTOR", "ADMIN"]}>
    {children}
  </ProtectedRoute>
);

// Route pour les assureurs et admin
export const InsuranceRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={["INSURER", "ADMIN"]}>
    {children}
  </ProtectedRoute>
);

// Route pour admin et certaines permissions
export const AdminOrPermissionRoute: React.FC<{
  children: ReactNode;
  permission: keyof RolePermissions;
}> = ({ children, permission }) => (
  <ProtectedRoute requiredPermission={permission}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
