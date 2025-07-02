// src/App.tsx - Mise à jour avec les routes du module d'assurance
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuthState } from "./hooks/AuthHooks";

// Composants de layout
import AppLayout from "./components/layout/AppLayout";

// Pages publiques
import HomePage from "./pages/HomePage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";

// Composants de protection
import ProtectedRoute, {
  GuestRoute,
  PatientRoute,
  DoctorRoute,
  InsurerRoute,
  AdminRoute,
} from "./components/auth/ProtectedRoute";

// Pages des dashboards
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import InsurerDashboard from "./pages/insurer/InsurerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";

// Pages du module patient
import AppointmentsPage from "./pages/patient/AppointmentsPage";

// Pages du module d'assurance
import InsuranceSearchPage from "./pages/insurance/InsuranceSearchPage";
import InsuranceDetailsPage from "./pages/insurance/InsuranceDetailsPage";
import InsuranceComparePage from "./pages/insurance/InsuranceComparePage";
import InsuranceQuotePage from "./pages/insurance/InsuranceQuotePage";

// Page non autorisée
const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="mb-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Accès non autorisé
      </h2>
      <p className="text-gray-600 mb-6">
        Vous n'avez pas l'autorisation d'accéder à cette page.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full text-primary-600 hover:text-primary-700 underline"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
);

// Composant de redirection vers le bon dashboard
const DashboardRedirect: React.FC = () => {
  const { user } = useAuthState();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "PATIENT":
      return <Navigate to="/patient" replace />;
    case "DOCTOR":
      return <Navigate to="/doctor" replace />;
    case "INSURER":
      return <Navigate to="/insurer" replace />;
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Pages temporaires pour les autres sections (à développer plus tard)

const DoctorsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">
      Trouver un médecin
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Recherche de médecins...</p>
    </div>
  </div>
);

const MedicalHistoryPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">
      Historique médical
    </h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Historique des consultations...</p>
    </div>
  </div>
);

// Composant générique pour les pages non développées
const GenericPage: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Composant App principal
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Routes d'authentification (guests uniquement) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginForm />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterForm />
              </GuestRoute>
            }
          />

          {/* Redirection dashboard général */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Routes Patient */}
          <Route
            path="/patient/*"
            element={
              <PatientRoute>
                <AppLayout>
                  <Routes>
                    <Route index element={<PatientDashboard />} />
                    <Route path="appointments" element={<AppointmentsPage />} />
                    <Route path="doctors" element={<DoctorsPage />} />

                    {/* 🎯 NOUVELLES ROUTES MODULE ASSURANCE */}
                    <Route path="insurance" element={<InsuranceSearchPage />} />
                    <Route
                      path="insurance/search"
                      element={<InsuranceSearchPage />}
                    />
                    <Route
                      path="insurance/details/:companyId"
                      element={<InsuranceDetailsPage />}
                    />
                    <Route
                      path="insurance/compare"
                      element={<InsuranceComparePage />}
                    />
                    <Route
                      path="insurance/quote"
                      element={<InsuranceQuotePage />}
                    />

                    <Route
                      path="medical-history"
                      element={<MedicalHistoryPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </AppLayout>
              </PatientRoute>
            }
          />

          {/* Routes Médecin */}
          <Route
            path="/doctor/*"
            element={
              <DoctorRoute>
                <AppLayout>
                  <Routes>
                    <Route index element={<DoctorDashboard />} />
                    <Route
                      path="patients"
                      element={
                        <GenericPage
                          title="Mes patients"
                          description="Gestion des patients..."
                        />
                      }
                    />
                    <Route
                      path="schedule"
                      element={
                        <GenericPage
                          title="Mon planning"
                          description="Planning des consultations..."
                        />
                      }
                    />
                    <Route
                      path="consultations"
                      element={
                        <GenericPage
                          title="Consultations"
                          description="Historique des consultations..."
                        />
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <GenericPage
                          title="Statistiques"
                          description="Analytics médicales..."
                        />
                      }
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </AppLayout>
              </DoctorRoute>
            }
          />

          {/* Routes Assureur */}
          <Route
            path="/insurer/*"
            element={
              <InsurerRoute>
                <AppLayout>
                  <Routes>
                    <Route index element={<InsurerDashboard />} />
                    <Route
                      path="subscriptions"
                      element={
                        <GenericPage
                          title="Demandes souscription"
                          description="Gestion des demandes de souscription..."
                        />
                      }
                    />
                    <Route
                      path="policies"
                      element={
                        <GenericPage
                          title="Polices actives"
                          description="Gestion des polices d'assurance..."
                        />
                      }
                    />
                    <Route
                      path="claims"
                      element={
                        <GenericPage
                          title="Remboursements"
                          description="Gestion des remboursements..."
                        />
                      }
                    />
                    <Route
                      path="establishments"
                      element={
                        <GenericPage
                          title="Établissements"
                          description="Réseau d'établissements partenaires..."
                        />
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <GenericPage
                          title="Statistiques"
                          description="Analytics assurance..."
                        />
                      }
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </AppLayout>
              </InsurerRoute>
            }
          />

          {/* Routes Admin */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AppLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route
                      path="users"
                      element={
                        <GenericPage
                          title="Gestion utilisateurs"
                          description="Administration des utilisateurs..."
                        />
                      }
                    />
                    <Route
                      path="establishments"
                      element={
                        <GenericPage
                          title="Gestion établissements"
                          description="Administration des établissements..."
                        />
                      }
                    />
                    <Route
                      path="insurance"
                      element={
                        <GenericPage
                          title="Gestion assurances"
                          description="Administration des assurances..."
                        />
                      }
                    />
                    <Route
                      path="analytics"
                      element={
                        <GenericPage
                          title="Analytics globales"
                          description="Statistiques générales de la plateforme..."
                        />
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <GenericPage
                          title="Paramètres système"
                          description="Configuration de la plateforme..."
                        />
                      }
                    />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </AppLayout>
              </AdminRoute>
            }
          />

          {/* Route catch-all pour 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
