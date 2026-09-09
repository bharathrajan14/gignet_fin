import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
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
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Service History</h2>
        <span className="text-xs text-slate-400 font-semibold">{history.length} Bookings</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
          <Clock className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <p className="font-bold text-xs text-slate-600 mt-2">No past bookings yet</p>
        </div>
      ) : (
        history.map((b) => (
          <div key={b._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400">{b.bookingNumber}</span>
                <h4 className="font-extrabold text-sm text-slate-900">{b.serviceId?.name || 'Service'}</h4>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                b.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
              <span className="font-black text-slate-900 text-sm">
                ₹{b.pricing?.totalAmount || 0}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
