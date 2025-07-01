// src/pages/ProfilePage.tsx - Page profil utilisateur complète
import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  Phone,
  Mail,
  Calendar,
  Shield,
  Save,
  X,
} from "lucide-react";
import { useAuthState, useAuthActions } from "../hooks/AuthHooks";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import CardFooter from "../components/ui/Card";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
}

interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuthState();
  const { updateProfile } = useAuthActions();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Validation des champs
  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit faire au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit faire au moins 2 caractères";
    }

    if (formData.phone && !formData.phone.match(/^\+221[0-9]{9}$/)) {
      newErrors.phone = "Format: +221XXXXXXXXX (9 chiffres après +221)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer les changements de champs
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Effacer le message de succès
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });

      setIsEditing(false);
      setSuccessMessage("Profil mis à jour avec succès !");

      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      setErrors({
        firstName: "Erreur lors de la mise à jour. Veuillez réessayer.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
    setErrors({});
    setIsEditing(false);
    setSuccessMessage("");
  };

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case "PATIENT":
        return "bg-blue-100 text-blue-800";
      case "DOCTOR":
        return "bg-green-100 text-green-800";
      case "INSURER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le label du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "PATIENT":
        return "Patient";
      case "DOCTOR":
        return "Médecin";
      case "INSURER":
        return "Assureur";
      case "ADMIN":
        return "Administrateur";
      default:
        return role;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et votre compte
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Modifier</span>
          </Button>
        )}
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Save className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte principale du profil */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informations personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar et nom */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              {/* Formulaire d'édition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      error={errors.firstName}
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      error={errors.lastName}
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.lastName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900 py-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                    <span className="text-xs text-gray-500">
                      (non modifiable)
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      error={errors.phone}
                      placeholder="+221771234567"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 py-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Actions du formulaire */}
            {isEditing && (
              <CardFooter className="flex items-center justify-end space-x-3 bg-gray-50">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Sidebar avec informations complémentaires */}
        <div className="space-y-6">
          {/* Carte sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Sécurité</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut du compte</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte informations compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Informations compte</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Membre depuis</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Dernière mise à jour
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">ID utilisateur</span>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {user.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
