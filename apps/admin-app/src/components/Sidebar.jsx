import React from 'react';
import {
  Activity,
  GitPullRequest,
  Scale,
  TrendingUp,
  UserCheck,
  CreditCard,
  Layers,
  MapPin
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'operations', label: 'Live Operations Map', icon: Activity },
    { id: 'allocation', label: 'Allocation Audit Trail', icon: GitPullRequest },
    { id: 'fairness', label: 'Fairness & Workload', icon: Scale },
    { id: 'forecast', label: 'Demand Forecasting ML', icon: TrendingUp },
    { id: 'workers', label: 'Worker Verification (KYC)', icon: UserCheck },
    { id: 'finance', label: 'Coop Reserve & Finance', icon: CreditCard }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 flex flex-col flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3">
          Society Command
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hex Engine Status Card */}
      <div className="mt-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-sky-400 font-extrabold text-[11px]">
          <Layers className="w-4 h-4" />
          <span>H3 Hex Spatial Index</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Resolution 7 (~1.2km) & Res 8 (~460m) active. Zero paid Google/Mapbox APIs.
        </p>
      </div>
    </aside>
  );
}
