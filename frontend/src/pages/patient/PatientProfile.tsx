import React, { useState, useEffect } from "react";
import { Camera, Edit2, Save, X, User, Mail, Phone, MapPin, Calendar, Shield, AlertCircle } from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/common/Loading";

interface PatientProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
  };
  insurance: {
    provider: string;
    policyNumber: string;
    validUntil: string;
  };
}

const PatientProfile: React.FC = () => {
  const { user, updateProfile } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<PatientProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfileData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Simulation de chargement des données du profil
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      // TODO: Remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: PatientProfileData = {
        id: user?.id || "1",
        firstName: user?.firstName || "Aminata",
        lastName: user?.lastName || "Diallo",
        email: user?.email || "aminata.diallo@example.com",
        phone: "+221 77 123 45 67",
        dateOfBirth: "1985-03-15",
        address: "Rue 10, Cité Keur Gorgui",
        city: "Dakar",
        postalCode: "12500",
        emergencyContact: {
          name: "Ousmane Diallo",
          phone: "+221 77 987 65 43",
          relationship: "Époux"
        },
        medicalInfo: {
          bloodType: "O+",
          allergies: ["Pénicilline", "Fruits de mer"],
          chronicConditions: ["Hypertension"],
          currentMedications: ["Amlodipine 5mg", "Metformine 1000mg"]
        },
        insurance: {
          provider: "IPRES Santé",
          policyNumber: "IPS-2024-0012345",
          validUntil: "2024-12-31"
        }
      };
      
      setProfileData(mockProfile);
      setFormData(mockProfile);
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur si elle existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...((prev as any)[parent] || {}),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // TODO: Remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mettre à jour le profil dans le contexte auth
      await updateProfile({
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        phone: formData.phone!
      });

      setProfileData(formData as PatientProfileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loading variant="medical" size="lg" text="Chargement du profil..." fullScreen />;
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Erreur de chargement</h3>
          <p className="text-gray-600">Impossible de charger les données du profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-blue-100 mt-1">Patient CareFlow</p>
            <div className="flex items-center mt-2 text-blue-100">
              <Mail className="w-4 h-4 mr-2" />
              <span>{profileData.email}</span>
            </div>
          </div>
          <div className="text-right">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  onClick={handleSave}
                  isLoading={isSaving}
                  variant="secondary"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  error={errors.firstName}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  error={errors.lastName}
                  leftIcon={<User className="w-4 h-4" />}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Téléphone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  error={errors.phone}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date de naissance"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  label="Ville"
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Adresse"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </CardContent>
          </Card>

          {/* Contact d'urgence */}
          <Card>
            <CardHeader>
              <CardTitle>Contact d'urgence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom complet"
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) => handleNestedInputChange("emergencyContact", "name", e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Téléphone"
                  value={formData.emergencyContact?.phone || ""}
                  onChange={(e) => handleNestedInputChange("emergencyContact", "phone", e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
              <Input
                label="Relation"
                value={formData.emergencyContact?.relationship || ""}
                onChange={(e) => handleNestedInputChange("emergencyContact", "relationship", e.target.value)}
                disabled={!isEditing}
                placeholder="Ex: Époux, Parent, Ami..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec informations médicales */}
        <div className="space-y-6">
          {/* Assurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Assurance santé</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Assureur</p>
                <p className="text-gray-900">{profileData.insurance.provider}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Numéro de police</p>
                <p className="text-gray-900 font-mono">{profileData.insurance.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Valide jusqu'au</p>
                <p className="text-gray-900">
                  {new Date(profileData.insurance.validUntil).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations médicales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations médicales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Groupe sanguin</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {profileData.medicalInfo.bloodType}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                <div className="flex flex-wrap gap-1">
                  {profileData.medicalInfo.allergies.map((allergy, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Conditions chroniques</p>
                <div className="flex flex-wrap gap-1">
                  {profileData.medicalInfo.chronicConditions.map((condition, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Médicaments actuels</p>
                <div className="space-y-1">
                  {profileData.medicalInfo.currentMedications.map((medication, index) => (
                    <p key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {medication}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;