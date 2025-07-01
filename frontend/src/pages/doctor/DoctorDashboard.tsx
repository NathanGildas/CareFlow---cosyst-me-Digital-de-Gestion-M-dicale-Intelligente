// src/pages/doctor/DoctorDashboard.tsx - Version corrigée
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Plus,
  Activity,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// Types pour les données du dashboard médecin
interface TodayAppointment {
  id: string;
  patientName: string;
  time: string;
  type: "consultation" | "suivi" | "urgence";
  status: "waiting" | "in-progress" | "completed" | "cancelled";
  duration: number;
}

interface PatientSummary {
  totalPatients: number;
  newThisMonth: number;
  todayAppointments: number;
  weeklyConsultations: number;
}

interface Schedule {
  startTime: string;
  endTime: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuthState();
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [patientStats, setPatientStats] = useState<PatientSummary | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Simulation d'un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Données simulées des rendez-vous du jour
      setTodayAppointments([
        {
          id: "1",
          patientName: "Fatou Sarr",
          time: "09:00",
          type: "consultation",
          status: "completed",
          duration: 30,
        },
        {
          id: "2",
          patientName: "Moussa Dieng",
          time: "09:30",
          type: "suivi",
          status: "completed",
          duration: 20,
        },
        {
          id: "3",
          patientName: "Awa Ba",
          time: "10:00",
          type: "consultation",
          status: "in-progress",
          duration: 30,
        },
        {
          id: "4",
          patientName: "Omar Ndiaye",
          time: "10:30",
          type: "urgence",
          status: "waiting",
          duration: 45,
        },
        {
          id: "5",
          patientName: "Khadija Fall",
          time: "11:15",
          type: "consultation",
          status: "waiting",
          duration: 30,
        },
      ]);

      // Statistiques des patients
      setPatientStats({
        totalPatients: 156,
        newThisMonth: 23,
        todayAppointments: 7,
        weeklyConsultations: 42,
      });

      // Planning d'aujourd'hui
      setSchedule({
        startTime: "08:00",
        endTime: "17:00",
        totalSlots: 18,
        bookedSlots: 7,
        availableSlots: 11,
      });

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "suivi":
        return "bg-green-100 text-green-800";
      case "urgence":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentTypeText = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consultation";
      case "suivi":
        return "Suivi";
      case "urgence":
        return "Urgence";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in-progress":
        return "En cours";
      case "waiting":
        return "En attente";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de bienvenue */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour Dr. {user?.lastName} ! 👨‍⚕️
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                - {currentTime}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Nouvelle ordonnance
              </Button>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter patient
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total patients
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patientStats?.totalPatients}
                  </p>
                  <p className="text-xs text-green-600">
                    +{patientStats?.newThisMonth} ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Aujourd'hui
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patientStats?.todayAppointments}
                  </p>
                  <p className="text-xs text-gray-600">consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Cette semaine
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patientStats?.weeklyConsultations}
                  </p>
                  <p className="text-xs text-gray-600">consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Disponibilité
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {schedule?.availableSlots}
                  </p>
                  <p className="text-xs text-gray-600">créneaux libres</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planning du jour */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Planning d'aujourd'hui</span>
                  <Link
                    to="/doctor/schedule"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Voir planning complet
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`border rounded-lg p-4 transition-all ${
                        appointment.status === "in-progress"
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {appointment.patientName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{appointment.time}</span>
                              <span>•</span>
                              <span>{appointment.duration} min</span>
                              <span>•</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${getAppointmentTypeColor(
                                  appointment.type
                                )}`}
                              >
                                {getAppointmentTypeText(appointment.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {getStatusText(appointment.status)}
                          </span>
                          {appointment.status === "waiting" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                            >
                              Commencer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {todayAppointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun rendez-vous aujourd'hui</p>
                      <p className="text-sm mt-1">
                        Profitez de votre journée libre !
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de la journée */}
          <div className="space-y-6">
            {/* Statut du planning */}
            <Card>
              <CardHeader>
                <CardTitle>Statut du planning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Horaires</span>
                    <span className="font-medium">
                      {schedule?.startTime} - {schedule?.endTime}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Créneaux réservés</span>
                      <span>
                        {schedule?.bookedSlots}/{schedule?.totalSlots}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            ((schedule?.bookedSlots || 0) /
                              (schedule?.totalSlots || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {schedule?.availableSlots}
                      </p>
                      <p className="text-xs text-gray-600">Créneaux libres</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {schedule?.bookedSlots}
                      </p>
                      <p className="text-xs text-gray-600">Consultations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link
                    to="/doctor/patients"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Mes patients</span>
                  </Link>

                  <Link
                    to="/doctor/consultations"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Stethoscope className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">
                      Nouvelle consultation
                    </span>
                  </Link>

                  <Link
                    to="/doctor/analytics"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Statistiques</span>
                  </Link>

                  <Link
                    to="/doctor/profile"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <FileText className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium">Mon profil</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
