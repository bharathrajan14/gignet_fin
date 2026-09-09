import React from 'react';
import { Briefcase, Navigation, DollarSign, ShieldCheck } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, hasActiveJob, hasPendingOffer }) {
  const tabs = [
    { id: 'duty', label: 'Duty', icon: Briefcase, badge: hasPendingOffer },
    { id: 'job', label: 'Active Job', icon: Navigation, badge: hasActiveJob },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'kyc', label: 'KYC & Society', icon: ShieldCheck }
  ];

  return (
    <nav className="bg-slate-950 border-t border-slate-800 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 py-2">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 relative py-1 px-3 rounded-xl transition ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
