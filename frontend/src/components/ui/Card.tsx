// src/components/ui/Card.tsx - Composant Card réutilisable
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

// Composant Card principal
const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  const baseClasses = "bg-white rounded-lg shadow border border-gray-200";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md transition-shadow"
    : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Composant CardHeader
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Composant CardTitle
export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

// Composant CardContent
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

// Export par défaut
export default Card;
