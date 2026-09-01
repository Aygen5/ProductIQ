import React, { useState } from "react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  showRequirements?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  error,
  required = false,
  name = "password",
  autoComplete,
  disabled = false,
  showRequirements = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const hasMinLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-outline">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {error && <span className="text-xs text-error font-medium">{error}</span>}
      </div>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline pointer-events-none">
          lock
        </span>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full bg-surface-container-highest/60 text-on-surface placeholder:text-outline/50 text-sm rounded-xl py-3 pl-11 pr-11 transition-all duration-200 border outline-none ${
            error
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-outline-variant/30 hover:border-outline-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          className="absolute right-3 text-outline hover:text-on-surface transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40"
          title={showPassword ? "Hide password" : "Show password"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {showRequirements && value.length > 0 && (
        <div className="mt-2 p-3 bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl space-y-1.5 text-xs">
          <p className="text-outline font-medium text-[11px] uppercase tracking-wider mb-1">
            Password strength guidelines
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-secondary font-medium" : "text-outline/70"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {hasMinLength ? "check_circle" : "radio_button_unchecked"}
              </span>
              8+ characters
            </span>
            <span className={`flex items-center gap-1.5 ${hasUppercase ? "text-secondary font-medium" : "text-outline/70"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {hasUppercase ? "check_circle" : "radio_button_unchecked"}
              </span>
              Uppercase letter
            </span>
            <span className={`flex items-center gap-1.5 ${hasLowercase ? "text-secondary font-medium" : "text-outline/70"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {hasLowercase ? "check_circle" : "radio_button_unchecked"}
              </span>
              Lowercase letter
            </span>
            <span className={`flex items-center gap-1.5 ${hasNumber || hasSpecial ? "text-secondary font-medium" : "text-outline/70"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {hasNumber || hasSpecial ? "check_circle" : "radio_button_unchecked"}
              </span>
              Number or symbol
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
