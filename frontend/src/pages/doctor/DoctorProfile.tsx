import React, { useState, useEffect } from "react";
import { Camera, Edit2, Save, X, User, Mail, Phone, MapPin, Calendar, Award, Clock, Star, Building2, AlertCircle } from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/common/Loading";

interface DoctorProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialtyId: string;
  specialtyName: string;
  licenseNumber: string;
  yearsOfExperience: number;
  establishmentId: string;
  establishmentName: string;
  consultationFee: number;
  biography: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  languages: string[];
  availability: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
  stats: {
    totalPatients: number;
    totalConsultations: number;
    averageRating: number;
    responseTime: string;
  };
}

const DoctorProfile: React.FC = () => {
  const { user, updateProfile } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<DoctorProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<DoctorProfileData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const daysOfWeek = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      // TODO: Remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: DoctorProfileData = {
        id: user?.id || "1",
        firstName: user?.firstName || "Amadou",
        lastName: user?.lastName || "Ba",
        email: user?.email || "dr.amadou.ba@careflow.sn",
        phone: "+221 77 456 78 90",
        specialtyId: "cardio-001",
        specialtyName: "Cardiologie",
        licenseNumber: "SN-MED-2020-1234",
        yearsOfExperience: 12,
        establishmentId: "hopital-001",
        establishmentName: "Hôpital Principal de Dakar",
        consultationFee: 40000,
        biography: "Cardiologue expérimenté avec plus de 12 ans d'expérience dans le traitement des maladies cardiovasculaires. Spécialisé dans l'échographie cardiaque et l'électrophysiologie.",
        education: [
          {
            degree: "Doctorat en Médecine",
            institution: "Université Cheikh Anta Diop de Dakar",
            year: "2010"
          },
          {
            degree: "Spécialisation en Cardiologie",
            institution: "CHU Fann, Dakar",
            year: "2014"
          }
        ],
        certifications: [
          {
            name: "Certification en Échographie Cardiaque",
            issuer: "Société Européenne de Cardiologie",
            year: "2015"
          },
          {
            name: "Formation en Électrophysiologie",
            issuer: "American Heart Association",
            year: "2018"
          }
        ],
        languages: ["Français", "Wolof", "Anglais"],
        availability: {
          monday: { start: "08:00", end: "17:00", isAvailable: true },
          tuesday: { start: "08:00", end: "17:00", isAvailable: true },
          wednesday: { start: "08:00", end: "17:00", isAvailable: true },
          thursday: { start: "08:00", end: "17:00", isAvailable: true },
          friday: { start: "08:00", end: "17:00", isAvailable: true },
          saturday: { start: "08:00", end: "12:00", isAvailable: true },
          sunday: { start: "", end: "", isAvailable: false }
        },
        stats: {
          totalPatients: 1250,
          totalConsultations: 3420,
          averageRating: 4.8,
          responseTime: "< 30 min"
        }
      };
      
      setProfileData(mockProfile);
      setFormData(mockProfile);
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...((prev.availability as any)?.[day] || {}),
          [field]: value
        }
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
    if (!formData.licenseNumber?.trim()) {
      newErrors.licenseNumber = "Le numéro de licence est requis";
    }
    if (!formData.consultationFee || formData.consultationFee <= 0) {
      newErrors.consultationFee = "Le tarif de consultation est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await updateProfile({
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        phone: formData.phone!
      });

      setProfileData(formData as DoctorProfileData);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white text-green-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Dr. {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-green-100 mt-1">{profileData.specialtyName}</p>
            <div className="flex items-center mt-2 text-green-100">
              <Building2 className="w-4 h-4 mr-2" />
              <span>{profileData.establishmentName}</span>
            </div>
            <div className="flex items-center mt-1 text-green-100">
              <Award className="w-4 h-4 mr-2" />
              <span>{profileData.yearsOfExperience} ans d'expérience</span>
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profileData.stats.totalPatients}</div>
            <p className="text-sm text-gray-600">Patients suivis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{profileData.stats.totalConsultations}</div>
            <p className="text-sm text-gray-600">Consultations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl font-bold text-yellow-600">{profileData.stats.averageRating}</span>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{profileData.stats.responseTime}</div>
            <p className="text-sm text-gray-600">Temps de réponse</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
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
                  label="Numéro de licence"
                  value={formData.licenseNumber || ""}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  disabled={!isEditing}
                  error={errors.licenseNumber}
                  leftIcon={<Award className="w-4 h-4" />}
                />
                <Input
                  label="Tarif consultation (FCFA)"
                  type="number"
                  value={formData.consultationFee?.toString() || ""}
                  onChange={(e) => handleInputChange("consultationFee", parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  error={errors.consultationFee}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                <textarea
                  value={formData.biography || ""}
                  onChange={(e) => handleInputChange("biography", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Décrivez votre parcours et vos spécialisations..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Disponibilités */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Horaires de consultation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4">
                    <div className="w-20">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.availability?.[key as keyof typeof formData.availability]?.isAvailable || false}
                        onChange={(e) => handleAvailabilityChange(key, "isAvailable", e.target.checked)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      {formData.availability?.[key as keyof typeof formData.availability]?.isAvailable && (
                        <>
                          <input
                            type="time"
                            value={formData.availability?.[key as keyof typeof formData.availability]?.start || ""}
                            onChange={(e) => handleAvailabilityChange(key, "start", e.target.value)}
                            disabled={!isEditing}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 disabled:bg-gray-50"
                          />
                          <span className="text-gray-500">à</span>
                          <input
                            type="time"
                            value={formData.availability?.[key as keyof typeof formData.availability]?.end || ""}
                            onChange={(e) => handleAvailabilityChange(key, "end", e.target.value)}
                            disabled={!isEditing}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 disabled:bg-gray-50"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Formation */}
          <Card>
            <CardHeader>
              <CardTitle>Formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-green-200 pl-3">
                  <p className="font-medium text-gray-900">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.certifications.map((cert, index) => (
                <div key={index} className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-900">{cert.name}</p>
                  <p className="text-sm text-green-700">{cert.issuer}</p>
                  <p className="text-xs text-green-600">{cert.year}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Langues */}
          <Card>
            <CardHeader>
              <CardTitle>Langues parlées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((language, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {language}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;