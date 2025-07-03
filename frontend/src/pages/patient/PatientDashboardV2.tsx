import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Shield,
  Calendar,
  Heart,
  AlertCircle,
  Building,
  Star,
  Phone,
  CheckCircle,
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  User,
  CreditCard,
  FileText,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

interface PatientInsurance {
  id: string;
  companyName: string;
  planName: string;
  policyNumber: string;
  isPrimary: boolean;
  coveragePercentage: number;
  validUntil: string;
  logo?: string;
}

interface CoveredEstablishment {
  id: string;
  name: string;
  type: string;
  region: string;
  city: string;
  distance: number;
  coverageRate: number;
  hasEmergency: boolean;
  hasMaternity: boolean;
  nextAvailable: string;
  phone: string;
  rating: number;
  ggaNetwork: boolean;
}

interface UpcomingAppointment {
  id: string;
  establishmentName: string;
  serviceName: string;
  doctorName?: string;
  date: string;
  time: string;
  status: string;
  coverageAmount: number;
  patientAmount: number;
}

interface HealthAlert {
  id: string;
  type: 'reminder' | 'insurance' | 'emergency';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
}

const PatientDashboardV2: React.FC = () => {
  const { user } = useAuthState();
  const [insurances, setInsurances] = useState<PatientInsurance[]>([]);
  const [coveredEstablishments, setCoveredEstablishments] = useState<CoveredEstablishment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [favoriteEstablishments, setFavoriteEstablishments] = useState<CoveredEstablishment[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données d'assurance multi-assurance du patient
      setInsurances([
        {
          id: "1",
          companyName: "Institution de Prévoyance Maladie",
          planName: "IPM Salarié",
          policyNumber: "IPM-2024-789456",
          isPrimary: true,
          coveragePercentage: 70,
          validUntil: "2024-12-31"
        },
        {
          id: "2", 
          companyName: "NSIA Assurances Sénégal",
          planName: "NSIA Excellence",
          policyNumber: "NSIA-EXC-2024-456123",
          isPrimary: false,
          coveragePercentage: 80,
          validUntil: "2025-01-01"
        }
      ]);

      // Établissements couverts par les assurances
      setCoveredEstablishments([
        {
          id: "1",
          name: "Clinique de la Madeleine",
          type: "Clinique privée",
          region: "DAKAR",
          city: "Dakar",
          distance: 2.4,
          coverageRate: 80, // Combiné IPM + NSIA
          hasEmergency: false,
          hasMaternity: true,
          nextAvailable: "Aujourd'hui 14h30",
          phone: "+221 33 889 94 70",
          rating: 4.8,
          ggaNetwork: true
        },
        {
          id: "2",
          name: "Clinique Casahous",
          type: "Clinique privée",
          region: "DAKAR", 
          city: "Dakar",
          distance: 5.2,
          coverageRate: 75,
          hasEmergency: true,
          hasMaternity: true,
          nextAvailable: "Demain 09h00",
          phone: "+221 33 864 24 24",
          rating: 4.6,
          ggaNetwork: true
        },
        {
          id: "3",
          name: "CHU Aristide Le Dantec",
          type: "Hôpital public",
          region: "DAKAR",
          city: "Dakar", 
          distance: 8.1,
          coverageRate: 70,
          hasEmergency: true,
          hasMaternity: true,
          nextAvailable: "Lundi 08h00",
          phone: "+221 33 839 50 50",
          rating: 4.2,
          ggaNetwork: false
        }
      ]);

      // Rendez-vous programmés
      setUpcomingAppointments([
        {
          id: "1",
          establishmentName: "Clinique de la Madeleine",
          serviceName: "Consultation Gynécologie",
          doctorName: "Dr. Aminata Sow",
          date: "2024-12-20",
          time: "09:30",
          status: "confirmed",
          coverageAmount: 17500,
          patientAmount: 7500
        }
      ]);

      // Favoris
      setFavoriteEstablishments([
        coveredEstablishments[0], // Clinique Madeleine
        coveredEstablishments[1]  // Clinique Casahous
      ]);

      // Alertes santé
      setHealthAlerts([
        {
          id: "1",
          type: "reminder",
          title: "Suivi de grossesse",
          message: "Prochain contrôle prévu dans 2 semaines",
          priority: "medium",
          date: "2024-12-06"
        },
        {
          id: "2",
          type: "insurance",
          title: "Renouvellement IPM",
          message: "Votre police IPM expire le 31 décembre",
          priority: "high",
          date: "2024-12-01"
        }
      ]);

      setLoading(false);
    };

    loadPatientData();
  }, []);

  const getInsuranceCoverage = (establishmentId: string) => {
    // Calcul de la couverture combinée pour un établissement
    const establishment = coveredEstablishments.find(e => e.id === establishmentId);
    return establishment ? establishment.coverageRate : 0;
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Calendar className="h-5 w-5" />;
      case 'insurance':
        return <Shield className="h-5 w-5" />;
      case 'emergency':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
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
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="text-primary-100 mt-1">
              Votre santé, nos établissements partenaires
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mes Assurances (NOUVEAU - pas recherche) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Mes Assurances Santé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insurances.map(insurance => (
                  <div key={insurance.id} className={`p-4 rounded-lg border-2 ${
                    insurance.isPrimary ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          insurance.isPrimary ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          <Shield className={`h-5 w-5 ${
                            insurance.isPrimary ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{insurance.companyName}</h3>
                          <p className="text-sm text-gray-600">{insurance.planName}</p>
                          {insurance.isPrimary && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Principale
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{insurance.coveragePercentage}%</p>
                        <p className="text-sm text-gray-600">de couverture</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Police: {insurance.policyNumber}</span>
                      <span>Valide jusqu'au {new Date(insurance.validUntil).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
                
                <Link to="/patient/insurance/details">
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Voir établissements couverts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Prochains rendez-vous */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Mes Rendez-vous
                </span>
                <Link to="/patient/appointments">
                  <Button variant="outline" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.establishmentName}</h3>
                          <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                          {appointment.doctorName && (
                            <p className="text-sm text-blue-600 font-medium">{appointment.doctorName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmé
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600 font-medium">
                            Couvert: {appointment.coverageAmount.toLocaleString()} FCFA
                          </p>
                          <p className="text-gray-600">
                            Reste: {appointment.patientAmount.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucun rendez-vous programmé</p>
                  <Link to="/patient/establishments">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Prendre rendez-vous
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Établissements recommandés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Établissements Recommandés
                </span>
                <Link to="/patient/establishments">
                  <Button variant="outline" size="sm">
                    Voir tous
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coveredEstablishments.slice(0, 2).map(establishment => (
                  <div key={establishment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{establishment.name}</h3>
                          {establishment.ggaNetwork && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              GGA
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{establishment.type} • {establishment.city}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{establishment.distance} km</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                            <span>{establishment.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-blue-600">{establishment.nextAvailable}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          {establishment.hasEmergency && (
                            <span className="flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Urgences
                            </span>
                          )}
                          {establishment.hasMaternity && (
                            <span className="flex items-center text-pink-600">
                              <Heart className="h-4 w-4 mr-1" />
                              Maternité
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="mb-2">
                          <span className="text-lg font-bold text-green-600">{establishment.coverageRate}%</span>
                          <p className="text-xs text-gray-500">Couverture</p>
                        </div>
                        <div className="space-y-2">
                          <Link to={`/patient/establishments/${establishment.id}`}>
                            <Button size="sm" className="w-full">
                              <Calendar className="h-4 w-4 mr-2" />
                              RDV
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="w-full">
                            <Phone className="h-4 w-4 mr-2" />
                            Appeler
                          </Button>
                        </div>
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
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/patient/establishments" className="block">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <Building className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Chercher un établissement</span>
                  </div>
                </Link>

                <Link to="/patient/insurance/coverage" className="block">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <Shield className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">Ma couverture</span>
                  </div>
                </Link>

                <Link to="/patient/emergency" className="block">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-sm font-medium">Urgences proches</span>
                  </div>
                </Link>

                <Link to="/patient/medical-history" className="block">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Mon dossier médical</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Alertes santé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Alertes & Rappels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.priority)}`}>
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Établissements favoris */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Mes Favoris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {favoriteEstablishments.slice(0, 3).map(establishment => (
                  <Link 
                    key={establishment.id} 
                    to={`/patient/establishments/${establishment.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{establishment.name}</h4>
                        <p className="text-xs text-gray-600">{establishment.city} • {establishment.distance} km</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact urgence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Phone className="h-5 w-5 mr-2" />
                Urgences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-center">
                <p className="text-sm text-gray-600">En cas d'urgence médicale</p>
                <a
                  href="tel:15"
                  className="inline-flex items-center justify-center w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler le 15 (SAMU)
                </a>
                <div className="pt-3 border-t border-gray-200">
                  <Link to="/patient/emergency">
                    <Button variant="outline" size="sm" className="w-full">
                      Établissements d'urgence proches
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardV2;