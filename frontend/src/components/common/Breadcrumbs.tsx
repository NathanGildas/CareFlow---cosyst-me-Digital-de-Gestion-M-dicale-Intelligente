// src/components/common/Breadcrumbs.tsx - Composant fil d'ariane
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = "" }) => {
  const location = useLocation();
  const { user } = useAuthState();

  // Mapping des segments vers les labels
  const segmentLabels: Record<string, string> = {
    // Rôles
    patient: "Patient",
    doctor: "Médecin",
    insurer: "Assureur",
    admin: "Administration",

    // Pages communes
    dashboard: "Tableau de bord",
    profile: "Profil",
    settings: "Paramètres",

    // Modules Patient
    appointments: "Rendez-vous",
    doctors: "Médecins",
    insurance: "Assurance",
    "medical-history": "Historique médical",

    // Modules Médecin
    patients: "Patients",
    schedule: "Planning",
    consultations: "Consultations",

    // Modules Assureur
    subscriptions: "Souscriptions",
    policies: "Polices",
    claims: "Remboursements",
    analytics: "Statistiques",

    // Modules Admin
    establishments: "Établissements",
    users: "Utilisateurs",
    reports: "Rapports",

    // Pages spécifiques
    search: "Rechercher",
    details: "Détails",
    edit: "Modifier",
    create: "Créer",
    compare: "Comparer",
    quote: "Devis",
  };

  // Générer les breadcrumbs à partir de l'URL
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Toujours commencer par l'accueil
    breadcrumbs.push({
      label: "Accueil",
      path: "/",
    });

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Ne pas inclure les ID dans les breadcrumbs (segments uniquement numériques)
      if (/^[a-f0-9-]+$/i.test(segment) && segment.length > 10) {
        return;
      }

      const label =
        segmentLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      const isActive = index === segments.length - 1;

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive,
      });
    });

    return breadcrumbs;
  };

  // Obtenir le dashboard par défaut selon le rôle
  const getDashboardPath = (): string => {
    if (!user) return "/";

    switch (user.role) {
      case "PATIENT":
        return "/patient";
      case "DOCTOR":
        return "/doctor";
      case "INSURER":
        return "/insurer";
      case "ADMIN":
        return "/admin";
      default:
        return "/";
    }
  };

  const breadcrumbs = generateBreadcrumbs();

  // Ne pas afficher les breadcrumbs sur la page d'accueil
  if (location.pathname === "/" || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}

            {breadcrumb.isActive ? (
              // Élément actif (non cliquable)
              <span className="flex items-center font-medium text-gray-900">
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {breadcrumb.label}
              </span>
            ) : (
              // Élément cliquable
              <Link
                to={
                  breadcrumb.path === "/Accueil"
                    ? getDashboardPath()
                    : breadcrumb.path
                }
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
