import React from "react";

interface AuthButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  type = "submit",
  disabled = false,
  loading = false,
  onClick,
  variant = "primary",
  className = "",
}) => {
  const baseClasses =
    "w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-container text-on-primary-container hover:bg-primary-container/85 active:scale-[0.99] shadow-lg shadow-primary-container/25 focus:ring-primary",
    secondary:
      "bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-[0.99] focus:ring-outline",
    outline:
      "bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.99] focus:ring-outline",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
