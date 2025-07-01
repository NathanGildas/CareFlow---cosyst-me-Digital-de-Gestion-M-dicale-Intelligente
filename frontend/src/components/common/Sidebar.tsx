// src/components/common/Sidebar.tsx - Version finale corrigée
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  Stethoscope,
  Shield,
  Search,
  Building,
  CreditCard,
  UserCheck,
  Activity,
  X,
} from "lucide-react";
import { useAuthState, useRoleNavigation } from "../../hooks/AuthHooks";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Map des icônes selon les chemins
const getIconForPath = (path: string) => {
  if (path.includes("home") || path === "") return Home;
  if (path.includes("appointments") || path.includes("schedule"))
    return Calendar;
  if (path.includes("patients") || path.includes("users")) return Users;
  if (path.includes("doctors") || path.includes("consultations"))
    return Stethoscope;
  if (path.includes("insurance") || path.includes("policies")) return Shield;
  if (path.includes("analytics") || path.includes("statistics"))
    return BarChart3;
  if (path.includes("profile")) return UserCheck;
  if (path.includes("medical-history") || path.includes("prescriptions"))
    return FileText;
  if (path.includes("establishments")) return Building;
  if (path.includes("claims") || path.includes("subscriptions"))
    return CreditCard;
  if (path.includes("search")) return Search;
  if (path.includes("settings")) return Settings;
  return Activity; // Icône par défaut
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthState();
  const { getCurrentNavItems } = useRoleNavigation();
  const location = useLocation();

  const navItems = getCurrentNavItems();

  // Fonction pour déterminer si un lien est actif
  const isActiveLink = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Fonction pour obtenir les stats selon le rôle (données simulées)
  const getRoleStats = () => {
    switch (user?.role) {
      case "PATIENT":
        return [
          { label: "Prochains RDV", value: "2", color: "text-blue-600" },
          { label: "Consultations", value: "12", color: "text-green-600" },
        ];
      case "DOCTOR":
        return [
          { label: "Patients aujourd'hui", value: "7", color: "text-blue-600" },
          { label: "RDV en attente", value: "3", color: "text-orange-600" },
        ];
      case "INSURER":
        return [
          { label: "Demandes", value: "15", color: "text-purple-600" },
          { label: "À traiter", value: "8", color: "text-red-600" },
        ];
      case "ADMIN":
        return [
          { label: "Utilisateurs", value: "1.2k", color: "text-blue-600" },
          { label: "Alertes", value: "5", color: "text-red-600" },
        ];
      default:
        return [];
    }
  };

  const stats = getRoleStats();

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Sidebar principale */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0
          w-64 bg-white shadow-lg border-r border-gray-200
          flex flex-col
        `}
      >
        {/* Header sidebar mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Informations utilisateur */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Stats rapides */}
            {stats.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2">
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const IconComponent = getIconForPath(item.path);
              const isActive = isActiveLink(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose} // Fermer sidebar sur mobile après clic
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <IconComponent
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        isActive
                          ? "text-blue-700"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`
                        ml-2 px-2 py-0.5 text-xs rounded-full
                        ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Section d'aide */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Besoin d'aide ?
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Consultez notre guide ou contactez le support.
              </p>
              <Link
                to="/help"
                className="inline-flex items-center text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                Centre d'aide
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            CareFlow Sénégal v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
