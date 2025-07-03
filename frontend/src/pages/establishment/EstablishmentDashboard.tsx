import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Building,
  Stethoscope,
  Shield,
  MapPin,
  Phone,
  BarChart3,
  FileText,
  Settings,
  Star,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

interface EstablishmentStats {
  totalDoctors: number;
  activeDoctors: number;
  todayAppointments: number;
  pendingAssignments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageWaitTime: number;
  satisfactionScore: number;
}

interface TodayAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  time: string;
  status: 'requested' | 'pending_assignment' | 'confirmed' | 'in_progress' | 'completed';
  doctorName?: string;
  isUrgent: boolean;
  insuranceCompany?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  todayAppointments: number;
  status: 'available' | 'busy' | 'unavailable';
  nextFree: string;
  consultationFee: number;
}

interface PendingAssignment {
  id: string;
  patientName: string;
  serviceName: string;
  requestedDate: string;
  time: string;
  specialty: string;
  isUrgent: boolean;
  insuranceStatus: 'pending' | 'approved' | 'rejected';
}

interface InsuranceAgreement {
  id: string;
  companyName: string;
  agreementNumber: string;
  coverageRate: number;
  directBilling: boolean;
  monthlyVolume: number;
  status: 'active' | 'expiring' | 'expired';
}

const EstablishmentDashboard: React.FC = () => {
  const { user } = useAuthState();
  const [stats, setStats] = useState<EstablishmentStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [insuranceAgreements, setInsuranceAgreements] = useState<InsuranceAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Statistiques de l'établissement
      setStats({
        totalDoctors: 12,
        activeDoctors: 9,
        todayAppointments: 24,
        pendingAssignments: 8,
        monthlyRevenue: 15750000,
        occupancyRate: 78,
        averageWaitTime: 25,
        satisfactionScore: 4.6
      });

      // Rendez-vous du jour
      setTodayAppointments([
        {
          id: "1",
          patientName: "Aïssatou Fall",
          serviceName: "Consultation Gynécologie",
          time: "09:30",
          status: "confirmed",
          doctorName: "Dr. Aminata Sow",
          isUrgent: false,
          insuranceCompany: "IPM"
        },
        {
          id: "2",
          patientName: "Moussa Dieng",
          serviceName: "Consultation Cardiologie",
          time: "10:00",
          status: "in_progress",
          doctorName: "Dr. Mamadou Kane",
          isUrgent: false,
          insuranceCompany: "NSIA"
        },
        {
          id: "3",
          patientName: "Fatou Sarr",
          serviceName: "Urgence",
          time: "10:30",
          status: "pending_assignment",
          isUrgent: true,
          insuranceCompany: "IPM"
        },
        {
          id: "4",
          patientName: "Cheikh Ndiaye",
          serviceName: "Consultation Générale",
          time: "11:00",
          status: "requested",
          isUrgent: false
        }
      ]);

      // Médecins de l'établissement
      setDoctors([
        {
          id: "1",
          name: "Dr. Aminata Sow",
          specialty: "Gynécologie-Obstétrique",
          todayAppointments: 6,
          status: "busy",
          nextFree: "11:30",
          consultationFee: 25000
        },
        {
          id: "2",
          name: "Dr. Mamadou Kane",
          specialty: "Cardiologie",
          todayAppointments: 4,
          status: "busy",
          nextFree: "14:00",
          consultationFee: 40000
        },
        {
          id: "3",
          name: "Dr. Fatou Diallo",
          specialty: "Pédiatrie",
          todayAppointments: 3,
          status: "available",
          nextFree: "Maintenant",
          consultationFee: 20000
        },
        {
          id: "4",
          name: "Dr. Ousmane Fall",
          specialty: "Médecine Générale",
          todayAppointments: 5,
          status: "available",
          nextFree: "Maintenant",
          consultationFee: 15000
        }
      ]);

      // Assignations en attente
      setPendingAssignments([
        {
          id: "1",
          patientName: "Fatou Sarr",
          serviceName: "Urgence",
          requestedDate: "2024-12-20",
          time: "10:30",
          specialty: "Médecine Générale",
          isUrgent: true,
          insuranceStatus: "approved"
        },
        {
          id: "2",
          patientName: "Cheikh Ndiaye",
          serviceName: "Consultation Générale",
          requestedDate: "2024-12-20",
          time: "11:00",
          specialty: "Médecine Générale",
          isUrgent: false,
          insuranceStatus: "pending"
        },
        {
          id: "3",
          patientName: "Mariama Ba",
          serviceName: "Consultation Pédiatrie",
          requestedDate: "2024-12-21",
          time: "09:00",
          specialty: "Pédiatrie",
          isUrgent: false,
          insuranceStatus: "approved"
        }
      ]);

      // Accords d'assurance
      setInsuranceAgreements([
        {
          id: "1",
          companyName: "IPM",
          agreementNumber: "MAD-IPM-2024-001",
          coverageRate: 70,
          directBilling: true,
          monthlyVolume: 450,
          status: "active"
        },
        {
          id: "2",
          companyName: "NSIA",
          agreementNumber: "MAD-NSIA-2024-001",
          coverageRate: 80,
          directBilling: true,
          monthlyVolume: 220,
          status: "active"
        },
        {
          id: "3",
          companyName: "AXA",
          agreementNumber: "MAD-AXA-2024-001",
          coverageRate: 75,
          directBilling: false,
          monthlyVolume: 180,
          status: "expiring"
        }
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-blue-100 text-blue-800';
      case 'pending_assignment':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Demandé';
      case 'pending_assignment':
        return 'À assigner';
      case 'confirmed':
        return 'Confirmé';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getDoctorStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-yellow-600';
      case 'unavailable':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const assignDoctor = (appointmentId: string, doctorId: string) => {
    // Logique d'assignation médecin
    console.log(`Assigning appointment ${appointmentId} to doctor ${doctorId}`);
    // Mettre à jour l'état local
    setTodayAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed' as const, doctorName: doctors.find(d => d.id === doctorId)?.name }
          : apt
      )
    );
    setPendingAssignments(prev => prev.filter(p => p.id !== appointmentId));
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Établissement
                </h1>
                <p className="text-gray-600 mt-1">
                  Clinique de la Madeleine - Gestion centralisée
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau médecin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Médecins</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDoctors}</p>
                  <p className="text-xs text-green-600">{stats?.activeDoctors} actifs</p>
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
                  <h3 className="text-sm font-medium text-gray-500">RDV Aujourd'hui</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats?.todayAppointments}</p>
                  <p className="text-xs text-red-600">{stats?.pendingAssignments} à assigner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Revenus/Mois</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats?.occupancyRate}%</p>
                  <p className="text-xs text-gray-600">Satisfaction {stats?.satisfactionScore}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* RDV en attente d'assignation (PRIORITÉ) */}
            {pendingAssignments.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    À Assigner Immédiatement ({pendingAssignments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssignments.map(assignment => (
                      <div key={assignment.id} className="p-4 bg-white rounded-lg border border-yellow-300">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{assignment.patientName}</h3>
                              {assignment.isUrgent && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{assignment.serviceName}</p>
                            <p className="text-sm text-gray-600">
                              {assignment.time} • Spécialité: {assignment.specialty}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assignment.insuranceStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              assignment.insuranceStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Assurance {assignment.insuranceStatus === 'approved' ? 'OK' : 
                                         assignment.insuranceStatus === 'pending' ? 'En attente' : 'Refusée'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <select 
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            onChange={(e) => assignDoctor(assignment.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Choisir un médecin</option>
                            {doctors
                              .filter(doctor => 
                                assignment.specialty.toLowerCase().includes(doctor.specialty.toLowerCase()) ||
                                doctor.specialty === "Médecine Générale"
                              )
                              .map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                  {doctor.name} - {doctor.specialty} (Libre: {doctor.nextFree})
                                </option>
                              ))
                            }
                          </select>
                          <Button size="sm" variant="outline">
                            Assigner
                          </Button>
                        </div>
                      </div>
                    ))}
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
                    Planning Aujourd'hui
                  </span>
                  <Link to="/establishment/schedule">
                    <Button variant="outline" size="sm">
                      Planning complet
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map(appointment => (
                    <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                            {appointment.isUrgent && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                          {appointment.doctorName && (
                            <p className="text-sm text-blue-600 font-medium">{appointment.doctorName}</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{appointment.time}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          {appointment.insuranceCompany && (
                            <p className="text-xs text-gray-500 mt-1">{appointment.insuranceCompany}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gestion des médecins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Médecins Aujourd'hui
                  </span>
                  <Link to="/establishment/doctors">
                    <Button variant="outline" size="sm">
                      Gérer tout
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctors.map(doctor => (
                    <div key={doctor.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                            <span className={`text-sm font-medium ${getDoctorStatusColor(doctor.status)}`}>
                              ● {doctor.status === 'available' ? 'Disponible' : 
                                  doctor.status === 'busy' ? 'Occupé' : 'Indisponible'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{doctor.todayAppointments} RDV aujourd'hui</span>
                            <span>Libre: {doctor.nextFree}</span>
                            <span>{doctor.consultationFee.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Planning
                          </Button>
                          <Button variant="outline" size="sm">
                            Assigner
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/establishment/appointments/assign" className="block">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Assigner RDV</span>
                    </div>
                  </Link>

                  <Link to="/establishment/doctors/schedule" className="block">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Gérer plannings</span>
                    </div>
                  </Link>

                  <Link to="/establishment/services" className="block">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Settings className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Services & Tarifs</span>
                    </div>
                  </Link>

                  <Link to="/establishment/insurance" className="block">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Shield className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="text-sm font-medium">Assurances</span>
                    </div>
                  </Link>

                  <Link to="/establishment/reports" className="block">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <BarChart3 className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm font-medium">Rapports</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Accords d'assurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Assurances Partenaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insuranceAgreements.map(agreement => (
                    <div key={agreement.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{agreement.companyName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agreement.status === 'active' ? 'bg-green-100 text-green-800' :
                          agreement.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {agreement.status === 'active' ? 'Actif' :
                           agreement.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Couverture: {agreement.coverageRate}%</p>
                        <p>Volume/mois: {agreement.monthlyVolume}</p>
                        {agreement.directBilling && (
                          <p className="text-green-600">✓ Tiers payant</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations établissement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Notre Établissement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">Clinique de la Madeleine</h4>
                    <p className="text-gray-600">Clinique privée • Réseau GGA</p>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>18, Avenue des Jambars, Dakar</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+221 33 889 94 70</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span>Capacité:</span>
                      <span>45 lits</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Services:</span>
                      <span>Maternité, Labo, Imagerie</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentDashboard;