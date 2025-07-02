// src/components/insurance/CompanyCard.tsx - Carte d'affichage d'une compagnie d'assurance
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ArrowRight,
  Shield,
  Award,
  Users,
  Calendar,
} from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import CardFooter from "../ui/Card";
import Button from "../ui/Button";
import type { InsuranceCompany } from "../../types/insurance.types";

interface CompanyCardProps {
  company: InsuranceCompany;
  plansCount?: number;
  showPlansButton?: boolean;
  onViewPlans?: (companyId: string) => void;
  onViewDetails?: (companyId: string) => void;
  variant?: "default" | "compact" | "detailed";
}

// Composant pour afficher les étoiles de notation
const StarRating: React.FC<{ rating: number; reviewsCount: number }> = ({
  rating,
  reviewsCount,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {/* Étoiles pleines */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        ))}

        {/* Demi-étoile */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Étoiles vides */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star key={`empty-${index}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>

      <span className="text-sm font-medium text-gray-900">{rating}</span>
      <span className="text-sm text-gray-500">({reviewsCount})</span>
    </div>
  );
};

// Composant pour les badges de statut
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    <div
      className={`w-1.5 h-1.5 rounded-full mr-1 ${
        isActive ? "bg-green-400" : "bg-red-400"
      }`}
    />
    {isActive ? "Actif" : "Inactif"}
  </span>
);

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  plansCount = 0,
  showPlansButton = true,
  onViewPlans,
  onViewDetails,
  variant = "default",
}) => {
  // Calculer l'ancienneté
  const currentYear = new Date().getFullYear();
  const yearsInBusiness = currentYear - company.foundedYear;

  // Formater l'adresse
  const fullAddress = `${company.address}, ${company.city}, ${company.region}`;

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`Logo ${company.name}`}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 truncate">
                  {company.name}
                </h3>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{company.city}</span>
                </div>
                <StarRating
                  rating={company.rating}
                  reviewsCount={company.reviewsCount}
                />
              </div>
            </div>

            <StatusBadge isActive={company.isActive} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        {/* En-tête avec logo et nom */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`Logo ${company.name}`}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {company.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge isActive={company.isActive} />
                {yearsInBusiness > 0 && (
                  <span className="text-sm text-gray-500">
                    {yearsInBusiness} ans d'expérience
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Note et avis */}
          <div className="text-right">
            <StarRating
              rating={company.rating}
              reviewsCount={company.reviewsCount}
            />
          </div>
        </div>

        {/* Description */}
        {variant === "detailed" && company.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Informations principales */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{fullAddress}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <a
              href={`tel:${company.phone}`}
              className="hover:text-primary-600 transition-colors"
            >
              {company.phone}
            </a>
          </div>

          {variant === "detailed" && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-primary-600 transition-colors truncate"
                >
                  {company.email}
                </a>
              </div>

              {company.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors truncate"
                  >
                    Site web
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-lg font-semibold text-gray-900">
                {plansCount}
              </span>
            </div>
            <span className="text-xs text-gray-600">
              Plan{plansCount > 1 ? "s" : ""} disponible
              {plansCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-lg font-semibold text-gray-900">
                {company.foundedYear}
              </span>
            </div>
            <span className="text-xs text-gray-600">Fondée</span>
          </div>
        </div>

        {/* Licence */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Award className="w-3 h-3 mr-1" />
          <span>Licence n° {company.licenseNumber}</span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <Button
          onClick={() => onViewDetails?.(company.id)}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <span>Détails</span>
        </Button>

        {showPlansButton && (
          <Button
            onClick={() => onViewPlans?.(company.id)}
            variant="primary"
            size="sm"
            className="flex items-center space-x-1"
          >
            <span>Voir les plans</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
