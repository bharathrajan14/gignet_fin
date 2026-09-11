import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, ChevronDown, Globe } from 'lucide-react';

export function Navbar() {
  const { user, switchPersona } = useAuth();
  const { language, setLanguage, toggleLanguage, isTamil } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-3 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-black">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">GIGNET</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">Customer</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">
              {isTamil ? 'கூட்டுறவு தொழிலாளர் வலையமைப்பு' : 'Cooperative Workforce Network'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reactive Language Switcher: English ↔ Tamil */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 px-2 py-1.5 rounded-xl text-xs font-bold text-slate-200 transition shadow-sm cursor-pointer active:scale-95"
            title="Toggle Language (English / தமிழ்)"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className={language === 'en' ? 'text-sky-400 font-extrabold' : 'text-slate-400'}>EN</span>
            <span className="text-slate-600 text-[10px]">|</span>
            <span className={language === 'ta' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>தமிழ்</span>
          </button>

          {/* Demo Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[100px] truncate">{user?.fullName || 'Asha (Customer)'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>


          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                SIH 4-Laptop Demo Switch
              </div>
              <button
                onClick={() => { switchPersona('customer'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-500/10 flex items-center justify-between text-emerald-400 font-semibold transition"
              >
                <span>Asha Sharma (Customer)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">Active</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-suresh'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 text-slate-300 flex items-center justify-between transition"
              >
                <span>Suresh (Balanced Plumber)</span>
                <span className="text-[10px] text-slate-500">WRK-101</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-ramesh'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 text-slate-300 flex items-center justify-between transition"
              >
                <span>Ramesh (Overloaded)</span>
                <span className="text-[10px] text-slate-500">WRK-102</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-priya'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 text-slate-300 flex items-center justify-between transition"
              >
                <span>Priya (Certified Electrician)</span>
                <span className="text-[10px] text-slate-500">WRK-104</span>
              </button>
              <button
                onClick={() => { switchPersona('worker-ananya'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 text-slate-300 flex items-center justify-between transition"
              >
                <span>Ananya (AC & HVAC Master)</span>
                <span className="text-[10px] text-slate-500">WRK-105</span>
              </button>
              <button
                onClick={() => { switchPersona('admin'); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 text-slate-300 flex items-center justify-between transition border-t border-slate-800/60 mt-1 pt-1.5"
              >
                <span>Vikram (Coop Admin)</span>
                <span className="text-[10px] text-amber-400 font-bold">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);
}

