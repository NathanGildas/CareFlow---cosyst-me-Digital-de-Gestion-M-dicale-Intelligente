// src/components/auth/RegisterForm.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Building,
  Shield,
} from "lucide-react";
import { useAuth } from "../../hooks/AuthHooks";
import type { Role, RegisterData } from "../../types/auth.types";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";

// Interface pour les erreurs de formulaire
interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  licenseNumber?: string;
  specialtyId?: string;
  companyId?: string;
  establishmentId?: string;
  acceptTerms?: string;
}

// Options de rôles disponibles
const ROLE_OPTIONS = [
  {
    value: "PATIENT",
    label: "Patient",
    description: "Je cherche des soins médicaux",
    icon: User,
  },
  {
    value: "DOCTOR",
    label: "Médecin",
    description: "Je suis un professionnel de santé",
    icon: UserPlus,
  },
  {
    value: "INSURER",
    label: "Assureur",
    description: "Je travaille pour une compagnie d'assurance",
    icon: Shield,
  },
];

// Spécialités médicales (simplifiées pour l'exemple)
const MEDICAL_SPECIALTIES = [
  { id: "1", name: "Médecine générale" },
  { id: "2", name: "Cardiologie" },
  { id: "3", name: "Pédiatrie" },
  { id: "4", name: "Gynécologie" },
  { id: "5", name: "Dermatologie" },
  { id: "6", name: "Neurologie" },
  { id: "7", name: "Psychiatrie" },
  { id: "8", name: "Orthopédie" },
];

// Compagnies d'assurance (données réelles sénégalaises)
const INSURANCE_COMPANIES = [
  { id: "1", name: "NSIA Assurances" },
  { id: "2", name: "ASKIA Assurance" },
  { id: "3", name: "AMSA Assurances" },
  { id: "4", name: "AXA Assurances Sénégal" },
  { id: "5", name: "SALAMA Assurances" },
];

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  // État du formulaire multi-étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "PATIENT" as Role,
  });

  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calcul de la force du mot de passe
  useEffect(() => {
    const calculatePasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/\d/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  // Gestion des changements dans le formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (formErrors[name as keyof RegisterFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Effacer l'erreur générale
    if (error) {
      clearError();
    }
  };

  // Gestion du changement de rôle
  const handleRoleChange = (role: Role): void => {
    setFormData((prev) => ({ ...prev, role }));
    if (formErrors.role) {
      setFormErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  // Validation de l'étape 1 (informations personnelles)
  const validateStep1 = (): boolean => {
    const errors: RegisterFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length < 2) {
      errors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est requis";
    } else if (formData.lastName.length < 2) {
      errors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (formData.phone && !/^\+221[0-9]{9}$/.test(formData.phone)) {
      errors.phone = "Format: +221XXXXXXXXX";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation de l'étape 2 (rôle et mot de passe)
  const validateStep2 = (): boolean => {
    const errors: RegisterFormErrors = {};

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (passwordStrength < 75) {
      errors.password = "Le mot de passe doit être plus fort";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirmez votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Validation spécifique selon le rôle
    if (formData.role === "DOCTOR") {
      if (!formData.licenseNumber) {
        errors.licenseNumber = "Le numéro d'ordre est requis pour les médecins";
      }
      if (!formData.specialtyId) {
        errors.specialtyId = "Veuillez sélectionner votre spécialité";
      }
    } else if (formData.role === "INSURER") {
      if (!formData.companyId) {
        errors.companyId = "Veuillez sélectionner votre compagnie d'assurance";
      }
    }

    if (!acceptTerms) {
      errors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation entre les étapes
  const nextStep = (): void => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (currentStep === 1) {
      nextStep();
      return;
    }

    if (!validateStep2()) return;

    try {
      await register(formData);
      navigate("/patient"); // Redirection par défaut, sera ajustée selon le rôle
    } catch (registerError) {
      console.error("Erreur d'inscription:", registerError);
    }
  };

  // Obtenir la couleur de la barre de force du mot de passe
  const getPasswordStrengthColor = (): string => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Obtenir le texte de la force du mot de passe
  const getPasswordStrengthText = (): string => {
    if (passwordStrength < 25) return "Très faible";
    if (passwordStrength < 50) return "Faible";
    if (passwordStrength < 75) return "Moyen";
    return "Fort";
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
            Créer votre compte
          </h2>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 rounded ${
                currentStep >= 2 ? "bg-primary-600" : "bg-gray-200"
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1
                ? "Informations personnelles"
                : "Rôle et sécurité"}
            </CardTitle>
          </CardHeader>

          <CardContent>
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

              {/* Étape 1: Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      label="Prénom"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={formErrors.firstName}
                      leftIcon={<User className="h-5 w-5" />}
                      required
                      autoComplete="given-name"
                    />

                    <Input
                      name="lastName"
                      label="Nom"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={formErrors.lastName}
                      leftIcon={<User className="h-5 w-5" />}
                      required
                      autoComplete="family-name"
                    />
                  </div>

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

                  <Input
                    name="phone"
                    type="tel"
                    label="Téléphone (optionnel)"
                    placeholder="+221701234567"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    error={formErrors.phone}
                    leftIcon={<Phone className="h-5 w-5" />}
                    hint="Format: +221XXXXXXXXX"
                    autoComplete="tel"
                  />
                </div>
              )}

              {/* Étape 2: Rôle et sécurité */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Sélection du rôle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Je suis un(e) <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {ROLE_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <div
                            key={option.value}
                            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                              formData.role === option.value
                                ? "border-primary-600 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              handleRoleChange(option.value as Role)
                            }
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="role"
                                value={option.value}
                                checked={formData.role === option.value}
                                onChange={() =>
                                  handleRoleChange(option.value as Role)
                                }
                                className="sr-only"
                              />
                              <IconComponent className="h-5 w-5 text-primary-600 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {option.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.role}
                      </p>
                    )}
                  </div>

                  {/* Champs spécifiques aux médecins */}
                  {formData.role === "DOCTOR" && (
                    <div className="space-y-4 border-t pt-4">
                      <Input
                        name="licenseNumber"
                        label="Numéro d'ordre"
                        placeholder="Votre numéro d'ordre médical"
                        value={formData.licenseNumber || ""}
                        onChange={handleChange}
                        error={formErrors.licenseNumber}
                        leftIcon={<Building className="h-5 w-5" />}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spécialité <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="specialtyId"
                          value={formData.specialtyId || ""}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        >
                          <option value="">
                            Sélectionnez votre spécialité
                          </option>
                          {MEDICAL_SPECIALTIES.map((specialty) => (
                            <option key={specialty.id} value={specialty.id}>
                              {specialty.name}
                            </option>
                          ))}
                        </select>
                        {formErrors.specialtyId && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.specialtyId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Champs spécifiques aux assureurs */}
                  {formData.role === "INSURER" && (
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compagnie d'assurance{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="companyId"
                        value={formData.companyId || ""}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Sélectionnez votre compagnie</option>
                        {INSURANCE_COMPANIES.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.companyId && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.companyId}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mot de passe */}
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Mot de passe"
                        placeholder="Votre mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                        required
                        autoComplete="new-password"
                      />

                      {/* Barre de force du mot de passe */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Force du mot de passe:
                            </span>
                            <span
                              className={`font-medium ${
                                passwordStrength < 50
                                  ? "text-red-600"
                                  : passwordStrength < 75
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirmer le mot de passe"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={formErrors.confirmPassword}
                      leftIcon={<Lock className="h-5 w-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      }
                      required
                      autoComplete="new-password"
                      showSuccess={
                        !!formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      }
                    />
                  </div>

                  {/* Conditions d'utilisation */}
                  <div className="border-t pt-4">
                    <div className="flex items-start">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        J'accepte les{" "}
                        <Link
                          to="/terms"
                          className="text-primary-600 hover:text-primary-700 underline"
                        >
                          conditions d'utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link
                          to="/privacy"
                          className="text-primary-600 hover:text-primary-700 underline"
                        >
                          politique de confidentialité
                        </Link>
                      </label>
                    </div>
                    {formErrors.acceptTerms && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.acceptTerms}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between space-x-4">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Précédent
                  </Button>
                ) : (
                  <div /> // Spacer
                )}

                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                  rightIcon={
                    currentStep === 1 ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : undefined
                  }
                >
                  {isLoading
                    ? "Création en cours..."
                    : currentStep === 1
                    ? "Suivant"
                    : "Créer mon compte"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lien de connexion */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
