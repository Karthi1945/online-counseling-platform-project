import React from "react";
import { User, ShieldAlert, Award, ArrowLeftRight } from "lucide-react";

export default function RoleSelector({
  currentRole,
  selectedCounselorId,
  counselors,
  onRoleChange,
}) {
  return (
    <div id="role-selector-banner" className="bg-slate-900 text-slate-100 border-b border-slate-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="font-mono text-[11px] text-slate-300 flex items-center gap-2">
            <ShieldAlert size={14} className="text-indigo-400" />
            <span className="tracking-wide">SECURITY VAULT PORTAL REGISTER</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <span className="text-slate-400 text-[11px] font-mono tracking-wider">WORKSPACE MODE:</span>
          
          {/* Client Option */}
          <button
            id="role-switch-client"
            onClick={() => onRoleChange("client")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all text-xs duration-200 ${
              currentRole === "client"
                ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500"
                : "bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white"
            }`}
          >
            <User size={13} />
            <span>Consultant: Alex Mercer</span>
          </button>
 
          <div className="text-slate-750 flex items-center justify-center font-mono">
            <ArrowLeftRight size={11} />
          </div>
 
          {/* Counselor Trigger Dropdown */}
          <div className="relative flex items-center">
            <select
              id="role-switch-counselor-select"
              value={currentRole === "counselor" ? selectedCounselorId : ""}
              onChange={(e) => {
                if (e.target.value) {
                  onRoleChange("counselor", e.target.value);
                }
              }}
              className="appearance-none bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white pl-4 pr-9 py-1.5 rounded-xl font-bold font-sans cursor-pointer transition-all border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-200"
            >
              <option value="" disabled className="text-slate-400">Select Provider Login...</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-200 bg-slate-800">
                  {c.name.split(",")[0]} ({c.serviceType})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400">
              <Award size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
