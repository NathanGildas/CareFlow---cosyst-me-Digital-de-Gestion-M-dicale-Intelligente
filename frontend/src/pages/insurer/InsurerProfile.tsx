import React, { useState, useEffect } from "react";
import { Camera, Edit2, Save, X, User, Mail, Phone, MapPin, Building2, Shield, TrendingUp, Users, AlertCircle, FileText } from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/common/Loading";

interface InsurerProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  licenseNumber: string;
  territory: string[];
  address: string;
  city: string;
  website: string;
  description: string;
  services: Array<{
    name: string;
    description: string;
    coverage: string;
  }>;
  partnerships: Array<{
    establishmentName: string;
    type: string;
    since: string;
  }>;
  stats: {
    totalPolicies: number;
    activeClaims: number;
    monthlyRevenue: number;
    customerSatisfaction: number;
    averageClaimTime: string;
  };
  coverageTypes: Array<{
    type: string;
    minCoverage: number;
    maxCoverage: number;
    premium: number;
  }>;
}

const InsurerProfile: React.FC = () => {
  const { user, updateProfile } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<InsurerProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<InsurerProfileData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      // TODO: Remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: InsurerProfileData = {
        id: user?.id || "1",
        firstName: user?.firstName || "Fatou",
        lastName: user?.lastName || "Seck",
        email: user?.email || "fatou.seck@ipres.sn",
        phone: "+221 33 869 50 00",
        position: "Directrice Régionale",
        companyId: "ipres-001",
        companyName: "IPRES Santé",
        licenseNumber: "ASS-SN-2020-001",
        territory: ["Dakar", "Thiès", "Diourbel", "Fatick"],
        address: "Avenue Léopold Sédar Senghor",
        city: "Dakar",
        website: "https://www.ipres.sn",
        description: "IPRES Santé est une institution de prévoyance sociale qui offre une couverture santé complète aux travailleurs du secteur privé au Sénégal. Nous nous engageons à fournir des soins de qualité accessibles à tous nos assurés.",
        services: [
          {
            name: "Assurance Maladie",
            description: "Couverture complète des frais médicaux",
            coverage: "80% - 100%"
          },
          {
            name: "Assurance Maternité",
            description: "Prise en charge grossesse et accouchement",
            coverage: "100%"
          },
          {
            name: "Assurance Invalidité",
            description: "Protection en cas d'invalidité permanente",
            coverage: "60% - 80%"
          },
          {
            name: "Téléconsultation",
            description: "Consultations médicales à distance",
            coverage: "100%"
          }
        ],
        partnerships: [
          {
            establishmentName: "Hôpital Principal de Dakar",
            type: "Partenariat privilégié",
            since: "2018"
          },
          {
            establishmentName: "Clinique Pasteur",
            type: "Tiers payant",
            since: "2019"
          },
          {
            establishmentName: "Centre Médical Suma",
            type: "Réseau de soins",
            since: "2020"
          },
          {
            establishmentName: "Polyclinique Mermoz",
            type: "Tiers payant",
            since: "2021"
          }
        ],
        stats: {
          totalPolicies: 45230,
          activeClaims: 1250,
          monthlyRevenue: 2850000000, // en FCFA
          customerSatisfaction: 4.3,
          averageClaimTime: "3.2 jours"
        },
        coverageTypes: [
          {
            type: "Essentiel",
            minCoverage: 500000,
            maxCoverage: 2000000,
            premium: 25000
          },
          {
            type: "Confort",
            minCoverage: 1000000,
            maxCoverage: 5000000,
            premium: 45000
          },
          {
            type: "Premium",
            minCoverage: 2000000,
            maxCoverage: 10000000,
            premium: 75000
          }
        ]
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
    if (!formData.position?.trim()) {
      newErrors.position = "Le poste est requis";
    }
    if (!formData.licenseNumber?.trim()) {
      newErrors.licenseNumber = "Le numéro de licence est requis";
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

      setProfileData(formData as InsurerProfileData);
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-purple-100 mt-1">{profileData.position}</p>
            <div className="flex items-center mt-2 text-purple-100">
              <Building2 className="w-4 h-4 mr-2" />
              <span>{profileData.companyName}</span>
            </div>
            <div className="flex items-center mt-1 text-purple-100">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{profileData.territory.join(", ")}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profileData.stats.totalPolicies.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Polices actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {profileData.stats.activeClaims.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Demandes en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(profileData.stats.monthlyRevenue / 1000000000).toFixed(1)}Md
            </div>
            <p className="text-sm text-gray-600">CA mensuel (FCFA)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {profileData.stats.customerSatisfaction}/5
            </div>
            <p className="text-sm text-gray-600">Satisfaction client</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {profileData.stats.averageClaimTime}
            </div>
            <p className="text-sm text-gray-600">Délai moyen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
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
                  label="Poste"
                  value={formData.position || ""}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  disabled={!isEditing}
                  error={errors.position}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Numéro de licence"
                  value={formData.licenseNumber || ""}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  disabled={!isEditing}
                  error={errors.licenseNumber}
                  leftIcon={<FileText className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Site web"
                value={formData.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!isEditing}
                placeholder="https://www.example.com"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'entreprise
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="Décrivez votre compagnie d'assurance..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Types de couverture */}
          <Card>
            <CardHeader>
              <CardTitle>Types de couverture proposés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profileData.coverageTypes.map((coverage, index) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">{coverage.type}</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Couverture:</span><br />
                        {formatCurrency(coverage.minCoverage)} - {formatCurrency(coverage.maxCoverage)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Prime mensuelle:</span><br />
                        {formatCurrency(coverage.premium)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services proposés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {service.coverage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Partenariats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Établissements partenaires</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.partnerships.map((partnership, index) => (
                <div key={index} className="border-l-4 border-purple-300 pl-3">
                  <p className="font-medium text-gray-900">{partnership.establishmentName}</p>
                  <p className="text-sm text-purple-600">{partnership.type}</p>
                  <p className="text-xs text-gray-500">Depuis {partnership.since}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Territoire de couverture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Territoire de couverture</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profileData.territory.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{region}</span>
                    <span className="text-green-600 text-sm"> Actif</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">98.5%</div>
                <p className="text-sm text-gray-600">Taux de remboursement</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <p className="text-sm text-gray-600">Délai de réponse moyen</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">15</div>
                <p className="text-sm text-gray-600">Années d'expérience</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsurerProfile;