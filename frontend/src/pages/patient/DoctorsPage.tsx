import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Filter,
  Heart,
  Users,
  Stethoscope,
  Eye,
  Brain,
  Baby,
  Zap,
  Bone,
  AlertCircle,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: number;
  availability: "available" | "busy" | "unavailable";
  nextSlot: string;
  consultationFee: number;
  insuranceAccepted: string[];
  photo?: string;
  languages: string[];
  experience: number;
  education: string;
  hospital: string;
}

interface Specialty {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number;
}

const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const specialties: Specialty[] = [
    { id: "cardiologie", name: "Cardiologie", icon: Heart, color: "bg-red-100 text-red-600", count: 24 },
    { id: "pediatrie", name: "Pédiatrie", icon: Baby, color: "bg-pink-100 text-pink-600", count: 18 },
    { id: "neurologie", name: "Neurologie", icon: Brain, color: "bg-purple-100 text-purple-600", count: 15 },
    { id: "ophtalmologie", name: "Ophtalmologie", icon: Eye, color: "bg-blue-100 text-blue-600", count: 22 },
    { id: "orthopédie", name: "Orthopédie", icon: Bone, color: "bg-green-100 text-green-600", count: 19 },
    { id: "médecine-générale", name: "Médecine générale", icon: Stethoscope, color: "bg-gray-100 text-gray-600", count: 45 },
    { id: "urgences", name: "Urgences", icon: Zap, color: "bg-orange-100 text-orange-600", count: 12 },
    { id: "dermatologie", name: "Dermatologie", icon: Users, color: "bg-yellow-100 text-yellow-600", count: 16 },
  ];

  useEffect(() => {
    const loadDoctors = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDoctors: Doctor[] = [
        {
          id: "1",
          firstName: "Aminata",
          lastName: "Sow",
          specialty: "Cardiologie",
          rating: 4.8,
          reviewCount: 127,
          location: "Plateau, Dakar",
          distance: 2.4,
          availability: "available",
          nextSlot: "Aujourd'hui 14h30",
          consultationFee: 25000,
          insuranceAccepted: ["IPRES", "CSS", "NSIA"],
          languages: ["Français", "Wolof", "Anglais"],
          experience: 12,
          education: "CHU Fann, Université Cheikh Anta Diop",
          hospital: "Hôpital Principal de Dakar"
        },
        {
          id: "2",
          firstName: "Moussa",
          lastName: "Fall",
          specialty: "Pédiatrie",
          rating: 4.9,
          reviewCount: 203,
          location: "Mermoz, Dakar",
          distance: 5.1,
          availability: "busy",
          nextSlot: "Demain 09h00",
          consultationFee: 20000,
          insuranceAccepted: ["IPRES", "CSS"],
          languages: ["Français", "Wolof"],
          experience: 15,
          education: "CHU Aristide Le Dantec",
          hospital: "Clinique Mermoz"
        },
        {
          id: "3",
          firstName: "Fatou",
          lastName: "Diop",
          specialty: "Médecine générale",
          rating: 4.6,
          reviewCount: 89,
          location: "Liberté 6, Dakar",
          distance: 3.8,
          availability: "available",
          nextSlot: "Aujourd'hui 16h00",
          consultationFee: 15000,
          insuranceAccepted: ["CSS", "NSIA", "SAHAM"],
          languages: ["Français", "Wolof", "Sérère"],
          experience: 8,
          education: "Université Gaston Berger",
          hospital: "Centre de Santé Liberté 6"
        },
        {
          id: "4",
          firstName: "Cheikh",
          lastName: "Ndiaye",
          specialty: "Neurologie",
          rating: 4.7,
          reviewCount: 156,
          location: "Médina, Dakar",
          distance: 4.2,
          availability: "unavailable",
          nextSlot: "Lundi 10h00",
          consultationFee: 30000,
          insuranceAccepted: ["IPRES", "NSIA"],
          languages: ["Français", "Wolof", "Anglais"],
          experience: 18,
          education: "CHU Fann, Spécialisation France",
          hospital: "Hôpital Général de Grand Yoff"
        },
        {
          id: "5",
          firstName: "Mariama",
          lastName: "Ba",
          specialty: "Ophtalmologie",
          rating: 4.5,
          reviewCount: 92,
          location: "Sicap Liberté, Dakar",
          distance: 6.3,
          availability: "available",
          nextSlot: "Aujourd'hui 15h30",
          consultationFee: 22000,
          insuranceAccepted: ["CSS", "SAHAM"],
          languages: ["Français", "Wolof"],
          experience: 10,
          education: "CHU Aristide Le Dantec",
          hospital: "Centre Ophtalmologique de Dakar"
        },
        {
          id: "6",
          firstName: "Ibrahima",
          lastName: "Sarr",
          specialty: "Orthopédie",
          rating: 4.4,
          reviewCount: 78,
          location: "Point E, Dakar",
          distance: 7.1,
          availability: "busy",
          nextSlot: "Mercredi 08h30",
          consultationFee: 28000,
          insuranceAccepted: ["IPRES", "CSS", "NSIA"],
          languages: ["Français", "Wolof", "Peul"],
          experience: 14,
          education: "CHU Fann",
          hospital: "Hôpital Orthopédique de Dakar"
        }
      ];
      
      setDoctors(mockDoctors);
      setLoading(false);
    };

    loadDoctors();
  }, []);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Disponible";
      case "busy":
        return "Occupé";
      case "unavailable":
        return "Indisponible";
      default:
        return availability;
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || doctor.specialty.toLowerCase() === selectedSpecialty;
    const matchesLocation = !selectedLocation || doctor.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesPrice = doctor.consultationFee >= priceRange[0] && doctor.consultationFee <= priceRange[1];
    
    return matchesSearch && matchesSpecialty && matchesLocation && matchesPrice;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return a.distance - b.distance;
      case "price":
        return a.consultationFee - b.consultationFee;
      case "experience":
        return b.experience - a.experience;
      default:
        return 0;
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Trouver un médecin</h1>
            <p className="text-gray-600 mt-1">Recherchez un professionnel de santé près de chez vous</p>
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
                  placeholder="Rechercher par nom, spécialité ou localisation..."
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les spécialités</option>
                  {specialties.map(specialty => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <Input
                  type="text"
                  placeholder="Ville ou quartier"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix max (FCFA)
                </label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="rating">Note</option>
                  <option value="distance">Distance</option>
                  <option value="price">Prix</option>
                  <option value="experience">Expérience</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar avec spécialités */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Spécialités médicales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {specialties.map(specialty => {
                    const Icon = specialty.icon;
                    return (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(specialty.id === selectedSpecialty ? "" : specialty.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSpecialty === specialty.id
                            ? "bg-primary-50 border-primary-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${specialty.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{specialty.name}</p>
                              <p className="text-sm text-gray-500">{specialty.count} médecins</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des médecins */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {sortedDoctors.length} médecin{sortedDoctors.length > 1 ? 's' : ''} trouvé{sortedDoctors.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {sortedDoctors.map(doctor => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">
                            {doctor.firstName[0]}{doctor.lastName[0]}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(doctor.availability)}`}>
                              {getAvailabilityText(doctor.availability)}
                            </span>
                          </div>
                          
                          <p className="text-primary-600 font-medium mb-2">{doctor.specialty}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span>{doctor.rating}</span>
                              <span className="ml-1">({doctor.reviewCount} avis)</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{doctor.location} • {doctor.distance} km</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{doctor.nextSlot}</span>
                            </div>
                            <div>
                              <span className="font-medium">{doctor.consultationFee.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{doctor.experience} ans d'expérience</span> • {doctor.hospital}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Langues: {doctor.languages.join(", ")} • 
                              Assurances: {doctor.insuranceAccepted.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full md:w-auto"
                          disabled={doctor.availability === "unavailable"}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Prendre RDV
                        </Button>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <Phone className="h-4 w-4 mr-2" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {sortedDoctors.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun médecin trouvé
                    </h3>
                    <p className="text-gray-600">
                      Essayez de modifier vos critères de recherche ou d'élargir votre zone géographique.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;