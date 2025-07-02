import React from "react";
import { Heart, Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "pulse" | "dots" | "medical";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className = "",
}) => {
  // Classes de taille
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  // Classes de texte selon la taille
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Composant Spinner classique
  const SpinnerLoader = () => (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
  );

  // Composant Heart pulsant (thème médical)
  const MedicalLoader = () => (
    <Heart
      className={`${sizeClasses[size]} text-red-500 animate-pulse`}
      fill="currentColor"
    />
  );

  // Composant Pulse
  const PulseLoader = () => (
    <div className="flex space-x-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`${
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
          } bg-blue-600 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );

  // Composant Dots animés
  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`${
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
          } bg-blue-600 rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  // Sélectionner le loader selon la variante
  const renderLoader = () => {
    switch (variant) {
      case "medical":
        return <MedicalLoader />;
      case "pulse":
        return <PulseLoader />;
      case "dots":
        return <DotsLoader />;
      case "spinner":
      default:
        return <SpinnerLoader />;
    }
  };

  // Contenu du loader
  const LoaderContent = () => (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  // Si fullScreen, afficher en overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="text-center">
          <LoaderContent />
        </div>
      </div>
    );
  }

  // Affichage normal
  return (
    <div className="flex items-center justify-center p-4">
      <LoaderContent />
    </div>
  );
};

// Composants spécialisés pour des cas d'usage courants

export const PageLoader: React.FC<{ text?: string }> = ({
  text = "Chargement...",
}) => <Loading variant="medical" size="lg" text={text} fullScreen />;

export const ButtonLoader: React.FC = () => (
  <Loading variant="spinner" size="sm" />
);

export const CardLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
    <Loading variant="dots" size="md" text={text} />
  </div>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center space-x-2">
    <Loading variant="spinner" size="sm" />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
);

// Composant pour les listes de données
export const ListLoader: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Composant pour les cartes de contenu
export const ContentLoader: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-300 rounded w-1/4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded" />
      <div className="h-4 bg-gray-300 rounded w-5/6" />
      <div className="h-4 bg-gray-300 rounded w-4/6" />
    </div>
    <div className="h-32 bg-gray-300 rounded" />
  </div>
);

export default Loading;