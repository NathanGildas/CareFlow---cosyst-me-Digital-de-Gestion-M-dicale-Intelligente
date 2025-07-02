// src/pages/insurance/InsuranceDetailsPage.tsx - Page détails d'une compagnie d'assurance
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  Building,
  TrendingUp,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import CardFooter from "../../components/ui/Card";
import InsuranceService from "../../services/insurance.service";
import type {
  InsuranceCompany,
  InsurancePlan,
} from "../../types/insurance.types";

interface DetailsSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  title,
  icon: Icon,
  children,
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Icon className="w-5 h-5" />
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

interface PlanCardProps {
  plan: InsurancePlan;
  onSelectPlan: (planId: string) => void;
  onComparePlan: (planId: string) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSelectPlan,
  onComparePlan,
  isSelected = false,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "BASIC":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "STANDARD":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PREMIUM":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "VIP":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      BASIC: "Basique",
      STANDARD: "Standard",
      PREMIUM: "Premium",
      VIP: "VIP",
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Card className={`relative ${isSelected ? "ring-2 ring-primary-500" : ""}`}>
      <CardContent className="p-6">
        {/* Badge catégorie */}
        <div className="absolute -top-3 left-6">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
              plan.category
            )}`}
          >
            {getCategoryLabel(plan.category)}
          </span>
        </div>

        {/* En-tête du plan */}
        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {plan.description}
          </p>
        </div>

        {/* Prix principal */}
        <div className="text-center py-4 border-t border-b border-gray-200 my-4">
          <div className="text-3xl font-bold text-primary-600">
            {plan.monthlyPremium.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-gray-600">par mois</div>
          <div className="text-xs text-gray-500 mt-1">
            {(plan.monthlyPremium * 12).toLocaleString()} FCFA/an
          </div>
        </div>

        {/* Caractéristiques principales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Remboursement</span>
            <span className="font-semibold text-green-600">
              {plan.coveragePercentage}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plafond</span>
            <span className="font-semibold">
              {(plan.maxCoverage / 1000000).toFixed(1)}M FCFA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Franchise</span>
            <span className="font-semibold">
              {plan.deductible.toLocaleString()} FCFA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Délai de carence</span>
            <span className="font-semibold">{plan.waitingPeriod} jours</span>
          </div>
        </div>

        {/* Avantages principaux */}
        {plan.benefits && plan.benefits.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Avantages inclus
            </h4>
            <ul className="space-y-1">
              {plan.benefits.slice(0, 3).map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
              {plan.benefits.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{plan.benefits.length - 3} autres avantages
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50 space-y-2">
        <Button
          onClick={() => onSelectPlan(plan.id)}
          variant="primary"
          className="w-full"
        >
          Demander un devis
        </Button>
        <Button
          onClick={() => onComparePlan(plan.id)}
          variant="outline"
          className="w-full"
        >
          {isSelected
            ? "Retirer de la comparaison"
            : "Ajouter à la comparaison"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const InsuranceDetailsPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<InsuranceCompany | null>(null);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "reviews">(
    "overview"
  );

  // Charger les données de la compagnie
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyId) return;

      try {
        setIsLoading(true);
        const [companyData, plansData] = await Promise.all([
          InsuranceService.getCompanyById(companyId),
          InsuranceService.getPlansByCompany(companyId),
        ]);

        setCompany(companyData);
        setPlans(plansData);
      } catch (err) {
        console.error("Erreur chargement données:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  // Gérer la sélection de plans pour comparaison
  const handleComparePlan = (planId: string) => {
    setSelectedPlans(
      (prev) =>
        prev.includes(planId)
          ? prev.filter((id) => id !== planId)
          : [...prev, planId].slice(0, 4) // Max 4 plans
    );
  };

  // Aller à la page de devis
  const handleSelectPlan = (planId: string) => {
    navigate(`/patient/insurance/quote?planId=${planId}`);
  };

  // Aller à la comparaison
  const handleComparePlans = () => {
    if (selectedPlans.length >= 2) {
      navigate(`/patient/insurance/compare?plans=${selectedPlans.join(",")}`);
    }
  };

  // Calculer l'ancienneté
  const yearsInBusiness = company
    ? new Date().getFullYear() - company.foundedYear
    : 0;

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error || !company) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Compagnie non trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                "Cette compagnie d'assurance n'existe pas ou n'est plus disponible."}
            </p>
            <Button
              onClick={() => navigate("/patient/insurance")}
              variant="outline"
            >
              Retour à la recherche
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Bouton retour */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Button>

        {selectedPlans.length >= 2 && (
          <Button
            onClick={handleComparePlans}
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>Comparer {selectedPlans.length} plans</span>
          </Button>
        )}
      </div>

      {/* En-tête de la compagnie */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`Logo ${company.name}`}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-12 h-12 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {company.name}
                  </h1>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      company.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {company.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Note et avis */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 ml-1">
                      {company.rating}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({company.reviewsCount} avis)
                    </span>
                  </div>

                  {yearsInBusiness > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{yearsInBusiness} ans d'expérience</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{company.description}</p>

                {/* Contact rapide */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>
                      {company.city}, {company.region}
                    </span>
                  </div>

                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{company.phone}</span>
                  </a>

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      <span>Site web</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favoris
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: Building },
            { id: "plans", label: `Plans (${plans.length})`, icon: Shield },
            { id: "reviews", label: "Avis", icon: MessageCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "overview" | "plans" | "reviews")
              }
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <DetailsSection title="Informations de contact" icon={Phone}>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">{company.address}</div>
                    <div className="text-gray-600">
                      {company.city}, {company.region}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <a
                    href={`tel:${company.phone}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {company.phone}
                  </a>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {company.email}
                  </a>
                </div>

                {company.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      {company.website}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </DetailsSection>

            <DetailsSection title="Informations légales" icon={Award}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de licence</span>
                  <span className="font-medium">{company.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Année de fondation</span>
                  <span className="font-medium">{company.foundedYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Années d'expérience</span>
                  <span className="font-medium">{yearsInBusiness} ans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <span
                    className={
                      company.isActive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {company.isActive ? "Agréé et actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </DetailsSection>
          </div>

          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Statistiques</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {plans.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Plans disponibles
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {company.rating}
                    </div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {company.reviewsCount}
                    </div>
                    <div className="text-sm text-gray-600">Avis clients</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="primary" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler maintenant
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat en ligne
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div>
          {plans.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Plans d'assurance disponibles
                </h2>
                <p className="text-gray-600">
                  {plans.length} plan{plans.length > 1 ? "s" : ""} proposé
                  {plans.length > 1 ? "s" : ""} par {company.name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelectPlan={handleSelectPlan}
                    onComparePlan={handleComparePlan}
                    isSelected={selectedPlans.includes(plan.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun plan disponible
                </h3>
                <p className="text-gray-600">
                  Cette compagnie n'a pas encore publié de plans d'assurance.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Avis clients
            </h3>
            <p className="text-gray-600 mb-4">
              La section des avis clients sera bientôt disponible.
            </p>
            <Button variant="outline">Laisser un avis</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsuranceDetailsPage;
