import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, ChevronDown, RefreshCw, Zap } from 'lucide-react';

export function Navbar() {
  const { user, switchPersona } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">GIGNET</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">Customer</span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-0.5 font-medium">Cooperative Workforce Network</p>
          </div>
        </div>

        {/* Demo Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 transition"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span className="max-w-[100px] truncate">{user?.fullName || 'Asha (Customer)'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                SIH 4-Laptop Demo Switch
              </div>
              <button
                onClick={() => { switchPersona('customer'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between text-emerald-700 font-semibold"
              >
                <span>Asha Sharma (Customer)</span>
                <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-suresh'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
              >
                <span>Suresh (Balanced Plumber)</span>
                <span className="text-[10px] text-slate-400">Worker</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-ramesh'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
              >
                <span>Ramesh (Overloaded)</span>
                <span className="text-[10px] text-slate-400">Worker</span>
              </button>
              <button
                onClick={() => { switchPersona('admin'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
              >
                <span>Vikram (Coop Admin)</span>
                <span className="text-[10px] text-slate-400">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
