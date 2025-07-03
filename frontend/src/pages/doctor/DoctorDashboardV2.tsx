import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  MapPin,
  Phone,
  Eye,
  Edit3,
  BarChart3,
  Info,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

interface AssignedSlot {
  id: string;
  establishmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceCategory: string;
  maxPatients: number;
  currentPatients: number;
  status: 'scheduled' | 'active' | 'completed';
}

interface AssignedAppointment {
  id: string;
  patientName: string;
  patientAge: number;
  appointmentTime: string;
  serviceName: string;
  reason: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'no_show';
  duration: number;
  insuranceCompany?: string;
  isUrgent: boolean;
  establishmentName: string;
}

interface ConsultationHistory {
  id: string;
  patientName: string;
  date: string;
  diagnosis: string;
  establishmentName: string;
  duration: number;
  followUpRequired: boolean;
}

interface DoctorStats {
  todayAppointments: number;
  completedToday: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
  averageDuration: number;
  patientSatisfaction: number;
}

const DoctorDashboardV2: React.FC = () => {
  const { user } = useAuthState();
  const [assignedSlots, setAssignedSlots] = useState<AssignedSlot[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AssignedAppointment[]>([]);
  const [consultationHistory, setConsultationHistory] = useState<ConsultationHistory[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [currentConsultation, setCurrentConsultation] = useState<AssignedAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctorData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créneaux assignés par l'établissement
      setAssignedSlots([
        {
          id: "1",
          establishmentName: "Clinique de la Madeleine",
          date: "2024-12-20",
          startTime: "09:00",
          endTime: "12:00",
          serviceCategory: "Consultation",
          maxPatients: 6,
          currentPatients: 4,
          status: "active"
        },
        {
          id: "2",
          establishmentName: "Clinique de la Madeleine",
          date: "2024-12-20",
          startTime: "14:00",
          endTime: "17:00",
          serviceCategory: "Consultation",
          maxPatients: 6,
          currentPatients: 2,
          status: "scheduled"
        },
        {
          id: "3",
          establishmentName: "Clinique de la Madeleine",
          date: "2024-12-21",
          startTime: "08:00",
          endTime: "12:00",
          serviceCategory: "Consultation",
          maxPatients: 8,
          currentPatients: 0,
          status: "scheduled"
        }
      ]);

      // RDV assignés pour aujourd'hui
      setTodayAppointments([
        {
          id: "1",
          patientName: "Aïssatou Fall",
          patientAge: 37,
          appointmentTime: "09:30",
          serviceName: "Consultation Gynécologie",
          reason: "Suivi de grossesse",
          status: "completed",
          duration: 30,
          insuranceCompany: "IPM",
          isUrgent: false,
          establishmentName: "Clinique de la Madeleine"
        },
        {
          id: "2",
          patientName: "Mariama Diallo",
          patientAge: 29,
          appointmentTime: "10:00",
          serviceName: "Consultation Gynécologie",
          reason: "Consultation prénatale",
          status: "in_progress",
          duration: 30,
          insuranceCompany: "NSIA",
          isUrgent: false,
          establishmentName: "Clinique de la Madeleine"
        },
        {
          id: "3",
          patientName: "Fatou Sarr",
          patientAge: 45,
          appointmentTime: "10:30",
          serviceName: "Consultation Gynécologie",
          reason: "Contrôle annuel",
          status: "waiting",
          duration: 30,
          isUrgent: false,
          establishmentName: "Clinique de la Madeleine"
        },
        {
          id: "4",
          patientName: "Awa Ndiaye",
          patientAge: 33,
          appointmentTime: "11:00",
          serviceName: "Consultation Gynécologie",
          reason: "Planification familiale",
          status: "waiting",
          duration: 30,
          insuranceCompany: "IPM",
          isUrgent: false,
          establishmentName: "Clinique de la Madeleine"
        }
      ]);

      // Historique récent
      setConsultationHistory([
        {
          id: "1",
          patientName: "Aminata Ba",
          date: "2024-12-19",
          diagnosis: "Grossesse normale - 20 SA",
          establishmentName: "Clinique de la Madeleine",
          duration: 25,
          followUpRequired: true
        },
        {
          id: "2",
          patientName: "Coumba Fall",
          date: "2024-12-19",
          diagnosis: "Contrôle post-partum normal",
          establishmentName: "Clinique de la Madeleine",
          duration: 20,
          followUpRequired: false
        },
        {
          id: "3",
          patientName: "Khadija Ndiaye",
          date: "2024-12-18",
          diagnosis: "Consultation contraception",
          establishmentName: "Clinique de la Madeleine",
          duration: 15,
          followUpRequired: true
        }
      ]);

      // Statistiques personnelles
      setStats({
        todayAppointments: 4,
        completedToday: 1,
        thisWeekTotal: 28,
        thisMonthTotal: 125,
        averageDuration: 23,
        patientSatisfaction: 4.8
      });

      // Consultation en cours
      const inProgressAppt = todayAppointments.find(apt => apt.status === 'in_progress');
      if (inProgressAppt) {
        setCurrentConsultation(inProgressAppt);
      }

      setLoading(false);
    };

    loadDoctorData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'no_show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'no_show':
        return 'Absent';
      default:
        return status;
    }
  };

  const startConsultation = (appointmentId: string) => {
    const appointment = todayAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setCurrentConsultation(appointment);
      setTodayAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'in_progress' as const } : apt
        )
      );
    }
  };

  const completeConsultation = (appointmentId: string) => {
    setTodayAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'completed' as const } : apt
      )
    );
    setCurrentConsultation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour Dr. {user?.lastName} ! 👨‍⚕️
            </h1>
            <p className="text-blue-100 mt-1">
              Votre planning est géré par l'établissement
            </p>
            <div className="flex items-center mt-2 text-sm text-blue-200">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Clinique de la Madeleine • Gynécologie-Obstétrique</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Consultation en cours */}
          {currentConsultation && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Activity className="h-5 w-5 mr-2" />
                  Consultation En Cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentConsultation.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentConsultation.patientAge} ans • {currentConsultation.appointmentTime}
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {currentConsultation.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        En cours
                      </span>
                      {currentConsultation.insuranceCompany && (
                        <p className="text-xs text-gray-500 mt-1">
                          {currentConsultation.insuranceCompany}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Dossier Patient
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Notes Consultation
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => completeConsultation(currentConsultation.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Terminer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planning du jour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Mon Planning Aujourd'hui
                </span>
                <div className="text-sm text-gray-600">
                  {stats?.completedToday}/{stats?.todayAppointments} consultations
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center text-blue-800 text-sm">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Planning assigné par l'établissement • 09h00-12h00 & 14h00-17h00</span>
                </div>
              </div>

              <div className="space-y-4">
                {todayAppointments.map(appointment => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          <span className="text-sm text-gray-600">({appointment.patientAge} ans)</span>
                          {appointment.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{appointment.duration} min</span>
                          {appointment.insuranceCompany && (
                            <span>{appointment.insuranceCompany}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{appointment.appointmentTime}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {appointment.status === 'waiting' && (
                        <Button 
                          size="sm" 
                          onClick={() => startConsultation(appointment.id)}
                        >
                          Commencer
                        </Button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeConsultation(appointment.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminer
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Dossier
                      </Button>
                      {appointment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Notes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historique récent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Consultations Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultationHistory.map(consultation => (
                  <div key={consultation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultation.patientName}</h3>
                        <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{new Date(consultation.date).toLocaleDateString('fr-FR')}</p>
                        <p>{consultation.duration} min</p>
                      </div>
                    </div>
                    {consultation.followUpRequired && (
                      <div className="flex items-center text-sm text-orange-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Suivi requis</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistiques personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Mes Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cette semaine</span>
                  <span className="font-semibold">{stats?.thisWeekTotal} consultations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ce mois</span>
                  <span className="font-semibold">{stats?.thisMonthTotal} consultations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée moyenne</span>
                  <span className="font-semibold">{stats?.averageDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Satisfaction</span>
                  <span className="font-semibold flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    {stats?.patientSatisfaction}/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Créneaux assignés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Créneaux Assignés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedSlots.map(slot => (
                  <div key={slot.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('fr-FR')}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.status === 'active' ? 'bg-green-100 text-green-800' :
                        slot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {slot.status === 'active' ? 'Actif' :
                         slot.status === 'scheduled' ? 'Programmé' : 'Terminé'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{slot.startTime} - {slot.endTime}</p>
                      <p>{slot.serviceCategory}</p>
                      <p>{slot.currentPatients}/{slot.maxPatients} patients</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations du médecin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Mon Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Dr. {user?.firstName} {user?.lastName}</h4>
                  <p className="text-gray-600">Gynécologie-Obstétrique</p>
                </div>
                
                <div className="text-gray-600">
                  <p>12 ans d'expérience</p>
                  <p>Ordre des Médecins: OM-156</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span>Établissement principal:</span>
                  </div>
                  <p className="text-sm font-medium">Clinique de la Madeleine</p>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    <span className="text-xs">+221 33 889 94 70</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note importante */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-1">Mode Consultation</h4>
                  <p>Votre planning est géré par l'établissement. Concentrez-vous sur vos consultations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardV2;