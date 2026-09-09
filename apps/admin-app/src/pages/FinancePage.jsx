import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CreditCard, Shield, TrendingUp, DollarSign, PieChart } from 'lucide-react';

export function FinancePage() {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/finance/reconciliation');
      if (res.data.success) {
        setFinance(res.data.data);
      }
    } catch (err) {
      console.error('[FinancePage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading society treasury records...</div>;
  }

  const primaryCoop = finance?.cooperatives?.[0] || { name: 'Bengaluru South Society', reserveFundBalance: 12500 };

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-xl font-black">Cooperative Treasury & Social Welfare Reserve</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Autonomous financial split auditing: 80% Direct Worker Payout, 15% Social Welfare Reserve, 5% Platform Infra.
        </p>
      </div>

      {/* Top Reserve Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/60 to-slate-900 border border-emerald-800/60 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-emerald-300 tracking-wider">
            Cooperative Welfare Reserve (15%)
          </span>
          <h2 className="text-3xl font-black text-emerald-400">₹{primaryCoop.reserveFundBalance || 12500}</h2>
          <p className="text-xs text-slate-400">
            Dedicated emergency relief, health insurance premiums, and tool replacement grants for society members.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Total Worker Direct Payouts (80%)
          </span>
          <h2 className="text-3xl font-black text-white">₹{finance?.totalWorkerPayouts || 45200}</h2>
          <p className="text-xs text-slate-400">Direct instant compensation credited to verified workers without predatory commissions.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Platform Tech Maintenance (5%)
          </span>
          <h2 className="text-3xl font-black text-sky-400">₹{finance?.totalPlatformFee || 2820}</h2>
          <p className="text-xs text-slate-400">Cloud Run server, H3 spatial compute, and OpenStreetMap infrastructure cost coverage.</p>
        </div>
      </div>

      {/* Financial Split Graphic */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-white">Ethical Split Model vs Commercial Aggregators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> GIGNET Cooperative Model
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>• <strong>80% Direct to Worker</strong>: Zero predatory platform surge cuts</li>
              <li>• <strong>15% Cooperative Emergency Reserve</strong>: Collective health & accident safety</li>
              <li>• <strong>5% Open-Source Platform Tech</strong>: Low overhead non-profit compute</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-black text-rose-400">Typical Commercial Gig Aggregators</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• 25% – 35% Private corporate commission fees</li>
              <li>• 0% Worker welfare or cooperative ownership reserve</li>
              <li>• Algorithm opacity & unilateral worker deactivation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
