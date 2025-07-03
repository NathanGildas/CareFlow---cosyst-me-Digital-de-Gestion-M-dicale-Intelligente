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

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Composant Card principal
const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  const baseClasses = "bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200";
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-1"
    : "hover:shadow-md";

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

// Composant CardFooter
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => {
  return <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

// Export par défaut
export default Card;
