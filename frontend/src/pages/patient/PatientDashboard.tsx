// src/pages/patient/PatientDashboard.tsx - Dashboard patient amélioré
import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Shield,
  FileText,
  Clock,
  MapPin,
  Phone,
  Plus,
  ArrowRight,
  Activity,
  Heart,
  AlertCircle,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  description,
  to,
  color,
}) => (
  <Link to={to} className="group">
    <Card className="h-full transition-all duration-200 hover:shadow-lg group-hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color,
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <span
                className={`text-sm font-medium ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {trend === "up" ? "+" : trend === "down" ? "-" : ""}
                {trendValue}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PatientDashboard: React.FC = () => {
  const { user } = useAuthState();

  // Actions rapides pour les patients
  const quickActions: QuickActionProps[] = [
    {
      icon: Calendar,
      title: "Prendre un rendez-vous",
      description: "Réserver une consultation",
      to: "/patient/appointments",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      title: "Trouver un médecin",
      description: "Rechercher par spécialité",
      to: "/patient/doctors",
      color: "bg-green-500",
    },
    {
      icon: Shield,
      title: "Mon assurance",
      description: "Gérer ma couverture santé",
      to: "/patient/insurance",
      color: "bg-purple-500",
    },
    {
      icon: FileText,
      title: "Historique médical",
      description: "Consulter mes dossiers",
      to: "/patient/medical-history",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="text-primary-100 mt-1">
              Bienvenue sur votre espace patient CareFlow
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Rendez-vous"
          value={3}
          subtitle="Ce mois-ci"
          trend="up"
          trendValue="2"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Médecins suivis"
          value={2}
          subtitle="Médecins réguliers"
          color="bg-green-500"
        />
        <StatCard
          icon={Shield}
          title="Couverture"
          value="85%"
          subtitle="Taux de remboursement"
          color="bg-purple-500"
        />
        <StatCard
          icon={FileText}
          title="Consultations"
          value={12}
          subtitle="Cette année"
          trend="up"
          trendValue="4"
          color="bg-orange-500"
        />
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prochains rendez-vous */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Prochains rendez-vous</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Exemple de rendez-vous */}
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Dr. Aminata Sow
                        </p>
                        <p className="text-sm text-gray-600">Cardiologie</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Demain</p>
                        <p className="text-sm text-gray-600">14h30</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Hôpital Principal de Dakar</span>
                    </div>
                  </div>
                </div>

                {/* Message si pas de rendez-vous */}
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Aucun autre rendez-vous programmé</p>
                  <Link to="/patient/appointments">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Prendre un rendez-vous
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec infos utiles */}
        <div className="space-y-6">
          {/* Alertes santé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Rappels santé</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Activity className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Bilan annuel recommandé
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Il est temps de programmer votre bilan de santé
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Suivi cardiologique
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Prochain contrôle dans 2 semaines
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact urgence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Urgences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    En cas d'urgence médicale
                  </p>
                  <a
                    href="tel:15"
                    className="inline-flex items-center justify-center w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler le 15 (SAMU)
                  </a>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Pour les urgences non vitales, contactez votre médecin
                    traitant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
