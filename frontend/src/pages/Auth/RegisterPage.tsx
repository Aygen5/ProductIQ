import React, { useState } from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { AuthButton } from "../../components/auth/AuthButton";

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join the ProductIQ intelligence platform to manage product duplicates, evaluate catalog risks, and query vector embeddings."
      switchPrompt="Already have an account?"
      switchActionText="Sign in"
      switchActionTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AuthInput
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            icon="person"
            required
            autoComplete="given-name"
          />

          <AuthInput
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            icon="badge"
            required
            autoComplete="family-name"
          />
        </div>

        <AuthInput
          label="Work Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane.doe@company.com"
          icon="mail"
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          showRequirements={true}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={passwordMismatch ? "Passwords do not match" : undefined}
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 rounded bg-surface-container-highest border-outline-variant/50 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
            />
            <span className="leading-relaxed">
              I agree to the{" "}
              <span className="text-primary font-medium">Enterprise Terms of Service</span> and{" "}
              <span className="text-primary font-medium">Privacy Policy</span>.
            </span>
          </label>
        </div>

        <div className="pt-2">
          <AuthButton type="submit" variant="primary">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Create Account
          </AuthButton>
        </div>

        {passwordsMatch && (
          <div className="flex items-center gap-1.5 text-xs text-secondary justify-center pt-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Passwords match
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
