import React, { useState } from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { AuthButton } from "../../components/auth/AuthButton";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        />

        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface-variant hover:text-on-surface transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
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
          <AuthButton type="submit" variant="primary">
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </AuthButton>
        </div>

        <div className="pt-4 border-t border-outline-variant/15">
          <div className="p-3.5 bg-surface-container-highest/40 border border-outline-variant/20 rounded-xl space-y-1.5 text-xs text-outline">
            <div className="flex items-center gap-1.5 font-semibold text-on-surface text-[11px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px] text-primary">info</span>
              Demo Platform Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="font-semibold text-on-surface">Admin:</span>{" "}
                <span className="text-on-surface-variant">admin@productiq.internal</span>
              </div>
              <div>
                <span className="font-semibold text-on-surface">User:</span>{" "}
                <span className="text-on-surface-variant">user@productiq.internal</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
