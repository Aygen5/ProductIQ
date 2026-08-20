import React, { useState } from "react";

export const RiskAnalysisPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-error/5 via-transparent to-transparent pointer-events-none -mt-20"></div>

      {/* Header with Risk KPI cards */}
      <div className="flex flex-col lg:flex-row gap-lg mb-xl mt-lg relative">
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-base">Risk Detection</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Review listings that may require additional investigation.
          </p>
        </div>
        <div className="flex flex-wrap gap-md shrink-0">
          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between shadow-sm relative overflow-hidden group min-w-[140px]">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-error/10 rounded-full blur-xl group-hover:bg-error/20 transition-colors"></div>
            <div className="flex items-center gap-base mb-lg">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">High Risk</span>
            </div>
            <div className="font-headline-xl text-headline-xl text-error">42</div>
          </div>

          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between shadow-sm relative overflow-hidden group min-w-[140px]">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-tertiary/10 rounded-full blur-xl group-hover:bg-tertiary/20 transition-colors"></div>
            <div className="flex items-center gap-base mb-lg">
              <span className="material-symbols-outlined text-tertiary text-[20px]">error</span>
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Medium Risk</span>
            </div>
            <div className="font-headline-xl text-headline-xl text-tertiary">115</div>
          </div>

          <div className="bg-surface-container rounded-xl p-md flex flex-col justify-between shadow-sm relative overflow-hidden group min-w-[140px]">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-colors"></div>
            <div className="flex items-center gap-base mb-lg">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Low Risk</span>
            </div>
            <div className="font-headline-xl text-headline-xl text-secondary">60</div>
          </div>
        </div>
      </div>

      {/* Main Table and Drawer */}
      <div className="flex gap-lg relative">
        <div className="flex-1 bg-surface-container rounded-xl shadow-md overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-md bg-surface-container-high border-b border-outline-variant/10 flex justify-between items-center">
            <div className="font-label-md text-label-md text-on-surface">Flagged Listings</div>
            <div className="flex gap-sm">
              <button className="px-sm py-base bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors rounded-lg font-label-sm text-label-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filter
              </button>
              <button className="px-sm py-base bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors rounded-lg font-label-sm text-label-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high z-10 border-b border-outline-variant/10">
                <tr>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap">Product</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap">Seller</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap">Risk Score</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap">Level</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Signals</th>
                  <th className="p-md font-label-sm text-label-sm text-outline uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr
                  onClick={() => setDrawerOpen(true)}
                  className="hover:bg-surface-container-high/50 transition-colors border-b border-outline-variant/5 cursor-pointer group"
                >
                  <td className="p-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded bg-surface-container-highest overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                          alt="Sony Alpha a7 IV Mirrorless"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVaidFFneiA26fE_9zOyq2WrkDx20is6aqzcnEFIn8RREiBE7soZuTblOKKcMYNIg9M7WfMysdPgbgZBHWZ3Wxxf_Es_0qSQVV2Afznj5jf23jftpHnsgfHBcDBJQjj4nEVlTmLYTygFFvyj64xWnMo7uDLMeGWCmnlN8CGOYZzmXqXFjjSRSDoOcflHHUVilOAq1BCxMsSbBsl2JrTAlPGoVi89U3-h8Dtr0Sp9KFoecRJQPlpHEw"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate">Sony Alpha a7 IV Mirrorless</p>
                        <p className="font-body-sm text-[12px] text-outline truncate">SKU: SNY-A7IV-001</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-md">
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">ElectroDeals_Pro</p>
                    <p className="font-body-sm text-[12px] text-error truncate">Joined 2 days ago</p>
                  </td>
                  <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">
                    $450.00 <span className="text-error ml-xs">(-80%)</span>
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-sm">
                      <span className="font-headline-md text-headline-md text-error">94</span>
                      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden w-16">
                        <div className="h-full bg-error" style={{ width: "94%" }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-md">
                    <span className="inline-flex items-center px-sm py-xs rounded-full bg-error/10 text-error font-label-sm text-[10px] uppercase tracking-wider">
                      High
                    </span>
                  </td>
                  <td className="p-md">
                    <div className="flex flex-wrap gap-xs">
                      <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] rounded">
                        Unusually low price
                      </span>
                      <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] rounded">
                        New seller
                      </span>
                      <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] rounded">
                        Stock anomaly
                      </span>
                    </div>
                  </td>
                  <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr
                  onClick={() => setDrawerOpen(true)}
                  className="hover:bg-surface-container-high/50 transition-colors border-b border-outline-variant/5 cursor-pointer group"
                >
                  <td className="p-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded bg-surface-container-highest overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                          alt="MacBook Pro 16 M3 Max"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Eu3gpLQmTHLxS34WEViQt3W2DqLmhsQRDiRpp5LsIPqKlL2_DNoFHXSG_IBTjoIElg3F-I0xttenxNKppo2hV6zMe9qtz3-Yo_His2mcN0GKb5_fsebvXD-MksNIRjMXHgmWCxM5SmQg2bmXbZIaVu5Obzlr294xvNcTsBIaD-PDuud23S3GCit50rBMSXIKzEqxCJZISG4LRvGCJUmM_gzldQbncliVY05Jiv1jNJC2qaArzk-N"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate">MacBook Pro 16" M3 Max</p>
                        <p className="font-body-sm text-[12px] text-outline truncate">SKU: MAC-BP16-M3M</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-md">
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">TechReseller_NYC</p>
                    <p className="font-body-sm text-[12px] text-outline truncate">Active 3 years</p>
                  </td>
                  <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">
                    $2,100.00 <span className="text-tertiary ml-xs">(-40%)</span>
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-sm">
                      <span className="font-headline-md text-headline-md text-tertiary">72</span>
                      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden w-16">
                        <div className="h-full bg-tertiary" style={{ width: "72%" }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-md">
                    <span className="inline-flex items-center px-sm py-xs rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[10px] uppercase tracking-wider">
                      Medium
                    </span>
                  </td>
                  <td className="p-md">
                    <div className="flex flex-wrap gap-xs">
                      <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] rounded">
                        Description mismatch
                      </span>
                      <span className="px-sm py-[2px] bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] rounded">
                        Volume spike
                      </span>
                    </div>
                  </td>
                  <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis Drawer */}
        <div
          className={`w-96 bg-surface-container rounded-xl shadow-xl border border-outline-variant/20 flex flex-col shrink-0 transition-all duration-300 transform absolute right-0 top-0 bottom-0 z-20 h-full ${
            drawerOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-[110%] opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-md border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-high/50">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">temp_preferences_custom</span>
              <span className="font-label-md text-label-md text-on-surface">AI Analysis</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="p-md overflow-y-auto flex-1">
            <div className="flex items-start gap-md mb-lg">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover mix-blend-luminosity"
                  alt="Sony Alpha a7 IV Mirrorless"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt_nTnob6NEzaQez_g7mvV7RJRHNr4FqjU1VNq9OYJBBL5uJl-48J6VzhdTRYFvVmM_aH8y2fdIIuhOCFlp80imqt-ZxIc3z7ki2EZUsg2G5Oc1BSHlIYDp4sm0bdomF3if__kaQm0CTWDMBgGqLDztWM98uJ10_ZSvNvrCW-7MvgTCbi8IGBB6j-9pkx1rnh__yAZN6MM105_Un0yKrOtwgImfmQ1-22wjUM91b6v7v4ro2Z3nhkK"
                />
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-xs">Sony Alpha a7 IV Mirrorless</h3>
                <p className="font-body-sm text-[12px] text-outline mb-sm">Seller: ElectroDeals_Pro</p>
                <div className="flex items-center gap-xs text-error">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="font-label-sm text-[10px] uppercase tracking-wider">Critical Risk (94/100)</span>
                </div>
              </div>
            </div>
            <div className="space-y-md">
              <div>
                <div className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Key Findings</div>
                <div className="bg-error/5 border border-error/20 rounded-lg p-sm space-y-sm">
                  <div className="flex gap-sm">
                    <span className="material-symbols-outlined text-error text-[16px] shrink-0 mt-xs">trending_down</span>
                    <p className="font-body-sm text-[13px] text-on-surface-variant">
                      Price is <strong className="text-on-surface">80% below</strong> the historical market average ($2,498.00) for this specific SKU.
                    </p>
                  </div>
                  <div className="flex gap-sm">
                    <span className="material-symbols-outlined text-error text-[16px] shrink-0 mt-xs">person_alert</span>
                    <p className="font-body-sm text-[13px] text-on-surface-variant">
                      Seller account created <strong className="text-on-surface">48 hours ago</strong> with no prior sales history.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Recommended Action</div>
                <p className="font-body-sm text-[13px] text-on-surface-variant mb-md">
                  High probability of fraudulent listing or counterfeit goods. Immediate suspension of listing recommended pending seller verification.
                </p>
                <div className="flex gap-sm">
                  <button className="flex-1 bg-error text-on-error hover:bg-error/90 transition-colors py-sm px-md rounded-lg font-label-md text-label-md text-center">
                    Suspend Listing
                  </button>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="px-md py-sm rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors font-label-md text-label-md"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
