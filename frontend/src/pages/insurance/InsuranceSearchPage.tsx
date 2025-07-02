// src/pages/insurance/InsuranceSearchPage.tsx - Page principale de recherche d'assureurs (CORRIGÉE)
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import SearchFilters from "../../components/insurance/SearchFilters";
import CompanyCard from "../../components/insurance/CompanyCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card, { CardContent } from "../../components/ui/Card";
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
  initialized: boolean; // 🎯 AJOUT: Pour éviter les recherches multiples
}

const InsuranceSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 🎯 REFS pour éviter les boucles infinies
  const initialLoadRef = useRef(false);
  const lastFiltersRef = useRef<string>("");

  // États de la recherche
  const [searchState, setSearchState] = useState<SearchState>({
    results: null,
    isLoading: false,
    error: null,
    selectedPlans: [],
    initialized: false,
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

  // 🎯 FONCTION DE RECHERCHE OPTIMISÉE (sans useCallback pour éviter les dépendances)
  const performSearch = async (
    filters: InsuranceSearchFilters = {},
    page: number = 1,
    skipDuplicateCheck: boolean = false
  ) => {
    // 🎯 PRÉVENTION: Éviter les requêtes en doublon
    const filtersString = JSON.stringify({ filters, page });
    if (!skipDuplicateCheck && filtersString === lastFiltersRef.current) {
      console.log("🔄 Recherche ignorée - identique à la précédente");
      return;
    }
    lastFiltersRef.current = filtersString;

    console.log("🔍 Début recherche avec filtres:", filters, "page:", page);

    setSearchState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const searchResults = await InsuranceService.searchPlans(
        filters,
        page,
        20
      );

      console.log("✅ Recherche réussie:", searchResults);

      setSearchState((prev) => ({
        ...prev,
        results: searchResults,
        isLoading: false,
        initialized: true,
      }));

      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Erreur de recherche:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la recherche d'assurance";

      setSearchState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        initialized: true,
        results: null, // 🎯 IMPORTANT: Vider les résultats en cas d'erreur
      }));
    }
  };

  // 🎯 INITIALISATION DEPUIS URL (une seule fois)
  useEffect(() => {
    if (initialLoadRef.current) return; // 🎯 Empêcher les exécutions multiples
    initialLoadRef.current = true;

    console.log("🚀 Initialisation de la page de recherche");

    // Récupérer les filtres depuis l'URL
    const urlFilters: InsuranceSearchFilters = {};
    const region = searchParams.get("region");
    const city = searchParams.get("city");
    const planType = searchParams.get("planType");
    const category = searchParams.get("category");
    const companyId = searchParams.get("companyId");

    if (region) urlFilters.region = region;
    if (city) urlFilters.city = city;
    if (planType) urlFilters.planType = [planType as InsurancePlanType];
    if (category) urlFilters.planCategory = [category as InsurancePlanCategory];
    if (companyId) urlFilters.companyIds = [companyId];

    console.log("🔗 Filtres depuis URL:", urlFilters);

    // Appliquer les filtres et effectuer la recherche
    setCurrentFilters(urlFilters);

    // 🎯 Recherche initiale avec timeout pour laisser React finir l'initialisation
    setTimeout(() => {
      performSearch(urlFilters, 1, true);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 🎯 DÉPENDANCES VIDES pour une seule exécution

  // 🎯 METTRE À JOUR L'URL (debounced)
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

      setSearchParams(params, { replace: true }); // 🎯 replace: true pour éviter l'historique
    },
    [setSearchParams]
  );

  // 🎯 GÉRER LES CHANGEMENTS DE FILTRES (debounced)
  const handleFiltersChange = useCallback(
    (newFilters: InsuranceSearchFilters) => {
      console.log("🔧 Changement de filtres:", newFilters);

      setCurrentFilters(newFilters);
      updateUrlParams(newFilters);

      // 🎯 Debounce pour éviter trop de requêtes
      setTimeout(() => {
        performSearch(newFilters, 1);
      }, 300);
    },
    [updateUrlParams]
  );

  // 🎯 RÉINITIALISER LES FILTRES
  const handleFiltersReset = useCallback(() => {
    console.log("🔄 Réinitialisation des filtres");

    const emptyFilters: InsuranceSearchFilters = {};
    setCurrentFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);

    setTimeout(() => {
      performSearch(emptyFilters, 1);
    }, 100);
  }, [setSearchParams]);

  // 🎯 RECHERCHE PAR MOT-CLÉ
  const handleSearch = useCallback(() => {
    console.log("🔍 Recherche par mot-clé:", searchQuery);

    // Pour l'instant, on relance juste la recherche avec les filtres actuels
    // Dans une version future, on pourrait ajouter le searchQuery aux filtres
    performSearch(currentFilters, 1);
  }, [currentFilters, searchQuery]);

  // 🎯 NAVIGATION VERS DÉTAILS COMPAGNIE
  const handleViewCompanyDetails = useCallback(
    (companyId: string) => {
      navigate(`/patient/insurance/details/${companyId}`);
    },
    [navigate]
  );

  // 🎯 NAVIGATION VERS PLANS COMPAGNIE
  const handleViewCompanyPlans = useCallback(
    (companyId: string) => {
      const newFilters = { ...currentFilters, companyIds: [companyId] };
      setCurrentFilters(newFilters);
      updateUrlParams(newFilters);
      performSearch(newFilters, 1);
    },
    [currentFilters, updateUrlParams]
  );

  // 🎯 GESTION SÉLECTION PLANS (pour comparaison future)
  // const handleTogglePlanSelection = useCallback((planId: string) => {
  //   setSearchState((prev) => ({
  //     ...prev,
  //     selectedPlans: prev.selectedPlans.includes(planId)
  //       ? prev.selectedPlans.filter((id) => id !== planId)
  //       : [...prev.selectedPlans, planId].slice(0, 4), // Max 4 plans
  //   }));
  // }, []);

  // 🎯 ALLER À LA COMPARAISON
  const handleComparePlans = useCallback(() => {
    if (searchState.selectedPlans.length >= 2) {
      const planIds = searchState.selectedPlans.join(",");
      navigate(`/patient/insurance/compare?plans=${planIds}`);
    }
  }, [searchState.selectedPlans, navigate]);

  // 🎯 PAGINATION
  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("📄 Changement de page:", newPage);
      performSearch(currentFilters, newPage);
    },
    [currentFilters]
  );

  // 🎯 RETRY EN CAS D'ERREUR
  const handleRetry = useCallback(() => {
    console.log("🔄 Nouvelle tentative");
    performSearch(currentFilters, currentPage, true);
  }, [currentFilters, currentPage]);

  // 🎯 GROUPER LES RÉSULTATS (mémorisé)
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
      {/* 🎯 EN-TÊTE DE LA PAGE */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-primary-600" />
                Recherche d'Assurance Santé
              </h1>
              <p className="text-gray-600 mt-1">
                Trouvez la meilleure assurance santé au Sénégal
              </p>
            </div>

            {/* 🎯 BARRE DE RECHERCHE */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Rechercher une compagnie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64"
                />
                <Button
                  onClick={handleSearch}
                  variant="primary"
                  disabled={searchState.isLoading}
                  className="flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Rechercher</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 🎯 BARRE D'OUTILS */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {/* 🎯 COMPTEUR DE RÉSULTATS */}
              <span className="text-sm text-gray-600">
                {searchState.isLoading
                  ? "Recherche en cours..."
                  : searchState.results
                  ? `${searchState.results.totalResults} résultat${
                      searchState.results.totalResults > 1 ? "s" : ""
                    } trouvé${searchState.results.totalResults > 1 ? "s" : ""}`
                  : "Aucun résultat"}
              </span>

              {/* 🎯 PLANS SÉLECTIONNÉS POUR COMPARAISON */}
              {searchState.selectedPlans.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-primary-600">
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
            </div>

            <div className="flex items-center space-x-4">
              {/* 🎯 TOGGLE FILTRES */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </Button>

              {/* 🎯 MODE D'AFFICHAGE */}
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

      {/* 🎯 CONTENU PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 🎯 FILTRES LATÉRAUX */}
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

        {/* 🎯 ZONE DE RÉSULTATS */}
        <div className={showFilters ? "lg:col-span-9" : "lg:col-span-12"}>
          {/* 🎯 ÉTAT DE CHARGEMENT */}
          {searchState.isLoading && !searchState.initialized && (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-primary-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recherche en cours...
                </h3>
                <p className="text-gray-600">
                  Nous recherchons les meilleures offres d'assurance pour vous
                </p>
              </CardContent>
            </Card>
          )}

          {/* 🎯 GESTION D'ERREUR */}
          {searchState.error && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Erreur de recherche
                </h3>
                <p className="text-gray-600 mb-4">{searchState.error}</p>
                <div className="flex items-center justify-center space-x-4">
                  <Button onClick={handleRetry} variant="primary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                  <Button onClick={handleFiltersReset} variant="outline">
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🎯 RÉSULTATS */}
          {searchState.results && !searchState.isLoading && (
            <>
              {groupedResults.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "space-y-4"
                  }
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
                // 🎯 AUCUN RÉSULTAT
                <Card>
                  <CardContent className="p-12 text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun résultat trouvé
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Essayez de modifier vos critères de recherche ou élargir
                      votre zone géographique
                    </p>
                    <Button onClick={handleFiltersReset} variant="outline">
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 🎯 PAGINATION */}
              {searchState.results.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
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
                      onClick={() => handlePageChange(currentPage + 1)}
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

          {/* 🎯 ÉTAT INITIAL (pas encore initialisé) */}
          {!searchState.initialized &&
            !searchState.isLoading &&
            !searchState.error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Recherche d'Assurance Santé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Utilisez les filtres pour trouver l'assurance qui vous
                    convient
                  </p>
                  <Button
                    onClick={() => performSearch({}, 1, true)}
                    variant="primary"
                  >
                    Voir toutes les assurances
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceSearchPage;
