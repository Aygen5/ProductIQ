import React from "react";

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  name,
  autoComplete,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-outline">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {error && <span className="text-xs text-error font-medium">{error}</span>}
      </div>
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline pointer-events-none transition-colors">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full bg-surface-container-highest/60 text-on-surface placeholder:text-outline/50 text-sm rounded-xl py-3 px-3.5 transition-all duration-200 border outline-none ${
            icon ? "pl-11" : ""
          } ${
            error
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-outline-variant/30 hover:border-outline-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
};
