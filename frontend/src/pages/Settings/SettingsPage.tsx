import React, { useState } from "react";

export const SettingsPage: React.FC = () => {
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [selectedRiskAlert, setSelectedRiskAlert] = useState<"low" | "medium" | "high">("medium");
  const [aiExplanations, setAiExplanations] = useState(true);
  const [dataContribution, setDataContribution] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto space-y-xl mt-md">
      <div className="flex flex-col space-y-md">
        <h1 className="font-headline-xl text-headline-xl text-on-background">Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Manage your workspace preferences, detection parameters, and AI capabilities for ProductIQ.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-xl items-start">
        {/* Left Settings Nav (3 cols) */}
        <div className="col-span-12 md:col-span-3 flex flex-col space-y-sm sticky top-24">
          <a
            href="#general"
            onClick={() => setActiveSection("general")}
            className={`font-label-md text-label-md px-md py-sm rounded-xl transition-colors ${
              activeSection === "general" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            General
          </a>
          <a
            href="#thresholds"
            onClick={() => setActiveSection("thresholds")}
            className={`font-label-md text-label-md px-md py-sm rounded-xl transition-colors ${
              activeSection === "thresholds" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Detection Thresholds
          </a>
          <a
            href="#ai-settings"
            onClick={() => setActiveSection("ai-settings")}
            className={`font-label-md text-label-md px-md py-sm rounded-xl transition-colors ${
              activeSection === "ai-settings" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            AI Settings
          </a>
          <a
            href="#notifications"
            onClick={() => setActiveSection("notifications")}
            className={`font-label-md text-label-md px-md py-sm rounded-xl transition-colors ${
              activeSection === "notifications" ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Notifications
          </a>
        </div>

        {/* Right Settings Form (9 cols) */}
        <div className="col-span-12 md:col-span-9 flex flex-col space-y-xl pb-xl">
          {/* General Settings */}
          <section className="flex flex-col space-y-lg scroll-mt-24" id="general">
            <div className="flex flex-col space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-background">General</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Core configuration for your ProductIQ environment.</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-lg flex flex-col space-y-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="flex flex-col space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="workspaceName">
                    Workspace Name
                  </label>
                  <input
                    className="bg-surface border border-outline-variant rounded-xl px-sm py-sm font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    id="workspaceName"
                    type="text"
                    defaultValue="Acme Corp Global"
                  />
                </div>
                <div className="flex flex-col space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface" htmlFor="timezone">
                    Default Timezone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface border border-outline-variant rounded-xl px-sm py-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      id="timezone"
                      defaultValue="EST"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="CET">CET (Central European Time)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="language">
                  Interface Language
                </label>
                <div className="relative max-w-md">
                  <select
                    className="w-full bg-surface border border-outline-variant rounded-xl px-sm py-sm font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    id="language"
                    defaultValue="en"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Detection Thresholds */}
          <section className="flex flex-col space-y-lg scroll-mt-24" id="thresholds">
            <div className="flex flex-col space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-background">Detection Thresholds</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Configure sensitivity for duplicate and risk detection algorithms.</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-lg flex flex-col space-y-xl shadow-sm">
              <div className="flex flex-col space-y-md">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface">Similarity Match Threshold</label>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                      Determine the minimum confidence score required to flag products as potential duplicates.
                    </p>
                  </div>
                  <span className="font-headline-lg text-headline-lg text-primary" id="similarityValue">
                    {similarityThreshold}%
                  </span>
                </div>
                <div className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-hidden group">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary-container to-primary-container rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    style={{ width: `${similarityThreshold}%` }}
                  ></div>
                  <input
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="similaritySlider"
                    max="100"
                    min="50"
                    type="range"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline">
                  <span>Broad Match (50%)</span>
                  <span>Exact Match (100%)</span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-outline-variant/30"></div>
              <div className="flex flex-col space-y-md">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface">Auto-Merge Risk Alert</label>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
                      Require manual approval for auto-merge operations when risk level exceeds threshold.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-md">
                  <button
                    onClick={() => setSelectedRiskAlert("low")}
                    className={`rounded-xl p-md flex flex-col items-center space-y-sm transition-all focus:outline-none ${
                      selectedRiskAlert === "low"
                        ? "bg-secondary-container/20 border-2 border-secondary shadow-[0_4px_12px_rgba(78,222,163,0.1)]"
                        : "bg-surface border border-outline-variant hover:border-secondary hover:bg-secondary/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="font-label-sm text-label-sm text-on-surface">Low Risk</span>
                  </button>
                  <button
                    onClick={() => setSelectedRiskAlert("medium")}
                    className={`rounded-xl p-md flex flex-col items-center space-y-sm transition-all focus:outline-none ${
                      selectedRiskAlert === "medium"
                        ? "bg-tertiary-container/20 border-2 border-tertiary shadow-[0_4px_12px_rgba(255,185,95,0.1)] text-on-tertiary-container"
                        : "bg-surface border border-outline-variant hover:border-tertiary hover:bg-tertiary/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-tertiary">warning</span>
                    <span className="font-label-sm text-label-sm">Medium Risk</span>
                  </button>
                  <button
                    onClick={() => setSelectedRiskAlert("high")}
                    className={`rounded-xl p-md flex flex-col items-center space-y-sm transition-all focus:outline-none ${
                      selectedRiskAlert === "high"
                        ? "bg-error-container/20 border-2 border-error shadow-[0_4px_12px_rgba(255,180,171,0.1)]"
                        : "bg-surface border border-outline-variant hover:border-error hover:bg-error/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-error">gpp_bad</span>
                    <span className="font-label-sm text-label-sm text-on-surface">High Risk</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="flex flex-col space-y-lg scroll-mt-24" id="ai-settings">
            <div className="flex flex-col space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-background">AI & Intelligence</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Manage generative AI features and context integration.</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-lg flex flex-col space-y-md shadow-sm">
              <div className="flex items-center justify-between p-md bg-surface-container-high rounded-xl">
                <div className="flex items-center space-x-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Enable AI Explanations</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Generate plain-text summaries for complex duplicate matches and risk assessments.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={aiExplanations}
                    onChange={(e) => setAiExplanations(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-md bg-surface-container-high rounded-xl">
                <div className="flex items-center space-x-md">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">model_training</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Data Contribution</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Allow anonymized product data to improve base intelligence models.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={dataContribution}
                    onChange={(e) => setDataContribution(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="flex flex-col space-y-lg scroll-mt-24" id="notifications">
            <div className="flex flex-col space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-background">Notifications</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Configure platform alerting rules and frequency.</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-lg flex flex-col space-y-md shadow-sm">
              <div className="flex items-center justify-between p-md bg-surface-container-high rounded-xl">
                <div className="flex items-center space-x-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">notifications_active</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Critical Risk Alerts</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Instant email and webhook notifications for score &gt; 90.</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-outline-variant"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end space-x-md pt-md">
            <button className="px-md py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface bg-surface border border-outline-variant hover:bg-surface-container-high transition-colors">
              Discard Changes
            </button>
            <button className="px-md py-sm rounded-xl font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-fixed transition-colors shadow-md">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
