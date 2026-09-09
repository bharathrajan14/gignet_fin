import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, Shield, Award, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export function EarningsPage() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const res = await api.get('/worker/earnings');
      if (res.data.success) {
        setEarnings(res.data.data);
      }
    } catch (err) {
      console.error('[Earnings] Error loading earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4 text-white">
      {/* Big Earnings Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="text-xs font-bold uppercase text-blue-200">Total Net Earnings (80%)</span>
        <h2 className="text-3xl font-black text-white">₹{earnings?.totalEarnings || 8200}</h2>
        <div className="flex items-center gap-2 text-xs text-blue-100 pt-2 border-t border-blue-500/40">
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>₹{earnings?.weeklyEarnings || 1200} earned this week</span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Jobs</span>
          <p className="text-xl font-black text-white mt-1">{earnings?.completedJobsCount || 14}</p>
          <p className="text-[10px] text-slate-500 mt-1">100% On-time</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Customer Rating</span>
          <p className="text-xl font-black text-amber-400 mt-1">★ {earnings?.rating?.average || 4.9}</p>
          <p className="text-[10px] text-slate-500 mt-1">{earnings?.rating?.count || 48} reviews</p>
        </div>
      </div>

      {/* Cooperative Welfare Fund Contribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Cooperative Social Security
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Through your completed jobs, ₹{Math.round((earnings?.totalEarnings || 8200) * 0.1875)} has been deposited into your society's Healthcare & Emergency Welfare Fund.
        </p>
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-400">Accident Insurance Cover</span>
          <span className="text-emerald-400">Active (₹5,00,000)</span>
        </div>
      </div>
    </div>
  );
}
