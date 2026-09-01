import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  switchPrompt: string;
  switchActionText: string;
  switchActionTo: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  switchPrompt,
  switchActionText,
  switchActionTo,
}) => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row text-on-surface">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container-lowest border-r border-outline-variant/15 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">insights</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface block">
                ProductIQ
              </span>
              <span className="text-[11px] font-medium text-outline uppercase tracking-widest block">
                Enterprise Catalog Intelligence
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Next-Gen E-Commerce AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface leading-tight">
              Harmonize Catalogs with Deterministic Multi-Signal AI.
            </h2>
            <p className="mt-3 text-sm text-outline leading-relaxed">
              Detect duplicate products, resolve merge conflicts, and query high-dimensional embeddings across multimodal catalog inventories in real time.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3.5 hover:border-outline-variant/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">rule</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface">7-Signal Duplicate Scoring</h4>
                <p className="text-xs text-outline mt-0.5">
                  Algorithmic synthesis across brand, model, CLIP ViT-B/32 visual embeddings, and text vectors.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3.5 hover:border-outline-variant/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface">Risk Detection Engine</h4>
                <p className="text-xs text-outline mt-0.5">
                  Proactive risk scoring safeguarding catalog integrity against conflicting attributes and pricing anomalies.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3.5 hover:border-outline-variant/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">search_check</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface">Hybrid Semantic Search</h4>
                <p className="text-xs text-outline mt-0.5">
                  Sub-millisecond cosine vector lookup with lexical keyword fusion and query intent analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-outline-variant/15 flex items-center justify-between text-xs text-outline">
          <span>ProductIQ Platform v1.0.0</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Enterprise Security & RBAC Active
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-outline-variant/15">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <span className="font-headline-md text-lg tracking-tight text-on-surface font-semibold">
              ProductIQ
            </span>
          </Link>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-outline font-medium">
            SaaS Platform
          </span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              {title}
            </h1>
            <p className="mt-2 text-sm text-outline leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-surface-container-low/90 border border-outline-variant/20 rounded-2xl shadow-xl backdrop-blur-md">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-outline">
            {switchPrompt}{" "}
            <Link
              to={switchActionTo}
              className="text-primary hover:text-primary-fixed font-semibold transition-colors underline-offset-4 hover:underline"
            >
              {switchActionText}
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-outline/60">
          © 2026 ProductIQ Intelligence Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
};
