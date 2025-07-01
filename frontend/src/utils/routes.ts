// src/utils/routes.ts
// Exports centralisés pour les utilitaires de routes

// Composants de protection des routes
export { default as ProtectedRoute } from "../components/auth/ProtectedRoute";
export {
  GuestRoute,
  PatientRoute,
  DoctorRoute,
  InsurerRoute,
  AdminRoute,
  MedicalRoute,
  InsuranceRoute,
  AdminOrPermissionRoute,
} from "../components/auth/ProtectedRoute";

// Hooks et utilitaires de routes
export {
  getDashboardPath,
  useRouteAccess,
  withAuth,
  useConditionalNavigation,
  useBreadcrumbs,
  PermissionUtils,
  useRouteErrorHandler,
} from "./RouteUtils";
