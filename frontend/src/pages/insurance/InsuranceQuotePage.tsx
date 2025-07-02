// src/pages/insurance/InsuranceQuotePage.tsx - Page de demande de devis d'assurance
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  FileText,
  Download,
  Mail,
  Phone,
  Calendar,
  Award,
  Info,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import CardFooter from "../../components/ui/Card";
import QuoteForm from "../../components/insurance/QuoteForm";
import InsuranceService from "../../services/insurance.service";
import type {
  InsurancePlan,
  QuoteRequest,
  Quote,
} from "../../types/insurance.types";

interface QuoteState {
  isLoading: boolean;
  error: string | null;
  quotes: Quote[];
  isSubmitted: boolean;
}

interface PlanSummaryProps {
  plan: InsurancePlan;
}

const PlanSummary: React.FC<PlanSummaryProps> = ({ plan }) => (
  <Card className="border-primary-200 bg-primary-50">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Logo de la compagnie */}
          <div className="flex-shrink-0">
            {plan.company?.logo ? (
              <img
                src={plan.company.logo}
                alt={plan.company.name}
                className="w-16 h-16 rounded-lg object-cover border border-primary-300"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-200 rounded-lg flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
            )}
          </div>

          {/* Informations du plan */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-900">
              {plan.name}
            </h3>
            <p className="text-primary-700 text-sm mb-2">
              {plan.company?.name}
            </p>
            <p className="text-primary-600 text-sm line-clamp-2">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Prix */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-700">
            {plan.monthlyPremium.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-primary-600">par mois</div>
        </div>
      </div>

      {/* Caractéristiques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-primary-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-primary-800">
            {plan.coveragePercentage}%
          </div>
          <div className="text-xs text-primary-600">Remboursement</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary-800">
            {(plan.maxCoverage / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-primary-600">Plafond (FCFA)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary-800">
            {plan.deductible.toLocaleString()}
          </div>
          <div className="text-xs text-primary-600">Franchise (FCFA)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary-800">
            {plan.waitingPeriod}
          </div>
          <div className="text-xs text-primary-600">Délai (jours)</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface QuoteResultProps {
  quotes: Quote[];
  onAcceptQuote: (quoteId: string) => void;
  onDownloadQuote: (quoteId: string) => void;
  onShareQuote: (quoteId: string) => void;
}

const QuoteResult: React.FC<QuoteResultProps> = ({
  quotes,
  onAcceptQuote,
  onDownloadQuote,
  onShareQuote,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Devis reçu avec succès !
      </h2>
      <p className="text-gray-600">
        Voici {quotes.length} devis personnalisé{quotes.length > 1 ? "s" : ""}{" "}
        pour votre demande.
      </p>
    </div>

    {quotes.map((quote) => (
      <Card key={quote.id} className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>Devis #{quote.id.slice(-8).toUpperCase()}</span>
            </div>
            <span className="text-sm text-gray-500">
              Valide jusqu'au{" "}
              {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations tarifaires */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tarification</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prime mensuelle</span>
                  <span className="font-semibold">
                    {quote.monthlyPremium.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prime annuelle</span>
                  <span className="font-semibold">
                    {quote.annualPremium.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Économie annuelle</span>
                  <span className="font-semibold">
                    {(
                      quote.monthlyPremium * 12 -
                      quote.annualPremium
                    ).toLocaleString()}{" "}
                    FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Détails de couverture */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Couverture</h4>
              <div className="space-y-2">
                {quote.coverageDetails.slice(0, 4).map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{detail.category}</span>
                    <span className="font-medium">
                      {detail.coveragePercentage}%
                    </span>
                  </div>
                ))}
                {quote.coverageDetails.length > 4 && (
                  <div className="text-sm text-gray-500">
                    +{quote.coverageDetails.length - 4} autres garanties
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onDownloadQuote(quote.id)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
            <Button
              onClick={() => onShareQuote(quote.id)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Button>
          </div>

          <Button
            onClick={() => onAcceptQuote(quote.id)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accepter ce devis</span>
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const InsuranceQuotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>({
    isLoading: false,
    error: null,
    quotes: [],
    isSubmitted: false,
  });

  // Charger le plan sélectionné depuis l'URL
  useEffect(() => {
    const loadSelectedPlan = async () => {
      const planId = searchParams.get("planId");
      if (!planId) return;

      try {
        const plan = await InsuranceService.getPlanById(planId);
        setSelectedPlan(plan);
      } catch (err) {
        console.error("Erreur chargement plan:", err);
        setQuoteState((prev) => ({
          ...prev,
          error: "Plan non trouvé",
        }));
      }
    };

    loadSelectedPlan();
  }, [searchParams]);

  // Soumettre la demande de devis
  const handleQuoteSubmit = async (quoteRequest: QuoteRequest) => {
    setQuoteState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Ajouter le plan sélectionné si pas déjà inclus
      if (selectedPlan && !quoteRequest.planIds.includes(selectedPlan.id)) {
        quoteRequest.planIds = [...quoteRequest.planIds, selectedPlan.id];
      }

      const quotes = await InsuranceService.requestQuote(quoteRequest);

      setQuoteState({
        isLoading: false,
        error: null,
        quotes,
        isSubmitted: true,
      });
    } catch (err) {
      console.error("Erreur demande devis:", err);
      setQuoteState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Erreur lors de la demande de devis",
      }));
    }
  };

  // Annuler la demande
  const handleCancel = () => {
    navigate(-1);
  };

  // Accepter un devis
  const handleAcceptQuote = async (quoteId: string) => {
    try {
      const result = await InsuranceService.acceptQuote(quoteId);
      navigate(`/patient/insurance/subscription/${result.subscriptionId}`);
    } catch (err) {
      console.error("Erreur acceptation devis:", err);
      setQuoteState((prev) => ({
        ...prev,
        error: "Erreur lors de l'acceptation du devis",
      }));
    }
  };

  // Télécharger un devis
  const handleDownloadQuote = (quoteId: string) => {
    // Simuler le téléchargement
    console.log(`Téléchargement du devis ${quoteId}`);
    // Ici vous implémenteriez la génération/téléchargement du PDF
  };

  // Partager un devis par email
  const handleShareQuote = (quoteId: string) => {
    const quote = quoteState.quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    const subject = encodeURIComponent("Devis d'assurance santé");
    const body = encodeURIComponent(
      `Voici mon devis d'assurance santé :\n\n` +
        `Plan: ${quote.plan?.name}\n` +
        `Prime mensuelle: ${quote.monthlyPremium.toLocaleString()} FCFA\n` +
        `Prime annuelle: ${quote.annualPremium.toLocaleString()} FCFA\n` +
        `Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString(
          "fr-FR"
        )}\n\n` +
        `Référence: ${quote.id}`
    );

    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête */}
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
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              {quoteState.isSubmitted ? "Votre Devis" : "Demande de Devis"}
            </h1>
            <p className="text-gray-600 mt-1">
              {quoteState.isSubmitted
                ? "Devis personnalisé pour votre assurance santé"
                : "Obtenez un devis personnalisé en quelques minutes"}
            </p>
          </div>
        </div>
      </div>

      {/* Plan sélectionné */}
      {selectedPlan && !quoteState.isSubmitted && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Plan sélectionné
          </h2>
          <PlanSummary plan={selectedPlan} />
        </div>
      )}

      {/* Formulaire ou résultats */}
      {!quoteState.isSubmitted ? (
        <>
          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Informations importantes
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Remplissez tous les champs requis pour obtenir un devis
                      précis
                    </li>
                    <li>
                      • Les prix peuvent varier selon votre âge et votre état de
                      santé
                    </li>
                    <li>• Votre devis sera valable pendant 30 jours</li>
                    <li>• Aucun engagement jusqu'à la signature du contrat</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de devis */}
          <QuoteForm
            selectedPlanIds={selectedPlan ? [selectedPlan.id] : []}
            onSubmit={handleQuoteSubmit}
            onCancel={handleCancel}
            isLoading={quoteState.isLoading}
            error={quoteState.error}
          />
        </>
      ) : (
        /* Résultats du devis */
        <QuoteResult
          quotes={quoteState.quotes}
          onAcceptQuote={handleAcceptQuote}
          onDownloadQuote={handleDownloadQuote}
          onShareQuote={handleShareQuote}
        />
      )}

      {/* Sidebar d'aide */}
      {!quoteState.isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Besoin d'aide ?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Conseiller en ligne
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Un conseiller peut vous aider à choisir le meilleur plan
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler maintenant
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-1">
                  Centre d'aide
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Consultez notre FAQ pour des réponses immédiates
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Voir la FAQ
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-1">Horaires</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Lun - Ven</span>
                    <span>8h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span>9h - 13h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processus suivant */}
      {quoteState.isSubmitted && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Prochaines étapes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Examinez votre devis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Prenez le temps de lire tous les détails et garanties
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Acceptez le devis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cliquez sur "Accepter" pour commencer la souscription
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Finalisation</h4>
                  <p className="text-sm text-gray-600">
                    Fournissez les documents et effectuez le premier paiement
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Activation</h4>
                  <p className="text-sm text-gray-600">
                    Votre couverture commence selon les délais de carence
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsuranceQuotePage;
