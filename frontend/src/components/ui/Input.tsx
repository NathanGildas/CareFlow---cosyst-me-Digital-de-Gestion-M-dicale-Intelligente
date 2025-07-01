// src/components/ui/Input.tsx
import { forwardRef, useState } from "react";
import type { ReactNode } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  fullWidth?: boolean;
  variant?: "default" | "filled" | "outline";
  size?: "sm" | "md" | "lg";
  showSuccess?: boolean;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword = false,
      fullWidth = true,
      variant = "default",
      size = "md",
      showSuccess = false,
      loading = false,
      className = "",
      disabled,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Classes de base pour le conteneur
    const containerClasses = fullWidth ? "w-full" : "";

    // Classes pour le label
    const labelClasses = `
    block text-sm font-medium mb-1 transition-colors duration-200
    ${error ? "text-red-600" : showSuccess ? "text-green-600" : "text-gray-700"}
  `
      .trim()
      .replace(/\s+/g, " ");

    // Classes de base pour l'input
    const baseInputClasses = `
    block w-full transition-all duration-200 focus:outline-none
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    ${loading ? "cursor-wait" : ""}
  `
      .trim()
      .replace(/\s+/g, " ");

    // Classes selon la taille
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    // Classes selon la variante
    const variantClasses = {
      default: `
      border border-gray-300 rounded-lg bg-white
      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      hover:border-gray-400
    `,
      filled: `
      bg-gray-50 border border-transparent rounded-lg
      focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      hover:bg-gray-100
    `,
      outline: `
      border-2 border-gray-200 rounded-lg bg-white
      focus:ring-0 focus:border-primary-500
      hover:border-gray-300
    `,
    };

    // Classes d'état
    const stateClasses = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : showSuccess
      ? "border-green-500 focus:ring-green-500 focus:border-green-500"
      : disabled
      ? "bg-gray-100 cursor-not-allowed border-gray-200"
      : "";

    // Classes avec icônes
    const iconClasses = leftIcon
      ? "pl-10"
      : rightIcon || isPassword || showSuccess
      ? "pr-10"
      : "";

    // Combinaison de toutes les classes pour l'input
    const inputClasses = `
    ${baseInputClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    ${iconClasses}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    // Déterminer le type d'input
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label className={labelClasses}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Conteneur de l'input avec icônes */}
        <div className="relative">
          {/* Icône de gauche */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span
                className={`text-sm ${
                  error
                    ? "text-red-500"
                    : showSuccess
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input principal */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
          />

          {/* Icônes de droite */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {/* Indicateur de succès */}
            {showSuccess && !error && !loading && (
              <Check className="h-5 w-5 text-green-500" />
            )}

            {/* Indicateur d'erreur */}
            {error && !loading && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}

            {/* Icône de mot de passe */}
            {isPassword && !error && !showSuccess && !loading && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Icône personnalisée de droite */}
            {rightIcon && !isPassword && !error && !showSuccess && !loading && (
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            )}

            {/* Indicateur de chargement */}
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            )}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Message d'aide */}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
