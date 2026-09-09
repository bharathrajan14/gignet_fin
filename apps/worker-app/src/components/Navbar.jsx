import React, { useState, useEffect } from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { api } from '../services/api';
import { Shield, Power, ChevronDown, User, Award, Check, Wrench, Zap, Wind, Hammer, Sparkles, Building2 } from 'lucide-react';

const TRADE_ICONS = {
  'Plumbing': Wrench,
  'Electrical': Zap,
  'Appliance & HVAC': Wind,
  'Carpentry': Hammer,
  'Cleaning': Sparkles,
  'Masonry & Waterproofing': Building2,
  'General Utility': Wrench
};

export function Navbar() {
  const { workerProfile, switchWorkerPersona, refreshProfile } = useWorkerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadPersonas() {
      try {
        const res = await api.get('/auth/worker-personas');
        if (res.data.success && isMounted) {
          setPersonas(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch personas, using fallback demo list:', err.message);
      }
    }
    loadPersonas();
    return () => { isMounted = false; };
  }, []);

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

  const trades = ['ALL', ...new Set(personas.map(p => p.trade).filter(Boolean))];
  const filteredPersonas = selectedTrade === 'ALL' 
    ? personas 
    : personas.filter(p => p.trade === selectedTrade);

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
            <p className="text-[10px] text-slate-400 -mt-0.5">
              {workerProfile?.cooperativeId?.name || 'Bengaluru Cooperative Guild'}
            </p>
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 text-slate-300 transition text-xs font-bold"
              title="Switch Worker Persona"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Switch</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Switch Technician Persona</span>
                    <p className="text-[10px] text-slate-500">20+ cooperative workers across 6 trades</p>
                  </div>
                  <button 
                    onClick={() => setDropdownOpen(false)}
                    className="text-xs text-slate-400 hover:text-white px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Trade Filter Tabs */}
                {trades.length > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[10px] scrollbar-none">
                    {trades.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTrade(t)}
                        className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition ${
                          selectedTrade === t
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-1">
                  {filteredPersonas.map((p) => {
                    const isCurrent = workerProfile?.badgeNumber === p.badgeNumber;
                    const IconComp = TRADE_ICONS[p.trade] || Wrench;
                    const isBalanced = p.workloadStatus === 'BALANCED' || p.workloadStatus === 'UNDERUTILIZED';
                    const isOverloaded = p.workloadStatus === 'OVERLOADED';

                    return (
                      <button
                        key={p.id}
                        onClick={async () => {
                          setDropdownOpen(false);
                          await switchWorkerPersona(p.badgeNumber);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 flex items-center justify-between transition ${
                          isCurrent ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold truncate ${isCurrent ? 'text-blue-300' : 'text-slate-200'}`}>
                                {p.fullName}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded font-mono">
                                {p.badgeNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{p.trade}</span>
                              <span>•</span>
                              <span className={isBalanced ? 'text-emerald-400' : isOverloaded ? 'text-amber-400' : 'text-slate-400'}>
                                {p.workloadStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrent ? (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 hover:text-slate-300">
                              Switch →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
