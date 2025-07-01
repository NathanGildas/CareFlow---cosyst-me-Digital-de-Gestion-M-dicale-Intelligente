// src/pages/insurance/InsuranceSearchPage.tsx - Page principale de recherche d'assureurs
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  //MapPin,
  Shield,
  AlertCircle,
  RefreshCw,
  //Zap,
  //TrendingUp,
} from "lucide-react";
import SearchFilters from "../../components/insurance/SearchFilters";
import CompanyCard from "../../components/insurance/CompanyCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, {
  //CardHeader,
  //CardTitle,
  CardContent,
} from "../../components/ui/Card";
import InsuranceService from "../../services/insurance.service";
import type {
  InsuranceCompany,
  InsurancePlan,
  InsuranceSearchFilters,
  InsuranceSearchResults,
  InsurancePlanCategory,
  InsurancePlanType,
} from "../../types/insurance.types";

// Types locaux pour la page
interface ViewMode {
  type: "grid" | "list";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SearchState {
  results: InsuranceSearchResults | null;
  isLoading: boolean;
  error: string | null;
  selectedPlans: string[];
}

const InsuranceSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // États de la recherche
  const [searchState, setSearchState] = useState<SearchState>({
    results: null,
    isLoading: false,
    error: null,
    selectedPlans: [],
  });

  // États de l'interface
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilters, setCurrentFilters] = useState<InsuranceSearchFilters>(
    {}
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Configuration des modes d'affichage
  const viewModes: ViewMode[] = [
    { type: "grid", icon: Grid, label: "Grille" },
    { type: "list", icon: List, label: "Liste" },
  ];

  // Effectuer la recherche
  const performSearch = useCallback(
    async (
      filters: InsuranceSearchFilters = currentFilters,
      page: number = 1
    ) => {
      setSearchState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const searchResults = await InsuranceService.searchPlans(
          filters,
          page,
          20
        );

        setSearchState((prev) => ({
          ...prev,
          results: searchResults,
          isLoading: false,
        }));

        setCurrentPage(page);
      } catch (error) {
        console.error("Erreur de recherche:", error);
        setSearchState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Erreur de recherche",
          isLoading: false,
        }));
      }
    },
    [currentFilters]
  );

  // Initialiser les filtres depuis l'URL
  useEffect(() => {
    const urlFilters: InsuranceSearchFilters = {};

    // Récupérer les paramètres d'URL
    const region = searchParams.get("region");
    const city = searchParams.get("city");
    const planType = searchParams.get("planType");
    const category = searchParams.get("category");

    if (region) urlFilters.region = region;
    if (city) urlFilters.city = city;
    if (planType) urlFilters.planType = [planType as InsurancePlanType];
    if (category) urlFilters.planCategory = [category as InsurancePlanCategory];

    setCurrentFilters(urlFilters);

    // Effectuer la recherche initiale
    if (Object.keys(urlFilters).length > 0) {
      performSearch(urlFilters);
    } else {
      performSearch({});
    }
  }, [performSearch, searchParams]);

  // Mettre à jour l'URL quand les filtres changent
  const updateUrlParams = useCallback(
    (filters: InsuranceSearchFilters) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0)
        ) {
          if (Array.isArray(value)) {
            params.set(key, value[0]); // Prendre le premier élément pour l'URL
          } else {
            params.set(key, value.toString());
          }
        }
      });

      setSearchParams(params);
    },
    [setSearchParams]
  );

  // Gérer les changements de filtres
  const handleFiltersChange = useCallback(
    (newFilters: InsuranceSearchFilters) => {
      setCurrentFilters(newFilters);
      updateUrlParams(newFilters);
      performSearch(newFilters, 1);
    },
    [updateUrlParams, performSearch]
  );

  // Réinitialiser les filtres
  const handleFiltersReset = useCallback(() => {
    const emptyFilters: InsuranceSearchFilters = {};
    setCurrentFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
    performSearch(emptyFilters, 1);
  }, [performSearch, setSearchParams]);

  // Gérer la recherche par mot-clé
  const handleSearch = useCallback(() => {
    const newFilters = { ...currentFilters };
    // La recherche par mot-clé pourrait filtrer par nom de compagnie
    // Pour l'instant on relance juste la recherche
    performSearch(newFilters, 1);
  }, [currentFilters, performSearch]);

  // Naviguer vers les détails d'une compagnie
  const handleViewCompanyDetails = useCallback(
    (companyId: string) => {
      navigate(`/patient/insurance/details/${companyId}`);
    },
    [navigate]
  );

  // Naviguer vers les plans d'une compagnie
  const handleViewCompanyPlans = useCallback(
    (companyId: string) => {
      navigate(`/patient/insurance/search?companyId=${companyId}`);
    },
    [navigate]
  );

  // Ajouter/retirer un plan de la sélection pour comparaison

  //   const handleTogglePlanSelection = useCallback((planId: string) => {
  //     setSearchState((prev) => ({
  //       ...prev,
  //       selectedPlans: prev.selectedPlans.includes(planId)
  //         ? prev.selectedPlans.filter((id) => id !== planId)
  //         : [...prev.selectedPlans, planId].slice(0, 4), // Max 4 plans à comparer
  //     }));
  //   }, []);

  // Aller à la page de comparaison
  const handleComparePlans = useCallback(() => {
    if (searchState.selectedPlans.length >= 2) {
      const planIds = searchState.selectedPlans.join(",");
      navigate(`/patient/insurance/compare?plans=${planIds}`);
    }
  }, [searchState.selectedPlans, navigate]);

  // Grouper les compagnies avec leurs plans
  const groupedResults = React.useMemo(() => {
    if (!searchState.results) return [];

    const companiesMap = new Map<
      string,
      { company: InsuranceCompany; plans: InsurancePlan[] }
    >();

    // Ajouter toutes les compagnies
    searchState.results.companies.forEach((company) => {
      companiesMap.set(company.id, { company, plans: [] });
    });

    // Associer les plans aux compagnies
    searchState.results.plans.forEach((plan) => {
      if (plan.company && companiesMap.has(plan.company.id)) {
        companiesMap.get(plan.company.id)!.plans.push(plan);
      }
    });

    return Array.from(companiesMap.values());
  }, [searchState.results]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Recherche d'Assurance Santé
            </h1>
            <p className="text-primary-100 mt-1">
              Trouvez la meilleure couverture santé au Sénégal
            </p>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="font-semibold">+50</div>
                <div className="text-primary-200">Compagnies</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="font-semibold">+200</div>
                <div className="text-primary-200">Plans</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et contrôles */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher une compagnie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchQuery && (
                  <Button
                    onClick={() => handleSearch()}
                    variant="primary"
                    size="sm"
                    className="absolute right-2 top-2"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Contrôles d'affichage */}
            <div className="flex items-center space-x-4">
              {/* Sélection de plans pour comparaison */}
              {searchState.selectedPlans.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {searchState.selectedPlans.length} plan
                    {searchState.selectedPlans.length > 1 ? "s" : ""}{" "}
                    sélectionné{searchState.selectedPlans.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    onClick={handleComparePlans}
                    disabled={searchState.selectedPlans.length < 2}
                    variant="primary"
                    size="sm"
                  >
                    Comparer
                  </Button>
                </div>
              )}

              {/* Toggle filtres */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </Button>

              {/* Mode d'affichage */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                {viewModes.map((mode) => (
                  <button
                    key={mode.type}
                    onClick={() => setViewMode(mode.type)}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === mode.type
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    title={mode.label}
                  >
                    <mode.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filtres latéraux */}
        {showFilters && (
          <div className="lg:col-span-3">
            <SearchFilters
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
              resultsCount={searchState.results?.totalResults}
              isLoading={searchState.isLoading}
            />
          </div>
        )}

        {/* Résultats */}
        <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
          {/* État de chargement */}
          {searchState.isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Recherche en cours...</p>
              </CardContent>
            </Card>
          )}

          {/* Gestion des erreurs */}
          {searchState.error && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  <div>
                    <h3 className="font-medium">Erreur de recherche</h3>
                    <p className="text-sm mt-1">{searchState.error}</p>
                  </div>
                  <Button
                    onClick={() => performSearch(currentFilters, currentPage)}
                    variant="outline"
                    size="sm"
                  >
                    Réessayer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultats */}
          {!searchState.isLoading &&
            !searchState.error &&
            searchState.results && (
              <>
                {/* En-tête des résultats */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {searchState.results.totalResults} résultat
                      {searchState.results.totalResults > 1 ? "s" : ""} trouvé
                      {searchState.results.totalResults > 1 ? "s" : ""}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {searchState.results.companies.length} compagnie
                      {searchState.results.companies.length > 1
                        ? "s"
                        : ""} • {searchState.results.plans.length} plan
                      {searchState.results.plans.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Liste des résultats */}
                {groupedResults.length > 0 ? (
                  <div
                    className={`space-y-6 ${
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0"
                        : ""
                    }`}
                  >
                    {groupedResults.map(({ company, plans }) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        plansCount={plans.length}
                        onViewDetails={handleViewCompanyDetails}
                        onViewPlans={handleViewCompanyPlans}
                        variant={viewMode === "list" ? "detailed" : "default"}
                      />
                    ))}
                  </div>
                ) : (
                  // Aucun résultat
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun résultat trouvé
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Essayez de modifier vos critères de recherche
                      </p>
                      <Button onClick={handleFiltersReset} variant="outline">
                        Réinitialiser les filtres
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination (si nécessaire) */}
                {searchState.results.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() =>
                          performSearch(currentFilters, currentPage - 1)
                        }
                        disabled={!searchState.results.pagination.hasPrev}
                        variant="outline"
                        size="sm"
                      >
                        Précédent
                      </Button>

                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {searchState.results.pagination.page} sur{" "}
                        {searchState.results.pagination.totalPages}
                      </span>

                      <Button
                        onClick={() =>
                          performSearch(currentFilters, currentPage + 1)
                        }
                        disabled={!searchState.results.pagination.hasNext}
                        variant="outline"
                        size="sm"
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceSearchPage;
