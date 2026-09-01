import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { AuthButton } from "../../components/auth/AuthButton";
import { useAuth } from "../../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      await login({
        email: trimmedEmail,
        password,
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your catalog intelligence dashboard, duplicate review queue, and analytics."
      switchPrompt="Don't have an account?"
      switchActionText="Create an account"
      switchActionTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-error-container/30 border border-error/30 rounded-xl flex items-start gap-2.5 text-xs text-error">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@company.com"
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
          autoComplete="current-password"
          disabled={loading}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface-variant hover:text-on-surface transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded bg-surface-container-highest border-outline-variant/50 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
            />
            <span>Remember me for 30 days</span>
          </label>

          <span
            className="text-outline/70 cursor-not-allowed transition-colors"
            title="Password reset will be available in future releases"
          >
            Forgot password?
          </span>
        </div>

        <div className="pt-2">
          <AuthButton type="submit" variant="primary" loading={loading} disabled={loading}>
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </AuthButton>
        </div>

        <div className="pt-4 border-t border-outline-variant/15">
          <div className="p-3.5 bg-surface-container-highest/40 border border-outline-variant/20 rounded-xl space-y-2 text-xs text-outline">
            <div className="flex items-center gap-1.5 font-semibold text-on-surface text-[11px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px] text-primary">info</span>
              Quick Demo Login
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials("admin@productiq.internal", "Admin123!*")}
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-left transition-all group"
              >
                <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  System Admin
                </div>
                <div className="text-[10px] text-outline truncate">admin@productiq.internal</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("user@productiq.internal", "User123!*")}
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-left transition-all group"
              >
                <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Standard User
                </div>
                <div className="text-[10px] text-outline truncate">user@productiq.internal</div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
