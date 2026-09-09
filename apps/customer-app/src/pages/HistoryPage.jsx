import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, Calendar, ShieldCheck } from 'lucide-react';

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/bookings/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('[History] Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">Service History</h2>
        <span className="text-xs text-slate-400 font-semibold">{history.length} Bookings</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 font-semibold">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-slate-950/60 rounded-2xl p-10 text-center text-slate-500 border border-slate-800 space-y-2">
          <Clock className="w-10 h-10 mx-auto text-slate-700 stroke-1" />
          <p className="font-bold text-xs text-slate-300">No past bookings yet</p>
          <p className="text-[11px] text-slate-500">Your completed cooperative service receipts will appear here.</p>
        </div>
      ) : (
        history.map((b) => (
          <div key={b._id} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-md space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{b.bookingNumber}</span>
                <h4 className="font-extrabold text-sm text-white mt-0.5">{b.serviceId?.name || 'Service'}</h4>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                b.status === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
              <span className="font-black text-emerald-400 text-sm">
                ₹{b.pricing?.totalAmount || 0}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
