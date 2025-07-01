// src/components/insurance/SearchFilters.tsx - Filtres de recherche pour l'assurance
import React, { useState, useEffect } from "react";
import { Filter, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import type {
  InsuranceSearchFilters,
  InsurancePlanType,
  InsurancePlanCategory,
  InsuranceSortOption,
} from "../../types/insurance.types";
import {
  SENEGAL_REGIONS,
  PLAN_TYPES_LABELS,
  PLAN_CATEGORIES_LABELS,
} from "../../types/insurance.types";

interface SearchFiltersProps {
  filters: InsuranceSearchFilters;
  onFiltersChange: (filters: InsuranceSearchFilters) => void;
  onReset: () => void;
  resultsCount?: number;
  isLoading?: boolean;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  isCollapsible = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 ${
          isCollapsible ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        {isCollapsible &&
          (isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ))}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  resultsCount = 0,
  isLoading = false,
}) => {
  // États locaux pour les filtres
  const [localFilters, setLocalFilters] =
    useState<InsuranceSearchFilters>(filters);

  // Synchroniser avec les props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Appliquer les filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFiltersChange]);

  // Mettre à jour un filtre
  const updateFilter = <K extends keyof InsuranceSearchFilters>(
    key: K,
    value: InsuranceSearchFilters[K]
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Gérer les checkboxes pour les arrays
  const handleArrayFilter = (
    key: keyof InsuranceSearchFilters,
    value: string,
    currentArray: string[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilter(
      key,
      newArray.length > 0
        ? (newArray as InsuranceSearchFilters[typeof key])
        : undefined
    );
  };

  // Réinitialiser les filtres
  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  // Compter les filtres actifs
  const activeFiltersCount = Object.values(localFilters).filter(
    (value) =>
      value !== undefined &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
  ).length;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          )}
        </CardTitle>
        {resultsCount > 0 && (
          <p className="text-sm text-gray-600">
            {isLoading
              ? "Recherche..."
              : `${resultsCount} résultat${resultsCount > 1 ? "s" : ""}`}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Localisation */}
        <FilterSection title="Localisation" defaultExpanded={true}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <select
                value={localFilters.region || ""}
                onChange={(e) =>
                  updateFilter("region", e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Toutes les régions</option>
                {SENEGAL_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <Input
                type="text"
                value={localFilters.city || ""}
                onChange={(e) =>
                  updateFilter("city", e.target.value || undefined)
                }
                placeholder="Ex: Dakar, Thiès..."
              />
            </div>
          </div>
        </FilterSection>

        {/* Type de plan */}
        <FilterSection title="Type de plan">
          <div className="space-y-2">
            {(Object.keys(PLAN_TYPES_LABELS) as InsurancePlanType[]).map(
              (type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.planType?.includes(type) || false}
                    onChange={() =>
                      handleArrayFilter("planType", type, localFilters.planType)
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {PLAN_TYPES_LABELS[type]}
                  </span>
                </label>
              )
            )}
          </div>
        </FilterSection>

        {/* Catégorie de plan */}
        <FilterSection title="Catégorie">
          <div className="space-y-2">
            {(
              Object.keys(PLAN_CATEGORIES_LABELS) as InsurancePlanCategory[]
            ).map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    localFilters.planCategory?.includes(category) || false
                  }
                  onChange={() =>
                    handleArrayFilter(
                      "planCategory",
                      category,
                      localFilters.planCategory
                    )
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {PLAN_CATEGORIES_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Prix */}
        <FilterSection title="Prix mensuel (FCFA)">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix minimum
              </label>
              <Input
                type="number"
                value={localFilters.minPremium || ""}
                onChange={(e) =>
                  updateFilter(
                    "minPremium",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex: 15000"
                min="0"
                step="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix maximum
              </label>
              <Input
                type="number"
                value={localFilters.maxPremium || ""}
                onChange={(e) =>
                  updateFilter(
                    "maxPremium",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex: 100000"
                min="0"
                step="5000"
              />
            </div>
          </div>
        </FilterSection>

        {/* Couverture */}
        <FilterSection title="Couverture">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de remboursement minimum (%)
              </label>
              <select
                value={localFilters.minCoveragePercentage || ""}
                onChange={(e) =>
                  updateFilter(
                    "minCoveragePercentage",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous</option>
                <option value="50">50% et plus</option>
                <option value="70">70% et plus</option>
                <option value="80">80% et plus</option>
                <option value="90">90% et plus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plafond de couverture minimum (FCFA)
              </label>
              <select
                value={localFilters.minCoverage || ""}
                onChange={(e) =>
                  updateFilter(
                    "minCoverage",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous</option>
                <option value="1000000">1M FCFA et plus</option>
                <option value="5000000">5M FCFA et plus</option>
                <option value="10000000">10M FCFA et plus</option>
                <option value="20000000">20M FCFA et plus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Franchise maximum (FCFA)
              </label>
              <Input
                type="number"
                value={localFilters.maxDeductible || ""}
                onChange={(e) =>
                  updateFilter(
                    "maxDeductible",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex: 50000"
                min="0"
                step="10000"
              />
            </div>
          </div>
        </FilterSection>

        {/* Note des compagnies */}
        <FilterSection title="Qualité">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note minimum des compagnies
            </label>
            <select
              value={localFilters.minRating || ""}
              onChange={(e) =>
                updateFilter(
                  "minRating",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes</option>
              <option value="3">3 étoiles et plus</option>
              <option value="4">4 étoiles et plus</option>
              <option value="4.5">4.5 étoiles et plus</option>
            </select>
          </div>
        </FilterSection>

        {/* Tri */}
        <FilterSection title="Tri des résultats" defaultExpanded={false}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                value={localFilters.sortBy || ""}
                onChange={(e) =>
                  updateFilter(
                    "sortBy",
                    (e.target.value as InsuranceSortOption) || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pertinence</option>
                <option value="premium">Prix</option>
                <option value="coverage">Plafond de couverture</option>
                <option value="coveragePercentage">
                  Taux de remboursement
                </option>
                <option value="rating">Note de la compagnie</option>
                <option value="name">Nom alphabétique</option>
              </select>
            </div>

            {localFilters.sortBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre
                </label>
                <select
                  value={localFilters.sortOrder || "asc"}
                  onChange={(e) =>
                    updateFilter("sortOrder", e.target.value as "asc" | "desc")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            )}
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
