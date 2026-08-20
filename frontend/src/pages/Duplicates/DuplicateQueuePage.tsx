import React from "react";
import { useNavigate } from "react-router-dom";

export const DuplicateQueuePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: "8s" }}></div>

      <div className="flex flex-col gap-lg z-10">
        <header className="flex flex-col gap-xs mb-md">
          <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight">Duplicate Detection</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Review products that may represent the same catalog item.
          </p>
        </header>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col p-md bg-surface-container rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Potential</span>
              <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">find_in_page</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">3,821</span>
            <div className="mt-xs font-body-sm text-body-sm text-tertiary">+142 since last week</div>
          </div>

          <div className="flex flex-col p-md bg-surface-container rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Confirmed</span>
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">done_all</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">2,940</span>
            <div className="mt-xs font-body-sm text-body-sm text-secondary">85% auto-merged</div>
          </div>

          <div className="flex flex-col p-md bg-primary-container rounded-2xl shadow-md hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-widest">Under Review</span>
              <div className="w-8 h-8 rounded-full bg-on-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[18px] animate-spin" style={{ animationDuration: "4s" }}>sync</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-primary-container">881</span>
            <div className="mt-xs font-body-sm text-body-sm text-on-primary-container/80">Require manual intervention</div>
          </div>
        </div>

        {/* Filter and Actions Section */}
        <section className="flex flex-col gap-sm mt-md">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-surface-container p-md rounded-2xl shadow-sm gap-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
              <div className="flex flex-wrap gap-sm">
                <div className="bg-surface px-sm py-xs rounded-lg flex items-center gap-xs cursor-pointer hover:bg-surface-bright transition-colors">
                  <span className="font-label-sm text-label-sm text-on-surface">Similarity: &gt;90%</span>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
                </div>
                <div className="bg-surface px-sm py-xs rounded-lg flex items-center gap-xs cursor-pointer hover:bg-surface-bright transition-colors">
                  <span className="font-label-sm text-label-sm text-on-surface">Brand: All</span>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
                </div>
                <div className="bg-surface px-sm py-xs rounded-lg flex items-center gap-xs cursor-pointer hover:bg-surface-bright transition-colors">
                  <span className="font-label-sm text-label-sm text-on-surface">Category: Electronics</span>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-sm">
              <button className="bg-surface text-on-surface px-md py-sm rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors border border-outline-variant/30 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">download</span> Export
              </button>
              <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Auto-Resolve &gt;98%
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b border-surface-container-lowest">
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Product A</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Product B</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold text-center">AI Confidence</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Match Signals</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {/* Row 1 */}
                  <tr
                    onClick={() => navigate("/duplicates/1")}
                    className="border-b border-surface-container-lowest hover:bg-surface transition-colors group cursor-pointer"
                  >
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <div
                          className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjt0W3864e6ldM4wSeXybh6HRezB4GT9NCXhcmzZI2W0KzADbRJCoCLdb34yC5AiwsjpGChfDoYw4x3oL8wly0257UOuHuUcHLezF30ZE8PiZ8rEhntSS_JK1PwvCapDa5ScyRRvqK-f4qobq_Uy6AkTEbSRSYzW27RitVWFdwOv-6Tnu_E58TMyehjpq6hvs0nuNNrHGXDZ5rpKtpbLAcwCLRMgUWWpCPgCz0gSOzRgMjchr4Kf-B')",
                          }}
                        ></div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface truncate w-48" title="Sony WH-1000XM5 Wireless Headphones">
                            Sony WH-1000XM5...
                          </div>
                          <div className="text-on-surface-variant text-[12px] font-mono mt-xs">SKU: SNY-XM5-BLK</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <div
                          className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwkfFXqMML152XrLbavxRLGUFvBeLMeF0b7nCC4TxeMnH_cVWLcyQZG_lCzz3lNgiRqhJB4E9yNz1FNOvzTgbitxA9dD9d9769FipyFSp3gp5sTim_xYVbskPMKpyZ7x0iT70Q-rdu6ab_N2wOMTfbS82U3VRItcYVsCMfetL7qx9ElOafZNfvRM6gZ2CnPS1FZgHX7x_VztfmSoBy2FCGANV3GIUJSCRtLlZoJFCEoCWZ3JJBQl5V')",
                          }}
                        ></div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface truncate w-48" title="Sony WH1000XM5 Black Over-Ear">
                            Sony WH1000XM5 Blk...
                          </div>
                          <div className="text-on-surface-variant text-[12px] font-mono mt-xs">SKU: 9021-SNY</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-md text-center align-middle">
                      <div className="inline-flex items-center justify-center relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                          <circle
                            className="text-primary transition-all duration-1000"
                            cx="24"
                            cy="24"
                            fill="transparent"
                            r="20"
                            stroke="currentColor"
                            strokeDasharray="125.6"
                            strokeDashoffset="3.76"
                            strokeWidth="4"
                          ></circle>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm text-on-surface">97%</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex flex-wrap gap-xs max-w-xs">
                        <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded text-[10px] font-label-sm flex items-center gap-[2px]">
                          Brand <span className="material-symbols-outlined text-[12px]">check</span>
                        </span>
                        <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded text-[10px] font-label-sm flex items-center gap-[2px]">
                          Model <span className="material-symbols-outlined text-[12px]">check</span>
                        </span>
                        <span className="bg-surface text-on-surface-variant px-2 py-1 rounded text-[10px] font-mono">Sem: 94%</span>
                        <span className="bg-surface text-on-surface-variant px-2 py-1 rounded text-[10px] font-mono">Img: 91%</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container/20 text-on-tertiary-container font-label-sm text-[11px] gap-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Under Review
                      </span>
                    </td>
                    <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" title="Reject Match">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                        <button className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors" title="Confirm Match">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr
                    onClick={() => navigate("/duplicates/1")}
                    className="border-b border-surface-container-lowest hover:bg-surface transition-colors group cursor-pointer"
                  >
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <div
                          className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAdTe2gBhchg8pjP8PMp-rZdC0vxmB7uFDEPd8sVBdJwskhzaQqLyyJD6MEG_1ID0Igt_z-MxxWqkwhQwmEYfzIM5IKqbKMiTr6vreKwjKNVlJoYYG55ijG_Vi6n2jw0LMvOBAFA_B45-P4PxAAsie7SPCsE5h6Fy0FqU1TDX8x4JWR5ZgsxJraCBz1uaRgTj8wGyHXE3I5ELnrT9MRpVnsbQvGWYVRSpFNhCIsdJDrUUkKtDk2Nhtm')",
                          }}
                        ></div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface truncate w-48" title="Breville Barista Express Espresso Machine">
                            Breville Barista Exp...
                          </div>
                          <div className="text-on-surface-variant text-[12px] font-mono mt-xs">SKU: BES870XL</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <div
                          className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPigB4IvpKICmsOilJbjeiFSTlPU2ADbYAeL9xk01Gd_eMuPWKA6RPJb9nBXokyK_Zl7qMfwSd14clls0qNtvBe4fE0swnKVx0Hp7LgalvMd-ukrgYra5GnR7J5ZOyvCbPYc7OXXc40gJ5-Qza1TQG5Oi1DecAX85aHInD0onWdVcvSZQijbeXmNXm19ri5QZSPL41EHKzTiRieg7Kgp1rjLYEvfAncG-5I-6yewqGrB9C1ATQCeco')",
                          }}
                        ></div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface truncate w-48" title="Breville Espresso Maker BES870">
                            Breville Espresso Maker...
                          </div>
                          <div className="text-on-surface-variant text-[12px] font-mono mt-xs">SKU: BRV-870-SS</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-md text-center align-middle">
                      <div className="inline-flex items-center justify-center relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                          <circle
                            className="text-primary transition-all duration-1000"
                            cx="24"
                            cy="24"
                            fill="transparent"
                            r="20"
                            stroke="currentColor"
                            strokeDasharray="125.6"
                            strokeDashoffset="13.8"
                            strokeWidth="4"
                          ></circle>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm text-on-surface">89%</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex flex-wrap gap-xs max-w-xs">
                        <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded text-[10px] font-label-sm flex items-center gap-[2px]">
                          Brand <span className="material-symbols-outlined text-[12px]">check</span>
                        </span>
                        <span className="bg-surface text-on-surface-variant px-2 py-1 rounded text-[10px] font-mono">Mod: 78%</span>
                        <span className="bg-surface text-on-surface-variant px-2 py-1 rounded text-[10px] font-mono">Sem: 91%</span>
                        <span className="bg-surface text-on-surface-variant px-2 py-1 rounded text-[10px] font-mono">Img: 89%</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container/20 text-on-tertiary-container font-label-sm text-[11px] gap-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Under Review
                      </span>
                    </td>
                    <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" title="Reject Match">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                        <button className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors" title="Confirm Match">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-sm flex justify-center bg-surface-container-high border-t border-surface-container-lowest">
              <button className="text-primary hover:text-primary-fixed font-label-sm text-label-sm flex items-center gap-xs transition-colors">
                Load More <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
