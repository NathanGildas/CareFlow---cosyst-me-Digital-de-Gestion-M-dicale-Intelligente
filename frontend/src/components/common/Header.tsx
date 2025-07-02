// src/components/common/Header.tsx - Version finale corrigée
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Heart,
} from "lucide-react";
import {
  useAuthState,
  useAuthActions,
  useRoleNavigation,
} from "../../hooks/AuthHooks";

interface HeaderProps {
  onMenuClick?: () => void;
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, displayName, initials, isAuthenticated } = useAuthState();
  const { logout } = useAuthActions();
  const { getDefaultRoute } = useRoleNavigation();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu profil quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Rediriger vers la page de recherche appropriée selon le rôle
      const searchRoute =
        user?.role === "PATIENT"
          ? "/patient/search"
          : user?.role === "DOCTOR"
          ? "/doctor/patients"
          : user?.role === "INSURER"
          ? "/insurer/search"
          : "/admin/search";
      navigate(`${searchRoute}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "PATIENT":
        return "Patient";
      case "DOCTOR":
        return "Médecin";
      case "INSURER":
        return "Assureur";
      case "ADMIN":
        return "Administrateur";
      default:
        return role;
    }
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CareFlow</span>
            </Link>

            {/* Navigation publique */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-900"
              >
                Inscription
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Menu mobile + Logo */}
          <div className="flex items-center space-x-4">
            {/* Bouton menu mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              to={getDefaultRoute()}
              className="flex items-center space-x-2"
            >
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CareFlow</span>
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* Menu profil */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(user?.role || "")}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Menu déroulant profil */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-gray-900/5 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      {getRoleDisplayName(user?.role || "")}
                    </span>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mon profil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Paramètres
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
