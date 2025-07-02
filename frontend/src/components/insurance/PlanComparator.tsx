// src/components/insurance/PlanComparator.tsx - Comparateur de plans d'assurance
import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Star,
  Shield,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  Info,
} from "lucide-react";
import Button from "../ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import CardFooter from "../ui/Card";
import type { InsurancePlan } from "../../types/insurance.types";

interface PlanComparatorProps {
  plans: InsurancePlan[];
  onRemovePlan?: (planId: string) => void;
  onSelectPlan?: (planId: string) => void;
  onRequestQuote?: (planId: string) => void;
  showActions?: boolean;
}

interface ComparisonSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ComparisonRow[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

interface ComparisonRow {
  label: string;
  values: (string | number | boolean | null)[];
  type: "text" | "currency" | "percentage" | "boolean" | "badge";
  highlight?: boolean;
  tooltip?: string;
}

const PlanComparator: React.FC<PlanComparatorProps> = ({
  plans,
  onRemovePlan,
  onSelectPlan,
  onRequestQuote,
  showActions = true,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Initialiser les sections expandues par défaut
  useEffect(() => {
    setExpandedSections(new Set(["overview", "pricing", "coverage"]));
  }, []);

  // Formater les valeurs selon leur type
  const formatValue = (
    value: string | number | boolean | null,
    type: ComparisonRow["type"]
  ): string => {
    if (value === null || value === undefined) return "Non spécifié";

    switch (type) {
      case "currency":
        return `${Number(value).toLocaleString()} FCFA`;
      case "percentage":
        return `${value}%`;
      case "boolean":
        return value ? "✓" : "✗";
      case "badge":
        return String(value);
      default:
        return String(value);
    }
  };

  // Déterminer si une valeur est avantageuse
  const isAdvantageousValue = (
    value: string | number | boolean | null,
    values: (string | number | boolean | null)[],
    type: ComparisonRow["type"]
  ): boolean => {
    if (value === null || value === undefined) return false;

    switch (type) {
      case "currency": {
        // Pour les prix, plus bas = mieux (sauf pour les plafonds de couverture)
        const numValue = Number(value);
        const numValues = values.map((v) => Number(v)).filter((v) => !isNaN(v));
        return numValue === Math.min(...numValues);
      }

      case "percentage": {
        // Pour les pourcentages de couverture, plus haut = mieux
        const pctValue = Number(value);
        const pctValues = values.map((v) => Number(v)).filter((v) => !isNaN(v));
        return pctValue === Math.max(...pctValues);
      }

      case "boolean":
        // Vrai est toujours mieux
        return Boolean(value);

      default:
        return false;
    }
  };

  // Construire les données de comparaison
  const comparisonData: ComparisonSection[] = [
    {
      id: "overview",
      title: "Vue d'ensemble",
      icon: Shield,
      defaultExpanded: true,
      items: [
        {
          label: "Nom du plan",
          values: plans.map((p) => p.name),
          type: "text",
        },
        {
          label: "Compagnie",
          values: plans.map((p) => p.company?.name || "Non spécifié"),
          type: "text",
        },
        {
          label: "Type",
          values: plans.map((p) => {
            const typeLabels = {
              INDIVIDUAL: "Individuel",
              FAMILY: "Famille",
              GROUP: "Groupe",
              CORPORATE: "Entreprise",
            };
            return typeLabels[p.type] || p.type;
          }),
          type: "badge",
        },
        {
          label: "Catégorie",
          values: plans.map((p) => {
            const categoryLabels = {
              BASIC: "Basique",
              STANDARD: "Standard",
              PREMIUM: "Premium",
              VIP: "VIP",
            };
            return categoryLabels[p.category] || p.category;
          }),
          type: "badge",
        },
        {
          label: "Note compagnie",
          values: plans.map((p) => p.company?.rating || null),
          type: "text",
        },
      ],
    },
    {
      id: "pricing",
      title: "Tarification",
      icon: DollarSign,
      defaultExpanded: true,
      items: [
        {
          label: "Prime mensuelle",
          values: plans.map((p) => p.monthlyPremium),
          type: "currency",
          highlight: true,
        },
        {
          label: "Prime annuelle",
          values: plans.map((p) => p.annualPremium),
          type: "currency",
        },
        {
          label: "Franchise",
          values: plans.map((p) => p.deductible),
          type: "currency",
          tooltip: "Montant restant à votre charge avant remboursement",
        },
        {
          label: "Délai de carence",
          values: plans.map((p) => `${p.waitingPeriod} jours`),
          type: "text",
        },
      ],
    },
    {
      id: "coverage",
      title: "Couverture",
      icon: Award,
      defaultExpanded: true,
      items: [
        {
          label: "Taux de remboursement",
          values: plans.map((p) => p.coveragePercentage),
          type: "percentage",
          highlight: true,
        },
        {
          label: "Plafond de couverture",
          values: plans.map((p) => p.maxCoverage),
          type: "currency",
          highlight: true,
        },
      ],
    },
    {
      id: "benefits",
      title: "Avantages inclus",
      icon: Check,
      isCollapsible: true,
      items: [],
    },
    {
      id: "exclusions",
      title: "Exclusions",
      icon: AlertTriangle,
      isCollapsible: true,
      items: [],
    },
  ];

  // Construire dynamiquement les avantages et exclusions
  const allBenefits = Array.from(
    new Set(plans.flatMap((p) => p.benefits || []))
  );
  const allExclusions = Array.from(
    new Set(plans.flatMap((p) => p.exclusions || []))
  );

  // Ajouter les avantages
  comparisonData.find((s) => s.id === "benefits")!.items = allBenefits.map(
    (benefit) => ({
      label: benefit,
      values: plans.map((p) => p.benefits?.includes(benefit) || false),
      type: "boolean" as const,
    })
  );

  // Ajouter les exclusions
  comparisonData.find((s) => s.id === "exclusions")!.items = allExclusions.map(
    (exclusion) => ({
      label: exclusion,
      values: plans.map((p) => p.exclusions?.includes(exclusion) || false),
      type: "boolean" as const,
    })
  );

  // Gérer l'expansion/collapse des sections
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun plan à comparer
          </h3>
          <p className="text-gray-600">
            Sélectionnez au moins 2 plans pour commencer la comparaison
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec les plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>
              Comparaison de {plans.length} plan{plans.length > 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${plans.length}, 1fr)`,
            }}
          >
            {/* Colonne d'en-tête vide */}
            <div></div>

            {/* En-têtes des plans */}
            {plans.map((plan) => (
              <div key={plan.id} className="relative">
                <Card className="border-2 border-primary-200">
                  <CardContent className="p-4">
                    {/* Bouton de suppression */}
                    {onRemovePlan && (
                      <button
                        onClick={() => onRemovePlan(plan.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Logo et nom de la compagnie */}
                    <div className="text-center mb-3">
                      {plan.company?.logo ? (
                        <img
                          src={plan.company.logo}
                          alt={plan.company.name}
                          className="w-12 h-12 mx-auto rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 mx-auto bg-primary-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 mt-2 text-sm">
                        {plan.company?.name}
                      </h3>
                    </div>

                    {/* Nom du plan */}
                    <h4 className="text-center font-medium text-gray-900 mb-2">
                      {plan.name}
                    </h4>

                    {/* Prix principal */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatValue(plan.monthlyPremium, "currency")}
                      </div>
                      <div className="text-sm text-gray-600">par mois</div>
                    </div>

                    {/* Note de la compagnie */}
                    {plan.company?.rating && (
                      <div className="flex items-center justify-center mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">
                          {plan.company.rating}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  {/* Actions du plan */}
                  {showActions && (
                    <CardFooter className="p-3 bg-gray-50">
                      <div className="w-full space-y-2">
                        {onSelectPlan && (
                          <Button
                            onClick={() => onSelectPlan(plan.id)}
                            variant="primary"
                            size="sm"
                            className="w-full"
                          >
                            Choisir ce plan
                          </Button>
                        )}
                        {onRequestQuote && (
                          <Button
                            onClick={() => onRequestQuote(plan.id)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Demander un devis
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau de comparaison détaillée */}
      <Card>
        <CardContent className="p-0">
          {comparisonData.map((section) => {
            if (section.items.length === 0) return null;

            const isExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                {/* En-tête de section */}
                <button
                  onClick={() =>
                    section.isCollapsible && toggleSection(section.id)
                  }
                  className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 ${
                    section.isCollapsible ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  {section.isCollapsible &&
                    (isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ))}
                </button>

                {/* Contenu de la section */}
                {(!section.isCollapsible || isExpanded) && (
                  <div className="px-6 pb-4">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `200px repeat(${plans.length}, 1fr)`,
                      }}
                    >
                      {section.items.map((item, index) => (
                        <React.Fragment key={index}>
                          {/* Label de la ligne */}
                          <div className="py-3 font-medium text-gray-700 flex items-center">
                            {item.label}
                            {item.tooltip && (
                              <div className="ml-2 group relative">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {item.tooltip}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Valeurs pour chaque plan */}
                          {item.values.map((value, planIndex) => {
                            const isAdvantage = isAdvantageousValue(
                              value,
                              item.values,
                              item.type
                            );

                            return (
                              <div
                                key={planIndex}
                                className={`py-3 text-center ${
                                  item.highlight ? "font-semibold" : ""
                                } ${
                                  isAdvantage
                                    ? "bg-green-50 text-green-800"
                                    : ""
                                }`}
                              >
                                {item.type === "boolean" ? (
                                  <div className="flex justify-center">
                                    {value ? (
                                      <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <X className="w-5 h-5 text-red-600" />
                                    )}
                                  </div>
                                ) : item.type === "badge" ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {formatValue(value, item.type)}
                                  </span>
                                ) : (
                                  <span>{formatValue(value, item.type)}</span>
                                )}

                                {isAdvantage && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Meilleur
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanComparator;
