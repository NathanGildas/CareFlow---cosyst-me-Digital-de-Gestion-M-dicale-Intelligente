// src/pages/patient/AppointmentsPage.tsx - Gestion des rendez-vous patient
import React, { useState, useEffect } from "react";
//import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  //Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  //Phone,
  Video,
  RefreshCw,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, {
  //CardHeader,
  //CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

// Types pour les rendez-vous
interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  establishmentName: string;
  date: string;
  time: string;
  duration: number;
  type: "CONSULTATION" | "TELECONSULTATION" | "FOLLOWUP" | "EMERGENCY";
  status: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  reason: string;
  address: string;
  consultationFee: number;
  canCancel: boolean;
  canReschedule: boolean;
}

interface AppointmentFilters {
  status: string;
  dateRange: string;
  specialty: string;
  search: string;
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();

  // États
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: "all",
    dateRange: "all",
    specialty: "all",
    search: "",
  });

  // Charger les rendez-vous (données simulées pour commencer)
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);

      // TODO: Remplacer par appel API réel
      // const response = await appointmentsService.getPatientAppointments(user.id);

      // Données simulées réalistes
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          doctorName: "Dr. Fatou Sarr",
          doctorSpecialty: "Médecine Générale",
          establishmentName: "Clinique Pasteur",
          date: "2025-07-15",
          time: "09:00",
          duration: 30,
          type: "CONSULTATION",
          status: "CONFIRMED",
          reason: "Consultation de routine",
          address: "Avenue Pasteur, Dakar",
          consultationFee: 25000,
          canCancel: true,
          canReschedule: true,
        },
        {
          id: "2",
          doctorName: "Dr. Amadou Ba",
          doctorSpecialty: "Cardiologie",
          establishmentName: "Hôpital Principal",
          date: "2025-07-20",
          time: "14:30",
          duration: 45,
          type: "CONSULTATION",
          status: "SCHEDULED",
          reason: "Contrôle cardiaque",
          address: "Plateau, Dakar",
          consultationFee: 40000,
          canCancel: true,
          canReschedule: true,
        },
        {
          id: "3",
          doctorName: "Dr. Aïssatou Diop",
          doctorSpecialty: "Pédiatrie",
          establishmentName: "Centre Médical Mermoz",
          date: "2025-07-10",
          time: "11:00",
          duration: 30,
          type: "CONSULTATION",
          status: "COMPLETED",
          reason: "Vaccination enfant",
          address: "Mermoz, Dakar",
          consultationFee: 30000,
          canCancel: false,
          canReschedule: false,
        },
        {
          id: "4",
          doctorName: "Dr. Omar Ndiaye",
          doctorSpecialty: "Dermatologie",
          establishmentName: "Clinique Suma",
          date: "2025-07-05",
          time: "16:00",
          duration: 30,
          type: "TELECONSULTATION",
          status: "CANCELLED",
          reason: "Problème de peau",
          address: "Téléconsultation",
          consultationFee: 20000,
          canCancel: false,
          canReschedule: false,
        },
      ];

      setTimeout(() => {
        setAppointments(mockAppointments);
        setIsLoading(false);
      }, 1000);
    };

    loadAppointments();
  }, [user?.id]);

  // Fonctions utilitaires
  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "SCHEDULED":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case "NO_SHOW":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "SCHEDULED":
        return "Programmé";
      case "CANCELLED":
        return "Annulé";
      case "COMPLETED":
        return "Terminé";
      case "NO_SHOW":
        return "Absent";
      default:
        return "Inconnu";
    }
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50 border-green-200";
      case "SCHEDULED":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      case "COMPLETED":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "NO_SHOW":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: Appointment["type"]) => {
    switch (type) {
      case "TELECONSULTATION":
        return <Video className="w-4 h-4" />;
      case "EMERGENCY":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter((appointment) => {
    // Filtre par statut
    if (filters.status !== "all" && appointment.status !== filters.status) {
      return false;
    }

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        appointment.doctorName.toLowerCase().includes(searchLower) ||
        appointment.doctorSpecialty.toLowerCase().includes(searchLower) ||
        appointment.establishmentName.toLowerCase().includes(searchLower) ||
        appointment.reason.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Actions sur les rendez-vous
  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      // TODO: Appel API pour annuler
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: "CANCELLED" as const,
                canCancel: false,
                canReschedule: false,
              }
            : apt
        )
      );
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // TODO: Naviguer vers page de reprogrammation
    navigate(`/patient/appointments/${appointmentId}/reschedule`);
  };

  const handleViewDetails = (appointmentId: string) => {
    navigate(`/patient/appointments/${appointmentId}`);
  };

  const handleBookNewAppointment = () => {
    navigate("/patient/doctors");
  };

  // Statistiques rapides
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(
      (a) => a.status === "SCHEDULED" || a.status === "CONFIRMED"
    ).length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos consultations médicales
          </p>
        </div>
        <Button
          onClick={handleBookNewAppointment}
          className="flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Prendre RDV</span>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.upcoming}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annulés</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher un médecin, spécialité..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="SCHEDULED">Programmés</option>
              <option value="CONFIRMED">Confirmés</option>
              <option value="COMPLETED">Terminés</option>
              <option value="CANCELLED">Annulés</option>
            </select>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Plus de filtres</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Chargement de vos rendez-vous...</p>
          </CardContent>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rendez-vous trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== "all"
                ? "Essayez de modifier vos filtres"
                : "Vous n'avez pas encore de rendez-vous programmés"}
            </p>
            <Button onClick={handleBookNewAppointment}>
              Prendre votre premier rendez-vous
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.doctorName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.doctorSpecialty}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {appointment.time} ({appointment.duration} min)
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getTypeIcon(appointment.type)}
                        <span>
                          {appointment.type === "TELECONSULTATION"
                            ? "Téléconsultation"
                            : appointment.establishmentName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.address}</span>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Motif :</span>{" "}
                      <span className="text-gray-600">
                        {appointment.reason}
                      </span>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Tarif :</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {appointment.consultationFee.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(appointment.id)}
                    >
                      Détails
                    </Button>

                    {appointment.canReschedule && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRescheduleAppointment(appointment.id)
                        }
                      >
                        Reprogrammer
                      </Button>
                    )}

                    {appointment.canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Annuler
                      </Button>
                    )}

                    {appointment.type === "TELECONSULTATION" &&
                      appointment.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Rejoindre</span>
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
