import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  Clock,
  MapPin,
  Pill,
  Activity,
  Heart,
  Thermometer,
  Weight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface MedicalRecord {
  id: string;
  date: string;
  doctor: {
    name: string;
    specialty: string;
  };
  establishment: string;
  type: "consultation" | "urgence" | "suivi" | "hospitalisation";
  diagnosis: string;
  symptoms: string[];
  prescriptions: Prescription[];
  examinations: Examination[];
  notes: string;
  status: "completed" | "ongoing" | "cancelled";
  cost: number;
  reimbursement: {
    amount: number;
    status: "pending" | "approved" | "rejected";
    insurance: string;
  };
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Examination {
  id: string;
  type: string;
  result: string;
  date: string;
  normalRange?: string;
  status: "normal" | "abnormal" | "critical";
}

interface VitalSigns {
  date: string;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
}

const MedicalHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [viewMode, setViewMode] = useState<"list" | "timeline" | "summary">("list");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadMedicalHistory = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecords: MedicalRecord[] = [
        {
          id: "1",
          date: "2024-12-15",
          doctor: { name: "Dr. Aminata Sow", specialty: "Cardiologie" },
          establishment: "Hôpital Principal de Dakar",
          type: "consultation",
          diagnosis: "Hypertension artérielle légère",
          symptoms: ["Maux de tête", "Fatigue", "Palpitations"],
          prescriptions: [
            {
              id: "p1",
              medication: "Amlodipine 5mg",
              dosage: "1 comprimé",
              frequency: "1 fois par jour",
              duration: "30 jours",
              instructions: "À prendre le matin avec un verre d'eau"
            }
          ],
          examinations: [
            {
              id: "e1",
              type: "Tension artérielle",
              result: "145/90 mmHg",
              date: "2024-12-15",
              normalRange: "< 140/90 mmHg",
              status: "abnormal"
            },
            {
              id: "e2",
              type: "ECG",
              result: "Rythme sinusal normal",
              date: "2024-12-15",
              status: "normal"
            }
          ],
          notes: "Contrôle dans 1 mois. Régime alimentaire pauvre en sel recommandé.",
          status: "completed",
          cost: 25000,
          reimbursement: {
            amount: 20000,
            status: "approved",
            insurance: "IPRES"
          }
        },
        {
          id: "2",
          date: "2024-11-20",
          doctor: { name: "Dr. Moussa Fall", specialty: "Médecine générale" },
          establishment: "Centre de Santé Liberté 6",
          type: "consultation",
          diagnosis: "Grippe saisonnière",
          symptoms: ["Fièvre", "Toux", "Courbatures", "Maux de gorge"],
          prescriptions: [
            {
              id: "p2",
              medication: "Paracétamol 1g",
              dosage: "1 comprimé",
              frequency: "3 fois par jour",
              duration: "5 jours",
              instructions: "En cas de fièvre ou douleurs"
            },
            {
              id: "p3",
              medication: "Sirop pour la toux",
              dosage: "10ml",
              frequency: "3 fois par jour",
              duration: "7 jours",
              instructions: "Après les repas"
            }
          ],
          examinations: [
            {
              id: "e3",
              type: "Température",
              result: "38.5°C",
              date: "2024-11-20",
              normalRange: "36.5-37.5°C",
              status: "abnormal"
            }
          ],
          notes: "Repos recommandé. Retour si aggravation des symptômes.",
          status: "completed",
          cost: 15000,
          reimbursement: {
            amount: 12000,
            status: "approved",
            insurance: "IPRES"
          }
        },
        {
          id: "3",
          date: "2024-10-10",
          doctor: { name: "Dr. Fatou Diop", specialty: "Médecine générale" },
          establishment: "Centre de Santé Liberté 6",
          type: "suivi",
          diagnosis: "Bilan de santé annuel",
          symptoms: [],
          prescriptions: [],
          examinations: [
            {
              id: "e4",
              type: "Glycémie à jeun",
              result: "0.95 g/L",
              date: "2024-10-10",
              normalRange: "0.70-1.10 g/L",
              status: "normal"
            },
            {
              id: "e5",
              type: "Cholestérol total",
              result: "1.85 g/L",
              date: "2024-10-10",
              normalRange: "< 2.00 g/L",
              status: "normal"
            },
            {
              id: "e6",
              type: "Créatinine",
              result: "8 mg/L",
              date: "2024-10-10",
              normalRange: "7-13 mg/L",
              status: "normal"
            }
          ],
          notes: "Bilan satisfaisant. Prochain contrôle dans 1 an.",
          status: "completed",
          cost: 20000,
          reimbursement: {
            amount: 16000,
            status: "approved",
            insurance: "IPRES"
          }
        },
        {
          id: "4",
          date: "2024-09-05",
          doctor: { name: "Dr. Cheikh Ndiaye", specialty: "Urgences" },
          establishment: "Hôpital Général de Grand Yoff",
          type: "urgence",
          diagnosis: "Entorse de la cheville droite",
          symptoms: ["Douleur cheville", "Gonflement", "Difficulté à marcher"],
          prescriptions: [
            {
              id: "p4",
              medication: "Ibuprofène 400mg",
              dosage: "1 comprimé",
              frequency: "3 fois par jour",
              duration: "10 jours",
              instructions: "Pendant les repas"
            }
          ],
          examinations: [
            {
              id: "e7",
              type: "Radiographie cheville",
              result: "Pas de fracture visible",
              date: "2024-09-05",
              status: "normal"
            }
          ],
          notes: "Repos, glace, compression, élévation. Contrôle si douleur persiste.",
          status: "completed",
          cost: 35000,
          reimbursement: {
            amount: 28000,
            status: "approved",
            insurance: "IPRES"
          }
        }
      ];

      const mockVitals: VitalSigns[] = [
        {
          date: "2024-12-15",
          bloodPressure: { systolic: 145, diastolic: 90 },
          heartRate: 78,
          temperature: 36.8,
          weight: 72,
          height: 165
        },
        {
          date: "2024-11-20",
          bloodPressure: { systolic: 130, diastolic: 85 },
          heartRate: 85,
          temperature: 38.5,
          weight: 71.5,
          height: 165
        },
        {
          date: "2024-10-10",
          bloodPressure: { systolic: 125, diastolic: 80 },
          heartRate: 72,
          temperature: 36.6,
          weight: 71,
          height: 165
        }
      ];
      
      setRecords(mockRecords);
      setVitals(mockVitals);
      setLoading(false);
    };

    loadMedicalHistory();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "urgence":
        return "bg-red-100 text-red-800";
      case "suivi":
        return "bg-green-100 text-green-800";
      case "hospitalisation":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consultation";
      case "urgence":
        return "Urgence";
      case "suivi":
        return "Suivi";
      case "hospitalisation":
        return "Hospitalisation";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "ongoing":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getExaminationStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "abnormal":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.establishment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || record.type === selectedType;
    const matchesDoctor = !selectedDoctor || record.doctor.name.includes(selectedDoctor);
    
    const matchesDateRange = 
      (!dateRange.start || record.date >= dateRange.start) &&
      (!dateRange.end || record.date <= dateRange.end);
    
    return matchesSearch && matchesType && matchesDoctor && matchesDateRange;
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
                <h1 className="text-2xl font-bold text-gray-900">Historique médical</h1>
                <p className="text-gray-600 mt-1">Consultez votre dossier médical complet</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "list" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  Liste
                </Button>
                <Button
                  variant={viewMode === "timeline" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("timeline")}
                >
                  Timeline
                </Button>
                <Button
                  variant={viewMode === "summary" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("summary")}
                >
                  Résumé
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans l'historique..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de consultation
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tous les types</option>
                  <option value="consultation">Consultation</option>
                  <option value="urgence">Urgence</option>
                  <option value="suivi">Suivi</option>
                  <option value="hospitalisation">Hospitalisation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médecin
                </label>
                <Input
                  type="text"
                  placeholder="Nom du médecin"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {viewMode === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Statistiques générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Activité médicale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total consultations</span>
                    <span className="font-semibold">{records.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cette année</span>
                    <span className="font-semibold">{records.filter(r => r.date.startsWith('2024')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière visite</span>
                    <span className="font-semibold">
                      {new Date(records[0]?.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signes vitaux récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Signes vitaux récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vitals[0] && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tension</span>
                      <span className="font-semibold">
                        {vitals[0].bloodPressure.systolic}/{vitals[0].bloodPressure.diastolic} mmHg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Poids</span>
                      <span className="font-semibold">{vitals[0].weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rythme cardiaque</span>
                      <span className="font-semibold">{vitals[0].heartRate} bpm</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remboursements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Remboursements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total dépensé</span>
                    <span className="font-semibold">
                      {records.reduce((sum, r) => sum + r.cost, 0).toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total remboursé</span>
                    <span className="font-semibold text-green-600">
                      {records.reduce((sum, r) => sum + r.reimbursement.amount, 0).toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux de remboursement</span>
                    <span className="font-semibold">
                      {Math.round((records.reduce((sum, r) => sum + r.reimbursement.amount, 0) / 
                        records.reduce((sum, r) => sum + r.cost, 0)) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Liste des consultations */}
        <div className="space-y-6">
          {filteredRecords.map(record => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(record.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.diagnosis}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {getTypeText(record.type)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{record.doctor.name} - {record.doctor.specialty}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{record.establishment}</span>
                      </div>
                    </div>

                    {record.symptoms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Symptômes</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.symptoms.map((symptom, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.examinations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Examens</h4>
                        <div className="space-y-2">
                          {record.examinations.map(exam => (
                            <div key={exam.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{exam.type}:</span>
                                <span className={`ml-2 ${getExaminationStatusColor(exam.status)}`}>
                                  {exam.result}
                                </span>
                                {exam.normalRange && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (Normal: {exam.normalRange})
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.prescriptions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Prescriptions</h4>
                        <div className="space-y-2">
                          {record.prescriptions.map(prescription => (
                            <div key={prescription.id} className="flex items-center p-2 bg-blue-50 rounded">
                              <Pill className="h-4 w-4 text-blue-600 mr-2" />
                              <div>
                                <span className="font-medium">{prescription.medication}</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  {prescription.dosage} - {prescription.frequency} - {prescription.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Notes du médecin</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:ml-6 mt-4 lg:mt-0 flex flex-col space-y-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {record.cost.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-green-600">
                        Remboursé: {record.reimbursement.amount.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.reimbursement.insurance}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRecords.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryPage;