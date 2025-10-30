import React from "react";

const StepTracking = () => {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden pt-24 md:pt-28">
      <div
        className="layout-container flex h-full grow flex-col"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="w-80 min-h-[700px]" />
            </div>
          </div>

          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72 scroll-mt-28">
                Step Tracking
              </h1>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Step Tracking Summary
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Daily Steps</p>
                <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">7,500</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Weekly Steps</p>
                <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">52,500</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Monthly Steps</p>
                <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">210,000</p>
              </div>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Step Tracking Data
            </h2>

            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#cfdfe7] p-6">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Daily Steps</p>
                <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight truncate">7,500</p>
                <div className="flex gap-1">
                  <p className="text-[#4c809a] text-base font-normal leading-normal">Today</p>
                  <p className="text-[#078836] text-base font-medium leading-normal">+10%</p>
                </div>

                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "100%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Mon</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "80%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Tue</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "30%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Wed</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "10%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Thu</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "20%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Fri</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "20%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Sat</p>
                  <div className="border-[#4c809a] bg-[#e7eff3] border-t-2 w-full" style={{ height: "70%" }} />
                  <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Sun</p>
                </div>
              </div>

              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#cfdfe7] p-6">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Weekly Steps</p>
                <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight truncate">52,500</p>
                <div className="flex gap-1">
                  <p className="text-[#4c809a] text-base font-normal leading-normal">This Week</p>
                  <p className="text-[#078836] text-base font-medium leading-normal">+5%</p>
                </div>

                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                  <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)" />
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#4c809a" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e7eff3" />
                        <stop offset="1" stopColor="#e7eff3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="flex justify-around">
                    <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Week 1</p>
                    <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Week 2</p>
                    <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Week 3</p>
                    <p className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">Week 4</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Distance and Calories
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Distance Covered</p>
                <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">5.2 km</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
                <p className="text-[#0d171b] text-base font-medium leading-normal">Calories Burned</p>
                <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">350 kcal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StepTracking;
