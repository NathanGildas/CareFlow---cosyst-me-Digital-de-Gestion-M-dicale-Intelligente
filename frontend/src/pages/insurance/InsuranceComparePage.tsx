// src/pages/insurance/InsuranceComparePage.tsx - Page de comparaison des plans d'assurance
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Plus,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
  Mail,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import PlanComparator from "../../components/insurance/PlanComparator";
import InsuranceService from "../../services/insurance.service";
import type { InsurancePlan } from "../../types/insurance.types";

const InsuranceComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les plans à comparer depuis l'URL
  useEffect(() => {
    const loadPlans = async () => {
      const planIds = searchParams.get("plans")?.split(",") || [];

      if (planIds.length === 0) {
        setError("Aucun plan sélectionné pour la comparaison");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const plansData = await Promise.all(
          planIds.map((id) => InsuranceService.getPlanById(id))
        );

        // Filtrer les plans valides
        const validPlans = plansData.filter((plan) => plan !== null);
        setPlans(validPlans);

        if (validPlans.length === 0) {
          setError("Aucun plan valide trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement plans:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [searchParams]);

  // Retirer un plan de la comparaison
  const handleRemovePlan = (planId: string) => {
    const remainingPlans = plans.filter((plan) => plan.id !== planId);
    setPlans(remainingPlans);

    // Mettre à jour l'URL
    if (remainingPlans.length > 0) {
      const newPlanIds = remainingPlans.map((p) => p.id).join(",");
      navigate(`/patient/insurance/compare?plans=${newPlanIds}`, {
        replace: true,
      });
    } else {
      navigate("/patient/insurance", { replace: true });
    }
  };

  // Sélectionner un plan pour demander un devis
  const handleSelectPlan = (planId: string) => {
    navigate(`/patient/insurance/quote?planId=${planId}`);
  };

  // Demander un devis pour un plan
  const handleRequestQuote = (planId: string) => {
    navigate(`/patient/insurance/quote?planId=${planId}`);
  };

  // Partager la comparaison
  const handleShare = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Comparaison de plans d'assurance",
        text: "Comparez ces plans d'assurance santé",
        url: currentUrl,
      });
    } else {
      // Fallback - copier l'URL
      navigator.clipboard.writeText(currentUrl);
      // Vous pourriez ajouter une notification ici
    }
  };

  // Exporter la comparaison (simulé)
  const handleExport = () => {
    // Ici vous pourriez générer un PDF ou Excel
    console.log("Export de la comparaison...");
    // Pour l'instant, nous allons juste ouvrir la fenêtre d'impression
    window.print();
  };

  // Envoyer par email (simulé)
  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      "Comparaison de plans d'assurance santé"
    );
    const body = encodeURIComponent(
      `Voici une comparaison de ${plans.length} plans d'assurance santé au Sénégal.\n\n` +
        plans
          .map(
            (p) =>
              `• ${p.name} (${
                p.company?.name
              }) - ${p.monthlyPremium.toLocaleString()} FCFA/mois`
          )
          .join("\n") +
        `\n\nLien vers la comparaison: ${window.location.href}`
    );

    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Calculer les statistiques de la comparaison
  const comparisonStats = React.useMemo(() => {
    if (plans.length === 0) return null;

    const prices = plans.map((p) => p.monthlyPremium);
    const coveragePercentages = plans.map((p) => p.coveragePercentage);
    const maxCoverages = plans.map((p) => p.maxCoverage);

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      maxCoveragePercentage: Math.max(...coveragePercentages),
      maxCoverageAmount: Math.max(...maxCoverages),
      priceDifference: Math.max(...prices) - Math.min(...prices),
    };
  }, [plans]);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            onClick={() => navigate("/patient/insurance")}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la recherche</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erreur de comparaison
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête avec navigation et actions */}
      <div className="flex items-center justify-between">
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

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary-600" />
              Comparaison de Plans
            </h1>
            <p className="text-gray-600 mt-1">
              Comparez {plans.length} plan{plans.length > 1 ? "s" : ""}{" "}
              d'assurance santé côte à côte
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager</span>
          </Button>

          <Button
            onClick={handleEmailShare}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {comparisonStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Aperçu de la comparaison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {comparisonStats.minPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Prix min. (FCFA/mois)
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparisonStats.maxPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Prix max. (FCFA/mois)
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {comparisonStats.avgPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Prix moyen (FCFA/mois)
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {comparisonStats.maxCoveragePercentage}%
                </div>
                <div className="text-sm text-gray-600">
                  Meilleur remboursement
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(comparisonStats.maxCoverageAmount / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Plafond max. (FCFA)</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {comparisonStats.priceDifference.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Écart de prix (FCFA)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message d'information si moins de 2 plans */}
      {plans.length < 2 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Comparaison limitée</h3>
                <p className="text-sm mt-1">
                  Pour une comparaison optimale, ajoutez au moins 2 plans.
                  <button
                    onClick={() => navigate("/patient/insurance")}
                    className="text-primary-600 hover:text-primary-700 ml-1 underline"
                  >
                    Rechercher plus de plans
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Composant de comparaison principal */}
      {plans.length > 0 && (
        <PlanComparator
          plans={plans}
          onRemovePlan={handleRemovePlan}
          onSelectPlan={handleSelectPlan}
          onRequestQuote={handleRequestQuote}
          showActions={true}
        />
      )}

      {/* Section pour ajouter plus de plans */}
      {plans.length < 4 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ajouter plus de plans
              </h3>
              <p className="text-gray-600 mb-4">
                Vous pouvez comparer jusqu'à 4 plans simultanément pour faire le
                meilleur choix.
              </p>
              <Button
                onClick={() => navigate("/patient/insurance")}
                variant="outline"
                className="flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Rechercher d'autres plans</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conseils pour choisir */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils pour bien choisir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Analysez vos besoins
                </h4>
                <p className="text-gray-600 mt-1">
                  Évaluez vos dépenses de santé actuelles et vos besoins futurs
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Comparez les réseaux
                </h4>
                <p className="text-gray-600 mt-1">
                  Vérifiez que vos médecins préférés acceptent l'assurance
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Lisez les exclusions
                </h4>
                <p className="text-gray-600 mt-1">
                  Attention aux conditions non couvertes par chaque plan
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Calculez le coût total
                </h4>
                <p className="text-gray-600 mt-1">
                  Prime + franchise + quote-part pour estimer le vrai coût
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Vérifiez la réputation
                </h4>
                <p className="text-gray-600 mt-1">
                  Consultez les avis et la stabilité financière de l'assureur
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Demandez des devis
                </h4>
                <p className="text-gray-600 mt-1">
                  Obtenez des devis personnalisés pour confirmer les prix
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call-to-action final */}
      {plans.length > 0 && (
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Prêt à faire votre choix ?
            </h3>
            <p className="text-primary-700 mb-4">
              Demandez un devis personnalisé pour le plan qui vous convient le
              mieux
            </p>
            <div className="flex items-center justify-center space-x-4">
              {plans.slice(0, 2).map((plan) => (
                <Button
                  key={plan.id}
                  onClick={() => handleRequestQuote(plan.id)}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Devis {plan.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsuranceComparePage;
