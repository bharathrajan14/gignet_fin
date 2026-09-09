import React from 'react';
import { Home, MapPin, Clock, UserCheck } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, hasActiveBooking }) {
  const tabs = [
    { id: 'book', label: 'Book', icon: Home },
    { id: 'track', label: 'Track', icon: MapPin, badge: hasActiveBooking },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 py-2">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 relative py-1 px-3 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
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
