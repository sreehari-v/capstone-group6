import React from 'react'

function Breaths() {
  return (
    <div className="flex flex-col max-w-[960px] flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Breath Tracking
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-stretch px-4 py-3">
        <div className="flex flex-1 gap-3 flex-wrap justify-start">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1193d4] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
            Start Tracking
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7eff3] text-[#0d171b] text-sm font-bold leading-normal tracking-[0.015em]">
            Guided Tracking
          </button>
        </div>
      </div>

      {/* Breathing Rate */}
      <h3 className="text-[#0d171b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Breathing Rate
      </h3>
      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2">
          <p className="text-[#0d171b] text-base font-medium leading-normal">
            Breathing Rate (BPM)
          </p>
          <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight truncate">
            16 BPM
          </p>
          <div className="flex gap-1">
            <p className="text-[#4c809a] text-base font-normal leading-normal">
              Last 7 Days
            </p>
            <p className="text-[#e73508] text-base font-medium leading-normal">-2%</p>
          </div>
          <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
            {/* Placeholder SVG / Chart */}
            <svg
              width="100%"
              height="148"
              viewBox="-3 0 478 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                fill="url(#paint0_linear)"
              ></path>
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                stroke="#4c809a"
                strokeWidth="3"
                strokeLinecap="round"
              ></path>
              <defs>
                <linearGradient id="paint0_linear" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e7eff3" />
                  <stop offset="1" stopColor="#e7eff3" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-around">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
                <p key={day} className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">{day}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* You can continue converting the remaining sections similarly */}
      {/* Breathing Consistency, Breathing Patterns, Improvement Over Time */}
    </div>
  );
}

export default Breaths;
