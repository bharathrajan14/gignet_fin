import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, Radio, ChevronDown, User, Globe } from 'lucide-react';

export function Navbar() {
  const { adminUser, switchAdminPersona } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-3.5 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">GIGNET FEDERATION</span>
              <span className="text-[10px] font-black uppercase bg-sky-950 text-sky-400 px-2 py-0.5 rounded-full border border-sky-800">
                Operations & Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Bengaluru South Labour Welfare Society (COOP_BLR_01)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Cloud Run Socket Status */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-emerald-400">Live Socket.IO Sync</span>
          </div>

          {/* Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-white transition"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>{adminUser?.fullName || 'Vikram (Coop Admin)'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="px-3.5 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Admin Persona Switch
                </div>
                <button
                  onClick={() => { switchAdminPersona('admin'); setDropdownOpen(false); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-sky-400 font-bold flex justify-between items-center"
                >
                  <span>Vikram (Coop Admin)</span>
                  <span className="text-[10px] bg-sky-950 px-1.5 py-0.5 rounded text-sky-300">Active</span>
                </button>
                <button
                  onClick={() => { switchAdminPersona('federation'); setDropdownOpen(false); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 flex justify-between items-center"
                >
                  <span>Dr. Rajeshwari (Federation)</span>
                  <span className="text-[10px] text-slate-400">State Fed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
