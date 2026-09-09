import React, { useState } from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { api } from '../services/api';
import { Shield, Power, ChevronDown, User, Award } from 'lucide-react';

export function Navbar() {
  const { workerProfile, switchWorkerPersona, refreshProfile } = useWorkerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggleOnline = async () => {
    try {
      setToggling(true);
      const res = await api.put('/worker/status/online');
      if (res.data.success) {
        await refreshProfile();
      }
    } catch (err) {
      alert('Failed to toggle duty status: ' + err.message);
    } finally {
      setToggling(false);
    }
  };

  const isOnline = workerProfile?.isOnline;

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 px-4 py-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">GIGNET WORKER</span>
              <span className="text-[10px] font-black uppercase bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700">
                {workerProfile?.badgeNumber || 'WRK-101'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Bengaluru South Labour Society</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online / Offline Toggle Button */}
          <button
            disabled={toggling}
            onClick={handleToggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition shadow-sm ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isOnline ? 'ON DUTY' : 'OFFLINE'}</span>
          </button>

          {/* Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition"
            >
              <User className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Worker Persona
                </div>
                <button
                  onClick={() => { switchWorkerPersona('worker-suresh'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-blue-400 font-bold"
                >
                  <span>Suresh (Balanced Plumber)</span>
                  <span className="text-[10px] bg-blue-950 px-1.5 py-0.5 rounded text-blue-300">Active</span>
                </button>
                <button
                  onClick={() => { switchWorkerPersona('worker-ramesh'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                >
                  <span>Ramesh (Overloaded Plumber)</span>
                  <span className="text-[10px] text-amber-400">8 Jobs</span>
                </button>
                <button
                  onClick={() => { switchWorkerPersona('worker-ravi'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                >
                  <span>Ravi (10am Booking Conflict)</span>
                  <span className="text-[10px] text-rose-400">Slack Demo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
