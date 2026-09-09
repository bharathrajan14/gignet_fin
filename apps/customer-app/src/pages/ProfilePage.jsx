import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, MapPin, Phone, Award, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, switchPersona } = useAuth();

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
          {user?.fullName?.charAt(0) || 'A'}
        </div>
        <div>
          <h2 className="font-extrabold text-base text-slate-900">{user?.fullName || 'Asha Sharma'}</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mt-1 inline-block">
            Verified Resident
          </span>
        </div>
      </div>

      {/* Society Affiliation */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Cooperative Governance
        </div>
        <h4 className="font-black text-sm">Bengaluru South Labour Welfare Society</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          15% of your service invoices contribute directly to the local cooperative worker emergency fund and healthcare reserve.
        </p>
      </div>

      {/* Demo Switcher Quick Links */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">SIH 4-Laptop Demo Personas</h3>
        <button
          onClick={() => switchPersona('customer')}
          className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 flex justify-between items-center text-xs font-bold text-emerald-900"
        >
          <span>Asha Sharma (Customer)</span>
          <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800">Active</span>
        </button>
        <button
          onClick={() => switchPersona('worker-suresh')}
          className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex justify-between items-center text-xs font-medium text-slate-700"
        >
          <span>Suresh Kumar (Balanced Plumber)</span>
          <span className="text-[10px] text-slate-400">Worker</span>
        </button>
        <button
          onClick={() => switchPersona('worker-ramesh')}
          className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex justify-between items-center text-xs font-medium text-slate-700"
        >
          <span>Ramesh Patil (Overloaded Plumber)</span>
          <span className="text-[10px] text-slate-400">Worker</span>
        </button>
        <button
          onClick={() => switchPersona('admin')}
          className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex justify-between items-center text-xs font-medium text-slate-700"
        >
          <span>Vikram Gowda (Cooperative Admin)</span>
          <span className="text-[10px] text-slate-400">Admin</span>
        </button>
      </div>
    </div>
  );
}
