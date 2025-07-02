// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Shield,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">CareFlow</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Sénégal
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                À propos
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Boutons d'authentification */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm">
                <Link to="/register">Inscription</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Section héro */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              La santé digitale
              <span className="text-primary-600 block">
                au service du Sénégal
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CareFlow révolutionne l'accès aux soins de santé au Sénégal.
              Trouvez des médecins, gérez vos assurances et suivez vos
              traitements en quelques clics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8">
                <Link to="/register" className="flex items-center">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <a href="#features" className="flex items-center">
                  Découvrir les fonctionnalités
                </a>
              </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">200+</div>
                <div className="text-gray-600">Médecins partenaires</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">15K+</div>
                <div className="text-gray-600">Patients actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">14</div>
                <div className="text-gray-600">Régions couvertes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section fonctionnalités */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme complète pour tous
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CareFlow s'adapte aux besoins de chaque acteur de la santé
              sénégalaise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pour les patients */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Patients
                </h3>
                <p className="text-gray-600 mb-4">
                  Trouvez des médecins, prenez rendez-vous et gérez votre
                  assurance santé
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Recherche géolocalisée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Prise de RDV en ligne
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suivi des remboursements
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pour les médecins */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Médecins
                </h3>
                <p className="text-gray-600 mb-4">
                  Gérez votre planning, vos patients et optimisez votre pratique
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Planning intelligent
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dossiers patients
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Prescriptions digitales
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pour les assureurs */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Assureurs
                </h3>
                <p className="text-gray-600 mb-4">
                  Simplifiez la gestion des polices et des remboursements
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gestion des polices
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Traitement automatisé
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Analytics avancées
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pour les établissements */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Établissements
                </h3>
                <p className="text-gray-600 mb-4">
                  Modernisez la gestion de votre structure de santé
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gestion des RDV
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tableau de bord
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Rapports détaillés
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "CareFlow a simplifié ma prise de rendez-vous. Plus besoin de
                  faire la queue !"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">AM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Aminata Mbaye
                    </div>
                    <div className="text-sm text-gray-500">Patiente, Dakar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Un outil formidable pour organiser mes consultations et
                  suivre mes patients."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">MF</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Dr. Moussa Fall
                    </div>
                    <div className="text-sm text-gray-500">
                      Cardiologue, Thiès
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "La digitalisation dont notre secteur avait besoin. Très
                  efficace !"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">FD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Fatou Diop
                    </div>
                    <div className="text-sm text-gray-500">
                      Agent NSIA, Dakar
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600">
              Une question ? Notre équipe est là pour vous accompagner
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Adresse
                </h3>
                <p className="text-gray-600">
                  Plateau, Dakar
                  <br />
                  Sénégal
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Téléphone
                </h3>
                <p className="text-gray-600">
                  +221 33 123 45 67
                  <br />
                  +221 77 123 45 67
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email
                </h3>
                <p className="text-gray-600">
                  contact@careflow.sn
                  <br />
                  support@careflow.sn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-bold">CareFlow</span>
              </div>
              <p className="text-gray-300 mb-4">
                La plateforme de santé digitale qui révolutionne l'accès aux
                soins au Sénégal.
              </p>
            </div>

            {/* Liens utiles */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    CGU
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CareFlow Sénégal. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
