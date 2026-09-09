import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, MapPin, Phone, Award, LogOut, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { user, switchPersona } = useAuth();

  return (
    <div className="p-4 pb-24 space-y-4 text-slate-100">
      {/* Profile Card */}
      <div className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 rounded-full mx-auto flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-emerald-500/20">
          {user?.fullName?.charAt(0) || 'A'}
        </div>
        <div>
          <h2 className="font-extrabold text-base text-white">{user?.fullName || 'Asha Sharma'}</h2>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
            Verified Resident Citizen
          </span>
        </div>
      </div>

      {/* Society Affiliation */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 text-white rounded-2xl p-4 border border-emerald-800/40 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-black uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Cooperative Governance
        </div>
        <h4 className="font-black text-sm text-white">Bengaluru South Labour Welfare Society</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          15% of all service payments contribute directly to the local cooperative worker emergency fund and healthcare reserve.
        </p>
      </div>

      {/* Demo Switcher Quick Links */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-md space-y-2.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">SIH 4-Laptop Demo Personas</h3>
        
        <button
          onClick={() => switchPersona('customer')}
          className="w-full text-left p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 flex justify-between items-center text-xs font-bold text-emerald-300 transition"
        >
          <span>Asha Sharma (Customer)</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black">Active</span>
        </button>

        <button
          onClick={() => switchPersona('worker-suresh')}
          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-medium text-slate-300 transition"
        >
          <span>Suresh Kumar (Balanced Plumber)</span>
          <span className="text-[10px] text-slate-500">WRK-101</span>
        </button>

        <button
          onClick={() => switchPersona('worker-ramesh')}
          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-medium text-slate-300 transition"
        >
          <span>Ramesh Patil (Overloaded Plumber)</span>
          <span className="text-[10px] text-slate-500">WRK-102</span>
        </button>

        <button
          onClick={() => switchPersona('worker-priya')}
          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-medium text-slate-300 transition"
        >
          <span>Priya Sundaram (Electrician)</span>
          <span className="text-[10px] text-slate-500">WRK-104</span>
        </button>

        <button
          onClick={() => switchPersona('worker-ananya')}
          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-medium text-slate-300 transition"
        >
          <span>Ananya Rao (AC & HVAC Master)</span>
          <span className="text-[10px] text-slate-500">WRK-105</span>
        </button>

        <button
          onClick={() => switchPersona('admin')}
          className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex justify-between items-center text-xs font-medium text-slate-300 transition border-t border-slate-800 mt-2"
        >
          <span>Vikram Gowda (Cooperative Admin)</span>
          <span className="text-[10px] text-amber-400 font-bold">Admin</span>
        </button>
      </div>
    </div>
  );
}
