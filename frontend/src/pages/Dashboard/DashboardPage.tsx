import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full gap-lg">
      {/* Header */}
      <div className="flex flex-col gap-xs mb-sm">
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Product Intelligence Overview</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Monitor catalog quality, duplicate detection, search relevance, and risk signals across the entire product ecosystem.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* KPI 1 */}
        <div
          onClick={() => navigate("/products")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Products</span>
            <span className="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">52,431</span>
            <div className="flex items-center text-secondary mb-xs bg-secondary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-label-sm text-label-sm ml-1">+2.4%</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => navigate("/duplicates")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Potential Duplicates</span>
            <span className="material-symbols-outlined text-outline text-[20px]">content_copy</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">3,821</span>
            <div className="flex items-center text-secondary mb-xs bg-secondary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              <span className="font-label-sm text-label-sm ml-1">-5.2%</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => navigate("/risk")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Risk Alerts</span>
            <span className="material-symbols-outlined text-outline text-[20px]">gpp_maybe</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">217</span>
            <div className="flex items-center text-error mb-xs bg-error/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-label-sm text-label-sm ml-1">+8.0%</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => navigate("/search")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Search Quality</span>
            <span className="material-symbols-outlined text-outline text-[20px]">search_check</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">87%</span>
            <div className="flex items-center text-secondary mb-xs bg-secondary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-label-sm text-label-sm ml-1">+1.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Catalog Health Chart (Spans 2 cols on lg) */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Catalog Health</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("7D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors ${
                  timeRange === "7D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange("30D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors ${
                  timeRange === "30D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeRange("90D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors ${
                  timeRange === "90D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                90D
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[250px]">
            {/* Line Chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              {/* Grid Lines */}
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="125" y2="125" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" x1="0" x2="1000" y1="275" y2="275" />

              {/* Line 1: Overall Quality */}
              <path
                className="text-primary"
                d="M0,250 C100,240 200,200 300,210 C400,220 500,150 600,160 C700,170 800,100 900,90 C950,85 1000,70 1000,70"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />

              {/* Line 2: Duplicates Found */}
              <path
                className="text-tertiary opacity-70"
                d="M0,150 C100,160 200,190 300,180 C400,170 500,210 600,200 C700,190 800,240 900,250 C950,255 1000,260 1000,260"
                fill="none"
                stroke="currentColor"
                strokeDasharray="4,4"
                strokeWidth="2"
              />

              {/* Area under primary line */}
              <path
                d="M0,250 C100,240 200,200 300,210 C400,220 500,150 600,160 C700,170 800,100 900,90 C950,85 1000,70 1000,70 L1000,300 L0,300 Z"
                fill="url(#gradientPrimary)"
                opacity="0.1"
              />

              <defs>
                <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop className="text-primary" offset="0%" stopColor="currentColor" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-center gap-xl mt-md">
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-body-sm font-body-sm text-on-surface-variant">Overall Quality Score</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-tertiary opacity-70"></div>
              <span className="text-body-sm font-body-sm text-on-surface-variant">Duplicates Detected</span>
            </div>
          </div>
        </div>

        {/* Detection Summary (Right Column) */}
        <div className="bg-surface-container-low rounded-xl p-md flex flex-col">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Detection Summary</h2>
          {/* Donut Chart Vis */}
          <div className="relative w-48 h-48 mx-auto mb-lg flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="12" />
              {/* False Positives (15%) */}
              <circle
                className="text-surface-variant"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset="213.52"
                strokeWidth="12"
              />
              {/* Confirmed (35%) */}
              <circle
                className="text-tertiary"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset="125.6"
                strokeWidth="12"
                style={{ transformOrigin: "50px 50px", transform: "rotate(54deg)" }}
              />
              {/* Potential (50%) */}
              <circle
                className="text-primary"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset="125.6"
                strokeWidth="12"
                style={{ transformOrigin: "50px 50px", transform: "rotate(180deg)" }}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="font-headline-xl text-headline-xl text-on-surface">3.8k</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Flags</span>
            </div>
          </div>
          {/* Legend List */}
          <div className="flex flex-col gap-sm mt-auto">
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-body-md font-body-md text-on-surface">Potential</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">1,910 (50%)</span>
            </div>
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                <span className="text-body-md font-body-md text-on-surface">Confirmed</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">1,337 (35%)</span>
            </div>
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                <span className="text-body-md font-body-md text-on-surface">False Positives</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">574 (15%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Recent Duplicate Reviews */}
        <div className="bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Duplicate Reviews</h3>
            <Link to="/duplicates" className="text-primary hover:text-primary-fixed transition-colors text-label-md font-label-md flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Product</th>
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Similarity</th>
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm">
                {/* Row 1 */}
                <tr
                  onClick={() => navigate("/duplicates/1")}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <td className="py-md px-xs">
                    <div className="flex items-center gap-sm">
                      <div
                        className="w-10 h-10 rounded bg-surface-container-highest flex-shrink-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARgHtoxylbEFFbFrx9LIJnBFZdWAWbiPZo8ejIbGwJTxdHlqLX6DuxO4PUkvUl5Q-NXv6XKvdIsxLfrFHJSfrpzHXb5AibS1hIsNflZF9xAaeyb8Ol1VdH5wtHQNB9yVQLvK4xTF-OpjNOZ9GpA2CnPX9CosMek6n1frypaQbkjrR385gkOebT0WQO6V2JrdOCDpB1EiYuojD3BSzAnYYC7loTh8Fvji-9EDbFZWSIeEdScIldd2_D')",
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-on-surface font-medium truncate">Logitech MX Master 3S</p>
                        <p className="text-on-surface-variant text-[12px] truncate">vs. Logi MX Master 3S Wireless</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-on-surface">98%</span>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-error h-full rounded-full" style={{ width: "98%" }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm">
                      Review
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr
                  onClick={() => navigate("/duplicates/1")}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <td className="py-md px-xs">
                    <div className="flex items-center gap-sm">
                      <div
                        className="w-10 h-10 rounded bg-surface-container-highest flex-shrink-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtqm_0oNlCLC4zD7ueoaLFEr7DIKe94qxvEz68wcckjeQ0HUCK8ymtW9s4jIbVsPZJXYkuNErdm2faPCNdkxWn9MXiFlVFaASRMQGIodtNqVH9XtNB1KQq11hYr67H3g43J_GkdgqpwYGa8sZQaCX9ijpg3ACrtBM6IGmvMsqRxmR8SwVltjXG7QS1rWuRq6Bkvwy6hjXGqiWAmEoNoHNUcy7HY41cLoOSMT3jQzLKqwfdMCD9Wyw2')",
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-on-surface font-medium truncate">Keychron K2 V2</p>
                        <p className="text-on-surface-variant text-[12px] truncate">vs. Keychron K2 RGB Hotswap</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-on-surface">85%</span>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-error/10 text-error font-label-sm text-label-sm">
                      Confirmed
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr
                  onClick={() => navigate("/duplicates/1")}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <td className="py-md px-xs">
                    <div className="flex items-center gap-sm">
                      <div
                        className="w-10 h-10 rounded bg-surface-container-highest flex-shrink-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA28BuqjGFMbDOcGxPNp2we2gqqkQsLm5HqV079ZWEl4ItBd0xSlDDmURIi4BMB5YJS7vndC6QMMZci0jooHwX2NqS-F0p_6xSFa5g7o5_tenmIc5Ki2EA2L-fIruoXUYC6lv4HQc-jsCdO8rGA5srOQNvv2O78Q3c3x58U6Ae70gcp3DIGj5qlkKZKQ4Hx88fLChtghGN4-_lpC6ME_DzsBAaRh0J5SwVxUYBmpxZHRTmlIds4j2FF')",
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-on-surface font-medium truncate">Sony WH-1000XM5</p>
                        <p className="text-on-surface-variant text-[12px] truncate">vs. Sony WH-1000XM4</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-on-surface">62%</span>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: "62%" }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">
                      Not Duplicate
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Risk Alerts</h3>
            <Link to="/risk" className="text-primary hover:text-primary-fixed transition-colors text-label-md font-label-md flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col gap-sm">
            {/* Alert 1 */}
            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">Suspicious Price Drop Anomaly</h4>
                  <span className="font-label-sm text-label-sm text-error bg-error/10 px-2 py-0.5 rounded">High Risk</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  SKU-90210 dropped price by 85% in 1 hour. Matches historical pattern for counterfeit seller takeovers.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>Score: 92/100</span>
                  <span>•</span>
                  <span>2 mins ago</span>
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-tertiary">policy</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">Prohibited Keyword Detected</h4>
                  <span className="font-label-sm text-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">Med Risk</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Listing "Magic Diet Pills" contains regulated health claims in product description.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>Score: 68/100</span>
                  <span>•</span>
                  <span>15 mins ago</span>
                </div>
              </div>
            </div>

            {/* Alert 3 */}
            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary">image_search</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">Stock Image Violation</h4>
                  <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded">Low Risk</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Primary image for SKU-4432 contains watermarks from external stock photo provider.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>Score: 45/100</span>
                  <span>•</span>
                  <span>1 hr ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Performance */}
      <div className="bg-surface-container-low rounded-xl p-md flex flex-col relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-center mb-lg relative z-10">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Search Performance</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Last 24 hours query analysis</p>
          </div>
          <Link
            to="/search"
            className="bg-primary hover:bg-inverse-primary text-on-primary font-label-md px-4 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
            Optimize Models
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative z-10">
          {/* Search Metric 1 */}
          <div className="flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Queries</span>
            <span className="font-headline-xl text-headline-xl text-on-surface">1.2M</span>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-secondary h-full rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
          {/* Search Metric 2 */}
          <div className="flex flex-col gap-sm border-l border-outline-variant/10 pl-lg">
            <span className="font-label-md text-label-md text-on-surface-variant">Zero-Result Rate</span>
            <span className="font-headline-xl text-headline-xl text-on-surface">4.2%</span>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-tertiary h-full rounded-full" style={{ width: "15%" }}></div>
            </div>
          </div>
          {/* Search Metric 3 */}
          <div className="flex flex-col gap-sm border-l border-outline-variant/10 pl-lg">
            <span className="font-label-md text-label-md text-on-surface-variant">Avg. Relevance Score</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface">0.89</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/ 1.0</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1 flex">
              <div className="bg-secondary h-full rounded-l-full" style={{ width: "89%" }}></div>
              <div className="bg-surface-variant h-full rounded-r-full" style={{ width: "11%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
