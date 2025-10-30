import React from "react";

const Medication = () => {
  return (
    <div className="layout-content-container flex flex-col max-w-[960px] w-full mx-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Medication
        </p>
      </div>

      <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Medication Summary
      </h2>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
          <p className="text-[#0d171b] text-base font-medium leading-normal">Upcoming Doses</p>
          <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">2</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
          <p className="text-[#0d171b] text-base font-medium leading-normal">Missed Doses (Last 7 Days)</p>
          <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">1</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
          <p className="text-[#0d171b] text-base font-medium leading-normal">Adherence Rate</p>
          <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">85%</p>
        </div>
      </div>

      <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Medicine History
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#cfdfe7] bg-slate-50">
          <table className="flex-1">
            <thead>
              <tr className="bg-slate-50">
                <th className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-120 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Medication
                </th>
                <th className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-240 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Dosage
                </th>
                <th className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-360 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Schedule
                </th>
                <th className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-480 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Adherence
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-t-[#cfdfe7]">
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d171b] text-sm font-normal leading-normal">
                  Amoxicillin
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-240 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  500mg
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-360 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  Twice daily
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
                  <div className="flex items-center gap-3">
                    <div className="w-[88px] overflow-hidden rounded-sm bg-[#cfdfe7]">
                      <div className="h-1 rounded-full bg-[#1193d4]" style={{ width: "85.2273%" }} />
                    </div>
                    <p className="text-[#0d171b] text-sm font-medium leading-normal">75</p>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-t-[#cfdfe7]">
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d171b] text-sm font-normal leading-normal">
                  Ibuprofen
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-240 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  200mg
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-360 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  As needed
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
                  <div className="flex items-center gap-3">
                    <div className="w-[88px] overflow-hidden rounded-sm bg-[#cfdfe7]">
                      <div className="h-1 rounded-full bg-[#1193d4]" style={{ width: "100%" }} />
                    </div>
                    <p className="text-[#0d171b] text-sm font-medium leading-normal">100</p>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-t-[#cfdfe7]">
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d171b] text-sm font-normal leading-normal">
                  Lisinopril
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-240 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  10mg
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-360 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  Once daily
                </td>
                <td className="table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
                  <div className="flex items-center gap-3">
                    <div className="w-[88px] overflow-hidden rounded-sm bg-[#cfdfe7]">
                      <div className="h-1 rounded-full bg-[#1193d4]" style={{ width: "56.8182%" }} />
                    </div>
                    <p className="text-[#0d171b] text-sm font-medium leading-normal">50</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <style>{`
          @container(max-width:120px){.table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-120{display: none;}}
          @container(max-width:240px){.table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-240{display: none;}}
          @container(max-width:360px){.table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-360{display: none;}}
          @container(max-width:480px){.table-9674bead-2a86-4a7a-9d19-8d2b6ba3277e-column-480{display: none;}}
        `}</style>
      </div>

      <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Add Medicine
      </h2>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d171b] text-base font-medium leading-normal pb-2">Medicine Name</p>
          <input
            placeholder="Enter medicine name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d171b] focus:outline-0 focus:ring-0 border-none bg-[#e7eff3] focus:border-none h-14 placeholder:text-[#4c809a] p-4 text-base font-normal leading-normal"
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d171b] text-base font-medium leading-normal pb-2">Dosage</p>
          <input
            placeholder="Enter dosage"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d171b] focus:outline-0 focus:ring-0 border-none bg-[#e7eff3] focus:border-none h-14 placeholder:text-[#4c809a] p-4 text-base font-normal leading-normal"
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d171b] text-base font-medium leading-normal pb-2">Schedule</p>
          <input
            placeholder="Enter schedule"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d171b] focus:outline-0 focus:ring-0 border-none bg-[#e7eff3] focus:border-none h-14 placeholder:text-[#4c809a] p-4 text-base font-normal leading-normal"
          />
        </label>
      </div>
      <div className="flex px-4 py-3 justify-end">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1193d4] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Add Medicine</span>
        </button>
      </div>

      <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Scheduled Medications
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#cfdfe7] bg-slate-50">
          <table className="flex-1">
            <thead>
              <tr className="bg-slate-50">
                <th className="table-8192464e-5364-4f92-ba42-934b9475523a-column-120 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Medication
                </th>
                <th className="table-8192464e-5364-4f92-ba42-934b9475523a-column-240 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Dosage
                </th>
                <th className="table-8192464e-5364-4f92-ba42-934b9475523a-column-360 px-4 py-3 text-left text-[#0d171b] w-[400px] text-sm font-medium leading-normal">
                  Schedule
                </th>
                <th className="table-8192464e-5364-4f92-ba42-934b9475523a-column-480 px-4 py-3 text-left text-[#0d171b] w-60 text-[#4c809a] text-sm font-medium leading-normal">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-t-[#cfdfe7]">
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d171b] text-sm font-normal leading-normal">
                  Metformin
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-240 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  500mg
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-360 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  Twice daily
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-480 h-[72px] px-4 py-2 w-60 text-[#4c809a] text-sm font-bold leading-normal tracking-[0.015em]">
                  Mark as Taken
                </td>
              </tr>
              <tr className="border-t border-t-[#cfdfe7]">
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-120 h-[72px] px-4 py-2 w-[400px] text-[#0d171b] text-sm font-normal leading-normal">
                  Aspirin
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-240 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  81mg
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-360 h-[72px] px-4 py-2 w-[400px] text-[#4c809a] text-sm font-normal leading-normal">
                  Once daily
                </td>
                <td className="table-8192464e-5364-4f92-ba42-934b9475523a-column-480 h-[72px] px-4 py-2 w-60 text-[#4c809a] text-sm font-bold leading-normal tracking-[0.015em]">
                  Mark as Missed
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <style>{`
          @container(max-width:120px){.table-8192464e-5364-4f92-ba42-934b9475523a-column-120{display: none;}}
          @container(max-width:240px){.table-8192464e-5364-4f92-ba42-934b9475523a-column-240{display: none;}}
          @container(max-width:360px){.table-8192464e-5364-4f92-ba42-934b9475523a-column-360{display: none;}}
          @container(max-width:480px){.table-8192464e-5364-4f92-ba42-934b9475523a-column-480{display: none;}}
        `}</style>
      </div>
    </div>
  );
};

export default Medication;
