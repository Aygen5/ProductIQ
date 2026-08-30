import React, { useState, useEffect } from "react";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../../services/settingsService";
import type { SystemSettings } from "../../types/settings";

export const SettingsPage: React.FC = () => {
  const [initialSettings, setInitialSettings] = useState<SystemSettings | null>(null);
  const [formSettings, setFormSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"similarity" | "risk" | "ai" | "notification">("similarity");

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSettings();
      setInitialSettings(data);
      setFormSettings(JSON.parse(JSON.stringify(data)));
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const isDirty = formSettings && initialSettings
    ? JSON.stringify(formSettings) !== JSON.stringify(initialSettings)
    : false;

  const handleSave = async () => {
    if (!formSettings) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateSettings({
        similarity: formSettings.similarity,
        risk: formSettings.risk,
        ai: formSettings.ai,
        notification: formSettings.notification,
      });

      setInitialSettings(updated);
      setFormSettings(JSON.parse(JSON.stringify(updated)));
      setSuccessMessage("System settings successfully updated and saved to PostgreSQL.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save settings. Please verify input ranges.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to system defaults?")) {
      return;
    }

    setResetting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const reset = await resetSettings();
      setInitialSettings(reset);
      setFormSettings(JSON.parse(JSON.stringify(reset)));
      setSuccessMessage("All settings have been reset to factory defaults.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to reset settings.");
    } finally {
      setResetting(false);
    }
  };

  const handleDiscard = () => {
    if (initialSettings) {
      setFormSettings(JSON.parse(JSON.stringify(initialSettings)));
      setErrorMessage(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen gap-xl pb-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-background font-bold">System Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage runtime detection thresholds, safety risk levels, AI explanations, and alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-xs px-sm py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-[12px] text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Database Synced</span>
          </div>
          <button
            onClick={handleReset}
            disabled={loading || resetting || saving}
            className="px-md py-1.5 bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high text-on-surface rounded-xl font-label-md text-label-md font-bold transition-all flex items-center gap-xs disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[16px] ${resetting ? "animate-spin" : ""}`}>restart_alt</span>
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-md rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary font-label-md text-label-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-md rounded-2xl bg-error/15 border border-error/30 text-error font-label-md text-label-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
          <div className="md:col-span-3 p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 animate-pulse h-64" />
          <div className="md:col-span-9 p-xl rounded-[28px] bg-surface-container border border-outline-variant/10 animate-pulse h-96" />
        </div>
      ) : formSettings ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-xl items-start">
          <div className="md:col-span-3 flex flex-col gap-xs sticky top-24 bg-surface-container p-sm rounded-[24px] border border-outline-variant/10">
            <button
              onClick={() => setActiveTab("similarity")}
              className={`flex items-center gap-sm px-md py-2.5 rounded-xl font-label-md text-label-md font-bold transition-all text-left ${
                activeTab === "similarity"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">compare</span>
              <span>Similarity Thresholds</span>
            </button>

            <button
              onClick={() => setActiveTab("risk")}
              className={`flex items-center gap-sm px-md py-2.5 rounded-xl font-label-md text-label-md font-bold transition-all text-left ${
                activeTab === "risk"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
              <span>Risk & Safety</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-sm px-md py-2.5 rounded-xl font-label-md text-label-md font-bold transition-all text-left ${
                activeTab === "ai"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>AI Explanations</span>
            </button>

            <button
              onClick={() => setActiveTab("notification")}
              className={`flex items-center gap-sm px-md py-2.5 rounded-xl font-label-md text-label-md font-bold transition-all text-left ${
                activeTab === "notification"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span>Notifications</span>
            </button>

            {formSettings.updatedAt && (
              <div className="pt-sm mt-xs border-t border-outline-variant/10 px-sm text-[11px] text-on-surface-variant font-mono">
                Last updated: {new Date(formSettings.updatedAt).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="md:col-span-9 flex flex-col gap-xl">
            {activeTab === "similarity" && (
              <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-xl">
                <div className="flex items-center gap-xs pb-sm border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[22px]">compare</span>
                  <div>
                    <h2 className="font-title-lg text-title-lg text-on-background font-bold">Duplicate Similarity Thresholds</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Configure algorithm sensitivity for candidate pair detection and automated merge suggestions.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold">Candidate Similarity Threshold</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                        Minimum 7-signal composite score required to flag a product pair as a duplicate candidate in the pipeline.
                      </p>
                    </div>
                    <span className="font-headline-md text-headline-md font-extrabold text-primary">
                      {(formSettings.similarity.candidateThreshold * 100).toFixed(0)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formSettings.similarity.candidateThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormSettings({
                        ...formSettings,
                        similarity: { ...formSettings.similarity, candidateThreshold: val },
                      });
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between font-label-sm text-[11px] text-outline">
                    <span>Broad Detection (0%)</span>
                    <span>Standard (50%)</span>
                    <span>Strict (100%)</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-outline-variant/10" />

                <div className="flex flex-col gap-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold">Auto-Merge Recommendation Threshold</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                        Similarity score above which candidate pairs are designated as safe for automated deduplication.
                      </p>
                    </div>
                    <span className="font-headline-md text-headline-md font-extrabold text-secondary">
                      {(formSettings.similarity.autoMergeThreshold * 100).toFixed(0)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formSettings.similarity.autoMergeThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormSettings({
                        ...formSettings,
                        similarity: { ...formSettings.similarity, autoMergeThreshold: val },
                      });
                    }}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between font-label-sm text-[11px] text-outline">
                    <span>Low (0%)</span>
                    <span>Recommended (90%)</span>
                    <span>Identical (100%)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "risk" && (
              <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-xl">
                <div className="flex items-center gap-xs pb-sm border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-error text-[22px]">shield_with_heart</span>
                  <div>
                    <h2 className="font-title-lg text-title-lg text-on-background font-bold">Risk & Safety Thresholds</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Configure safety score boundaries for Critical, High, Medium, and mandatory operator inspection.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
                  <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-error font-bold uppercase">Critical Hazard</span>
                      <span className="px-sm py-0.5 rounded bg-error/15 text-error font-mono text-[11px] font-bold">
                        &ge; {formSettings.risk.criticalThreshold} pts
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      Severe conflict threshold (blocks automated merging).
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formSettings.risk.criticalThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setFormSettings({
                          ...formSettings,
                          risk: { ...formSettings.risk, criticalThreshold: val },
                        });
                      }}
                      className="px-sm py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 font-mono text-on-surface text-[13px] font-bold"
                    />
                  </div>

                  <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-tertiary font-bold uppercase">High Risk</span>
                      <span className="px-sm py-0.5 rounded bg-tertiary/15 text-tertiary font-mono text-[11px] font-bold">
                        &ge; {formSettings.risk.highThreshold} pts
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      High metadata discrepancies requiring inspection.
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formSettings.risk.highThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setFormSettings({
                          ...formSettings,
                          risk: { ...formSettings.risk, highThreshold: val },
                        });
                      }}
                      className="px-sm py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 font-mono text-on-surface text-[13px] font-bold"
                    />
                  </div>

                  <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-outline font-bold uppercase">Medium Risk</span>
                      <span className="px-sm py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-[11px] font-bold">
                        &ge; {formSettings.risk.mediumThreshold} pts
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      Moderate variations for routine verification.
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formSettings.risk.mediumThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setFormSettings({
                          ...formSettings,
                          risk: { ...formSettings.risk, mediumThreshold: val },
                        });
                      }}
                      className="px-sm py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 font-mono text-on-surface text-[13px] font-bold"
                    />
                  </div>
                </div>

                <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">Immediate Review Required Threshold</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                      Pairs with risk score at or above this threshold trigger immediate operator review warnings.
                    </p>
                  </div>
                  <div className="flex items-center gap-xs shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formSettings.risk.immediateReviewThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setFormSettings({
                          ...formSettings,
                          risk: { ...formSettings.risk, immediateReviewThreshold: val },
                        });
                      }}
                      className="w-20 px-sm py-1.5 rounded-xl bg-surface-container border border-outline-variant/20 font-mono text-on-surface text-[13px] font-bold text-center"
                    />
                    <span className="text-[12px] text-outline font-bold">pts</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-xl">
                <div className="flex items-center gap-xs pb-sm border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
                  <div>
                    <h2 className="font-title-lg text-title-lg text-on-background font-bold">AI Explanations & LLM Configuration</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Control natural language explanation generation and OpenAI model parameters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">psychology</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Enable AI Explanations</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Generate OpenAI explanations for duplicate matches and risk assessments.
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSettings.ai.enableAiExplanations}
                      onChange={(e) => {
                        setFormSettings({
                          ...formSettings,
                          ai: { ...formSettings.ai, enableAiExplanations: e.target.checked },
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant/30"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-outline font-semibold">AI Model Identifier</label>
                    <input
                      type="text"
                      value={formSettings.ai.aiModel}
                      onChange={(e) => {
                        setFormSettings({
                          ...formSettings,
                          ai: { ...formSettings.ai, aiModel: e.target.value },
                        });
                      }}
                      className="px-sm py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 font-mono text-body-sm text-on-surface font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <div className="flex justify-between items-center">
                      <label className="font-label-sm text-label-sm text-outline font-semibold">Sampling Temperature</label>
                      <span className="font-mono text-label-sm text-primary font-bold">
                        {formSettings.ai.temperature.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formSettings.ai.temperature}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormSettings({
                          ...formSettings,
                          ai: { ...formSettings.ai, temperature: val },
                        });
                      }}
                      className="w-full accent-primary cursor-pointer my-auto"
                    />
                  </div>
                </div>

                <div className="p-md rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 flex items-start gap-sm text-[12px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">lock</span>
                  <div>
                    <strong className="text-on-surface block mb-0.5">Security Notice</strong>
                    API Keys and secret tokens are securely loaded from backend server environment variables. Secrets are never persisted in the database or exposed to the client.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notification" && (
              <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-xl">
                <div className="flex items-center gap-xs pb-sm border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
                  <div>
                    <h2 className="font-title-lg text-title-lg text-on-background font-bold">Notification & Alert Channels</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Configure automated operator alerts when severe duplicate risks are detected.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-md">
                  <div className="flex items-center justify-between p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">mail</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-bold">Email Notifications</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Send email dispatches when critical hazards or high risks are identified.
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.notification.enableEmailNotifications}
                        onChange={(e) => {
                          setFormSettings({
                            ...formSettings,
                            notification: { ...formSettings.notification, enableEmailNotifications: e.target.checked },
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant/30"></div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-xs px-xs">
                    <label className="font-label-sm text-label-sm text-outline font-semibold">Notification Destination Email</label>
                    <input
                      type="email"
                      value={formSettings.notification.notificationEmail || ""}
                      onChange={(e) => {
                        setFormSettings({
                          ...formSettings,
                          notification: { ...formSettings.notification, notificationEmail: e.target.value },
                        });
                      }}
                      placeholder="e.g. alerts@productiq.internal"
                      className="px-sm py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 font-body-sm text-body-sm text-on-surface font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">webhook</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-bold">Slack Webhook Alerts</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Post automated alerts to Slack channel on critical risk events.
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.notification.enableSlackNotifications}
                        onChange={(e) => {
                          setFormSettings({
                            ...formSettings,
                            notification: { ...formSettings.notification, enableSlackNotifications: e.target.checked },
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant/30"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-md rounded-2xl bg-surface-container border border-outline-variant/10 shadow-sm sticky bottom-6">
              <div className="text-[12px] text-on-surface-variant">
                {isDirty ? (
                  <span className="text-tertiary font-bold flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-outline">All settings are up to date</span>
                )}
              </div>

              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={!isDirty || saving}
                  className="px-md py-2 rounded-xl bg-surface-container-high border border-outline-variant/10 text-on-surface font-label-md text-label-md font-bold hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Discard
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className="px-xl py-2 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-xs"
                >
                  {saving ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">save</span>
                  )}
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
