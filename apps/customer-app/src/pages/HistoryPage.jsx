import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Clock, Calendar, ShieldCheck, Tag, Zap } from 'lucide-react';

export function HistoryPage() {
  const { 
    isTamil, 
    t, 
    getServiceName, 
    getSubServiceName, 
    getBookingTypeName, 
    getBookingStatusName 
  } = useLanguage();

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
    <div className="p-4 pb-24 space-y-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">
          {t('ui.historyTitle', 'Service History')}
        </h2>
        <span className="text-xs text-slate-400 font-semibold">
          {history.length} {t('ui.historyCount', 'Bookings')}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 font-semibold">
          {isTamil ? 'வரலாறு ஏற்றப்படுகிறது...' : 'Loading history...'}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-950/60 rounded-2xl p-10 text-center text-slate-500 border border-slate-800 space-y-2">
          <Clock className="w-10 h-10 mx-auto text-slate-700 stroke-1" />
          <p className="font-bold text-xs text-slate-300">{t('ui.noHistory', 'No past bookings yet')}</p>
          <p className="text-[11px] text-slate-500">{t('ui.noHistorySub', 'Your completed cooperative service receipts will appear here.')}</p>
        </div>
      ) : (
        history.map((b) => {
          const serviceName = getServiceName(b.serviceCategory || b.serviceId?.category || b.serviceId?.name || 'plumber');
          const subServiceName = b.subSkillId 
            ? getSubServiceName(b.subSkillId) 
            : (isTamil ? 'பொது பராமரிப்பு' : 'Standard Inspection');
          const bookingType = getBookingTypeName(b.bookingType || 'SCHEDULED');
          const statusText = getBookingStatusName(b.status);

          const isEmergency = b.bookingType === 'EMERGENCY';

          return (
            <div key={b._id} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              {/* Header: Booking Number & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {b.bookingNumber}
                  </span>
                  {/* Translated Service Name */}
                  <h4 className="font-extrabold text-base text-white mt-0.5 flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs font-medium">
                      {isTamil ? 'சேவை:' : 'Service:'}
                    </span>
                    <span>{serviceName}</span>
                  </h4>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  {/* Translated Status */}
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                    b.status === 'PAID' || b.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {isTamil ? `நிலை: ${statusText}` : statusText}
                  </span>

                  {/* Booking Type Pill */}
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    isEmergency 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}>
                    {bookingType}
                  </span>
                </div>
              </div>

              {/* Translated Sub-Service Name & Problem Info */}
              <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-sky-400" />
                    <span>{isTamil ? 'சேவை வகை:' : 'Sub-Service:'}</span>
                  </span>
                  <span className="text-sky-300 font-bold text-[11px]">
                    {subServiceName}
                  </span>
                </div>

                {b.problemDescription && (
                  <p className="text-[10px] text-slate-400 italic truncate pt-0.5">
                    "{b.problemDescription}"
                  </p>
                )}
              </div>

              {/* Date & Amount */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 font-medium text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(b.createdAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN')}
                </span>
                <span className="font-black text-emerald-400 text-sm">
                  ₹{b.pricing?.totalAmount || 0}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
