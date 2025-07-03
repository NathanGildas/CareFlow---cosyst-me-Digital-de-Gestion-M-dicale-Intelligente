import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Edit,
  Eye,
  Filter,
  Download,
  Heart,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Activity,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "M" | "F";
  phone: string;
  email: string;
  address: string;
  insurance: string;
  lastVisit: string;
  nextAppointment?: string;
  chronicConditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: "active" | "inactive" | "critical";
  totalVisits: number;
  notes: string;
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPatients: Patient[] = [
        {
          id: "1",
          firstName: "Aminata",
          lastName: "Diallo",
          dateOfBirth: "1985-03-15",
          gender: "F",
          phone: "+221 77 123 45 67",
          email: "aminata.diallo@email.com",
          address: "Plateau, Dakar",
          insurance: "IPRES",
          lastVisit: "2024-12-10",
          nextAppointment: "2024-12-20 14:30",
          chronicConditions: ["Hypertension", "Diabète type 2"],
          allergies: ["Pénicilline"],
          emergencyContact: {
            name: "Moussa Diallo",
            phone: "+221 77 987 65 43",
            relationship: "Époux"
          },
          status: "critical",
          totalVisits: 15,
          notes: "Patiente suivie pour diabète et hypertension. Contrôle régulier nécessaire."
        },
        {
          id: "2",
          firstName: "Ousmane",
          lastName: "Fall",
          dateOfBirth: "1992-07-22",
          gender: "M",
          phone: "+221 76 234 56 78",
          email: "ousmane.fall@email.com",
          address: "Mermoz, Dakar",
          insurance: "CSS",
          lastVisit: "2024-12-05",
          chronicConditions: [],
          allergies: [],
          emergencyContact: {
            name: "Fatou Fall",
            phone: "+221 77 345 67 89",
            relationship: "Mère"
          },
          status: "active",
          totalVisits: 8,
          notes: "Jeune patient en bonne santé générale."
        },
        {
          id: "3",
          firstName: "Fatou",
          lastName: "Sow",
          dateOfBirth: "1978-11-08",
          gender: "F",
          phone: "+221 78 345 67 89",
          email: "fatou.sow@email.com",
          address: "Liberté 6, Dakar",
          insurance: "NSIA",
          lastVisit: "2024-11-28",
          nextAppointment: "2024-12-18 09:00",
          chronicConditions: ["Asthme"],
          allergies: ["Pollens", "Acariens"],
          emergencyContact: {
            name: "Cheikh Sow",
            phone: "+221 77 456 78 90",
            relationship: "Frère"
          },
          status: "active",
          totalVisits: 22,
          notes: "Suivi régulier pour asthme. Traitement bien toléré."
        },
        {
          id: "4",
          firstName: "Mamadou",
          lastName: "Ba",
          dateOfBirth: "1965-01-30",
          gender: "M",
          phone: "+221 77 567 89 01",
          email: "mamadou.ba@email.com",
          address: "Sicap Liberté, Dakar",
          insurance: "IPRES",
          lastVisit: "2024-10-15",
          chronicConditions: ["Insuffisance cardiaque"],
          allergies: [],
          emergencyContact: {
            name: "Awa Ba",
            phone: "+221 76 678 90 12",
            relationship: "Épouse"
          },
          status: "inactive",
          totalVisits: 45,
          notes: "Patient âgé avec problèmes cardiaques. Surveillance étroite recommandée."
        },
        {
          id: "5",
          firstName: "Aïssatou",
          lastName: "Ndiaye",
          dateOfBirth: "1990-09-12",
          gender: "F",
          phone: "+221 78 789 01 23",
          email: "aissatou.ndiaye@email.com",
          address: "Point E, Dakar",
          insurance: "SAHAM",
          lastVisit: "2024-12-08",
          nextAppointment: "2024-12-22 16:00",
          chronicConditions: [],
          allergies: ["Fruits de mer"],
          emergencyContact: {
            name: "Ibrahima Ndiaye",
            phone: "+221 77 890 12 34",
            relationship: "Père"
          },
          status: "active",
          totalVisits: 6,
          notes: "Jeune patiente, suivi de grossesse."
        }
      ];
      
      setPatients(mockPatients);
      setLoading(false);
    };

    loadPatients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || patient.status === selectedStatus;
    const matchesGender = !selectedGender || patient.gender === selectedGender;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

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
                <h1 className="text-2xl font-bold text-gray-900">Mes patients</h1>
                <p className="text-gray-600 mt-1">Gestion et suivi de vos patients</p>
              </div>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau patient
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total patients</h3>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Patients actifs</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">À surveiller</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.status === "critical").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">RDV programmés</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.nextAppointment).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline" className="lg:w-auto w-full">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="critical">À surveiller</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous</option>
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Liste des patients */}
        <div className="space-y-4">
          {filteredPatients.map(patient => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {patient.status === "active" ? "Actif" : 
                           patient.status === "inactive" ? "Inactif" : "À surveiller"}
                        </span>
                        {getStatusIcon(patient.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{getAge(patient.dateOfBirth)} ans • {patient.gender === "M" ? "Homme" : "Femme"}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{patient.address}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {patient.nextAppointment && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-blue-600 font-medium">
                              Prochain RDV: {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {(patient.chronicConditions.length > 0 || patient.allergies.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {patient.chronicConditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              <Heart className="h-3 w-3 inline mr-1" />
                              {condition}
                            </span>
                          ))}
                          {patient.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {allergy}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    <div className="text-right text-sm text-gray-600 mb-2">
                      <p>{patient.totalVisits} consultations</p>
                      <p>{patient.insurance}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="primary" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir dossier
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Planifier RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun patient trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou ajoutez un nouveau patient.
                </p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un patient
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;