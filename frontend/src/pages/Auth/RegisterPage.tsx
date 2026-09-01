import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { AuthButton } from "../../components/auth/AuthButton";
import { useAuth } from "../../context/AuthContext";

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password) {
      setError("All required fields must be completed.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms of service to proceed.");
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join the ProductIQ intelligence platform to manage product duplicates, evaluate catalog risks, and query vector embeddings."
      switchPrompt="Already have an account?"
      switchActionText="Sign in"
      switchActionTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-error-container/30 border border-error/30 rounded-xl flex items-start gap-2.5 text-xs text-error">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

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
            disabled={loading}
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
            disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              disabled={loading}
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
          <AuthButton type="submit" variant="primary" loading={loading} disabled={loading}>
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
