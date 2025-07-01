// src/contexts/index.ts
// Exports centralisés pour l'authentification

// Contexte et Provider
export { AuthContext, AuthProvider } from "./AuthContext";

// Hooks d'authentification
export {
  useAuth,
  usePermissions,
  useRoleNavigation,
  useAuthState,
  useAuthActions,
  usePermissionCheck,
  useRoleRedirect,
} from "../hooks/AuthHooks";

// Types
export type {
  User,
  Role,
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RolePermissions,
  NavItem,
  AuthError,
  AuthErrorCode,
} from "../types/auth.types";

// Services
export { authService } from "../services/auth.service";
