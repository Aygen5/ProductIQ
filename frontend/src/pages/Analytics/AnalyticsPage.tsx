import React from "react";

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-lg w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-background">Analytics</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Understand catalog quality, detection performance, and search behavior.
          </p>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {/* Catalog Health Card */}
          <section className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container rounded-xl p-md flex flex-col gap-md shadow-sm">
            <header className="flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface">Catalog Health</h2>
              <div className="flex gap-sm">
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Total Products
                </span>
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-error/10 text-error font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  Duplicate Rate
                </span>
              </div>
            </header>
            <div className="relative w-full h-64 bg-surface-container-low rounded-lg overflow-hidden flex items-end">
              {/* Line Chart SVG */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid Lines */}
                <line className="text-outline-variant/20" stroke="currentColor" strokeWidth="0.5" x1="0" x2="100" y1="20" y2="20"></line>
                <line className="text-outline-variant/20" stroke="currentColor" strokeWidth="0.5" x1="0" x2="100" y1="40" y2="40"></line>
                <line className="text-outline-variant/20" stroke="currentColor" strokeWidth="0.5" x1="0" x2="100" y1="60" y2="60"></line>
                <line className="text-outline-variant/20" stroke="currentColor" strokeWidth="0.5" x1="0" x2="100" y1="80" y2="80"></line>
                {/* Total Products Line */}
                <path className="text-primary/10" d="M0,80 Q20,70 40,50 T80,30 L100,20 L100,100 L0,100 Z" fill="currentColor"></path>
                <path
                  className="text-primary"
                  d="M0,80 Q20,70 40,50 T80,30 L100,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                ></path>
                {/* Duplicate Rate Line */}
                <path
                  className="text-error"
                  d="M0,90 Q20,85 40,75 T80,85 L100,95"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                ></path>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-md mt-sm">
              <div className="flex flex-col gap-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">Total Indexed</span>
                <span className="font-headline-lg text-headline-lg text-on-surface">1,245,892</span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">Current Duplication</span>
                <span className="font-headline-lg text-headline-lg text-error">4.2%</span>
              </div>
            </div>
          </section>

          {/* Detection Performance Card */}
          <section className="col-span-1 bg-surface-container rounded-xl p-md flex flex-col gap-md shadow-sm">
            <header>
              <h2 className="font-headline-md text-headline-md text-on-surface">Detection Specs</h2>
            </header>
            <div className="flex flex-col gap-md flex-1 justify-center">
              {/* Precision */}
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant">Precision</span>
                  <span className="font-label-md text-label-md text-on-surface">94%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[94%] rounded-full"></div>
                </div>
              </div>
              {/* Recall */}
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant">Recall</span>
                  <span className="font-label-md text-label-md text-on-surface">88%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-[88%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-sm bg-surface-container-low p-sm rounded-lg">
              <div className="flex-1 text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Confirmed</div>
                <div className="font-headline-md text-headline-md text-secondary">8,432</div>
              </div>
              <div className="w-px bg-outline-variant/20 mx-xs"></div>
              <div className="flex-1 text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">False Pos</div>
                <div className="font-headline-md text-headline-md text-on-surface">142</div>
              </div>
            </div>
          </section>

          {/* Search Performance Card */}
          <section className="col-span-1 lg:col-span-3 bg-surface-container rounded-xl p-md flex flex-col gap-md shadow-sm">
            <header className="flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface">Search Query Analytics</h2>
              <span className="font-label-md text-label-md text-on-surface-variant">Last 30 Days</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-md">
              {/* Main Chart Area */}
              <div className="lg:col-span-3 relative h-48 bg-surface-container-low rounded-lg p-sm flex items-end gap-2">
                {/* Bar Chart */}
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[60%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Mon
                  </div>
                </div>
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[75%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Tue
                  </div>
                </div>
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[40%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Wed
                  </div>
                </div>
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[90%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Thu
                  </div>
                </div>
                <div className="flex-1 bg-error/40 hover:bg-error/60 transition-colors rounded-t-sm h-[30%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm text-error transition-opacity">
                    Fri (Failures)
                  </div>
                </div>
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[85%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Sat
                  </div>
                </div>
                <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm h-[65%] relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-label-sm text-label-sm transition-opacity">
                    Sun
                  </div>
                </div>
              </div>
              {/* Key Metrics */}
              <div className="flex flex-col gap-sm justify-center">
                <div className="bg-surface-container-low p-sm rounded-lg flex flex-col gap-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg Relevance Score</span>
                  <span className="font-headline-lg text-headline-lg text-secondary">0.92</span>
                </div>
                <div className="bg-surface-container-low p-sm rounded-lg flex flex-col gap-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Zero-Result Rate</span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">1.8%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Top Queries Table */}
          <section className="col-span-1 lg:col-span-3 bg-surface-container rounded-xl shadow-sm overflow-hidden flex flex-col">
            <header className="p-md flex justify-between items-center bg-surface-container">
              <h2 className="font-headline-md text-headline-md text-on-surface">Top Search Queries</h2>
              <button className="px-md py-sm bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors">
                Export CSV
              </button>
            </header>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="p-sm pl-md font-semibold">Query String</th>
                    <th className="p-sm font-semibold">Volume</th>
                    <th className="p-sm font-semibold">Avg Relevance</th>
                    <th className="p-sm pr-md font-semibold text-right">Failure Rate</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface">
                  <tr className="border-t border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm pl-md font-mono text-primary">"iphone 14 pro max 256gb"</td>
                    <td className="p-sm">12,450</td>
                    <td className="p-sm">
                      <div className="flex items-center gap-xs">
                        <span className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                          <span className="h-full bg-secondary w-[98%]"></span>
                        </span>
                        <span>0.98</span>
                      </div>
                    </td>
                    <td className="p-sm pr-md text-right text-on-surface-variant">0.1%</td>
                  </tr>
                  <tr className="border-t border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm pl-md font-mono text-primary">"nike air max 97 mens"</td>
                    <td className="p-sm">8,920</td>
                    <td className="p-sm">
                      <div className="flex items-center gap-xs">
                        <span className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                          <span className="h-full bg-secondary w-[85%]"></span>
                        </span>
                        <span>0.85</span>
                      </div>
                    </td>
                    <td className="p-sm pr-md text-right text-on-surface-variant">2.4%</td>
                  </tr>
                  <tr className="border-t border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm pl-md font-mono text-primary">"rtx 4090 ti"</td>
                    <td className="p-sm">5,102</td>
                    <td className="p-sm">
                      <div className="flex items-center gap-xs">
                        <span className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                          <span className="h-full bg-error w-[45%]"></span>
                        </span>
                        <span className="text-error">0.45</span>
                      </div>
                    </td>
                    <td className="p-sm pr-md text-right text-error font-medium">18.2%</td>
                  </tr>
                  <tr className="border-t border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm pl-md font-mono text-primary">"sony wh-1000xm5"</td>
                    <td className="p-sm">4,833</td>
                    <td className="p-sm">
                      <div className="flex items-center gap-xs">
                        <span className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                          <span className="h-full bg-secondary w-[92%]"></span>
                        </span>
                        <span>0.92</span>
                      </div>
                    </td>
                    <td className="p-sm pr-md text-right text-on-surface-variant">1.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
