// src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/AuthHooks"; // Import corrigé
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardContent } from "../ui/Card"; // Suppression de CardHeader non utilisé

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  // État du formulaire
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [rememberMe, setRememberMe] = useState(false);

  // Récupération de la page d'origine et du message
  const state = location.state as LocationState;
  const from = state?.from?.pathname || "/";
  const redirectMessage = state?.message;

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Effacer l'erreur générale
    if (error) {
      clearError();
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Redirection selon le rôle
  const getDashboardRoute = (userRole: string): string => {
    switch (userRole) {
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

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe,
      });

      // Redirection vers la page d'origine ou dashboard selon le rôle
      if (from !== "/") {
        navigate(from, { replace: true });
      } else {
        // Récupérer le rôle de l'utilisateur connecté pour rediriger
        const user = JSON.parse(localStorage.getItem("careflow_user") || "{}");
        const dashboardRoute = getDashboardRoute(user.role);
        navigate(dashboardRoute, { replace: true });
      }
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
      console.error("Erreur de connexion:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CareFlow Sénégal
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Connexion à votre compte
          </h2>
          {redirectMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">{redirectMessage}</p>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erreur générale */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                name="email"
                type="email"
                label="Adresse email"
                placeholder="votre.email@example.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                leftIcon={<Mail className="h-5 w-5" />}
                required
                autoComplete="email"
              />

              {/* Mot de passe */}
              <Input
                name="password"
                label="Mot de passe"
                placeholder="Votre mot de passe"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                leftIcon={<Lock className="h-5 w-5" />}
                isPassword
                required
                autoComplete="current-password"
              />

              {/* Se souvenir de moi */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Se souvenir de moi
                </label>
              </div>

              {/* Bouton de connexion */}
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>

              {/* Liens */}
              <div className="text-center space-y-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Inscription */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
