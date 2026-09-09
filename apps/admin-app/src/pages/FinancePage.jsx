import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { 
  CreditCard, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  CheckCircle, 
  Wrench, 
  ArrowUpRight, 
  Building,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

export function FinancePage() {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentNotice, setPaymentNotice] = useState(null);

  useEffect(() => {
    fetchFinance();

    // Connect to backend socket for real-time payment reconciliation
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[AdminFinance] Connected to live socket');
    });

    socket.on('admin:payment_received', (data) => {
      console.log('[AdminFinance] Real-time payment notification received:', data);
      setPaymentNotice(`Received ₹${data.totalPaid} from Customer for Booking #${data.bookingNumber}. Cooperative Reserve credited +₹${data.coopReserveCredit}.`);
      fetchFinance();
    });

    socket.on('payment:confirmed', () => {
      fetchFinance();
    });

    return () => {
      socket.disconnect();
    };
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

  if (loading && !finance) {
    return <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading society treasury records...</div>;
  }

  const primaryCoop = finance?.cooperatives?.[0] || { name: 'Bengaluru South Society', reserveFundBalance: 14500 };
  const invoices = finance?.invoices || [];

  return (
    <div className="p-6 space-y-6 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Real-time Payment Notification Banner */}
      {paymentNotice && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-4 text-xs text-emerald-300 font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce flex-shrink-0" />
            <span>{paymentNotice}</span>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-slate-400 hover:text-white px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Cooperative Treasury & Social Welfare Reserve</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial reconciliation: 80% Direct Worker Compensation + 100% Material Reimbursement, 15% Social Welfare Reserve, 5% Platform Infra.
          </p>
        </div>
        <button
          onClick={fetchFinance}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* Top Reserve Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-600/50 rounded-3xl p-6 space-y-2 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="w-20 h-20 text-emerald-400" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3" /> Society Reserve Fund (15%)
          </span>
          <h2 className="text-3xl font-black text-emerald-400">
            ₹{primaryCoop.reserveFundBalance || 14500}
          </h2>
          <p className="text-xs text-slate-400">
            Emergency health pool, toolkit replacement, and accident insurance for verified technicians.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Worker Net Payouts (80% + Parts)
          </span>
          <h2 className="text-3xl font-black text-white">
            ₹{finance?.totalWorkerPayouts || 45200}
          </h2>
          <p className="text-xs text-slate-400">
            Direct instant earnings + 100% spare parts reimbursement credited to technician accounts.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Gross Service Volume
          </span>
          <h2 className="text-3xl font-black text-sky-400">
            ₹{finance?.totalServiceGross || 52600}
          </h2>
          <p className="text-xs text-slate-400">
            Total completed customer billing volume across all cooperative trades and emergencies.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Platform Tech Infra (5%)
          </span>
          <h2 className="text-3xl font-black text-indigo-400">
            ₹{finance?.totalPlatformFee || 2820}
          </h2>
          <p className="text-xs text-slate-400">
            Open-source H3 spatial indexing, server operations, and mapping server maintenance.
          </p>
        </div>
      </div>

      {/* Itemized Recent Invoices & Spare Parts Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white">Recent Customer Settlements & Spare Parts Ledger</h3>
            <p className="text-xs text-slate-400">
              Live settlement audit verifying materials reimbursement and cooperative reserve credits.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{invoices.length} Invoices Found</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-bold">
            No completed invoices yet. As soon as workers complete jobs and customers pay, entries appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Service / Customer</th>
                  <th className="pb-3">Assigned Worker</th>
                  <th className="pb-3">Parts & Materials</th>
                  <th className="pb-3">Coop Reserve (15%)</th>
                  <th className="pb-3">Total Fare</th>
                  <th className="pb-3 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => {
                  const parts = inv.parts || inv.bookingId?.partsUsed || [];
                  const partsCost = inv.partsTotal || inv.bookingId?.pricing?.materialsCost || 0;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-mono font-bold text-sky-400">{inv.invoiceNumber}</td>
                      <td className="py-3">
                        <p className="font-bold text-white">{inv.bookingId?.serviceId?.name || 'Cooperative Service'}</p>
                        <p className="text-[10px] text-slate-400">{inv.bookingId?.customerId?.userId?.email || 'Verified Customer'}</p>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-200">
                          {inv.bookingId?.assignedWorkerId?.badgeNumber || 'Technician'}
                        </span>
                      </td>
                      <td className="py-3">
                        {parts.length > 0 ? (
                          <div>
                            <span className="font-bold text-emerald-400">₹{partsCost}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({parts.length} item{parts.length > 1 ? 's' : ''})</span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {parts.map((p) => `${p.name} (×${p.quantity})`).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-emerald-400">
                        +₹{inv.breakdown?.cooperativeReserve || Math.round((inv.breakdown?.totalAmount - partsCost) * 0.15)}
                      </td>
                      <td className="py-3 font-black text-white text-sm">
                        ₹{inv.breakdown?.totalAmount}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Split Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h4 className="font-black text-emerald-400 flex items-center gap-1.5 text-sm">
            <Shield className="w-4 h-4" /> GIGNET Cooperative Treasury Guarantee
          </h4>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>100% Spare Parts Reimbursement</strong>: Hardware purchased by the worker is returned dollar-for-dollar with 0% platform cuts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>80% Direct Labor Remittance</strong>: The technician retains the majority of their trade labor fare.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>15% Welfare Reserve & Tool Fund</strong>: Pooled collectively for health emergencies, accidental injury, and micro-loans.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h4 className="font-black text-rose-400 flex items-center gap-1.5 text-sm">
            Typical Commercial Gig Aggregators
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>25% to 35% commission extracted from every single customer ticket.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Zero social security, healthcare reserve, or worker ownership.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Unilateral penalties, hidden commission charges, and arbitrary algorithmic demotions.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
