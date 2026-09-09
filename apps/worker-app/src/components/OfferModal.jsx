import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, MapPin, DollarSign, Check, X, AlertCircle, Zap } from 'lucide-react';

export function OfferModal({ offer, onAccepted, onDeclined }) {
  const [countdown, setCountdown] = useState(offer?.remainingSeconds || 45);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!offer) return;
    setCountdown(offer.remainingSeconds || 45);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (typeof onDeclined === 'function') {
            onDeclined('TIMEOUT');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (!offer) return null;

  const handleRespond = async (isAccepted) => {
    try {
      setProcessing(true);
      const res = await api.post(`/worker/offers/${offer.offerId || offer._id}/respond`, {
        isAccepted,
        rejectReason: isAccepted ? '' : 'Worker declined manually'
      });

      if (isAccepted && typeof onAccepted === 'function') {
        onAccepted(res.data.data.booking);
      } else if (!isAccepted && typeof onDeclined === 'function') {
        onDeclined('MANUAL_DECLINE');
      }
    } catch (err) {
      alert('Offer response failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const isEmergency = offer.details?.bookingType === 'EMERGENCY' || offer.bookingType === 'EMERGENCY';
  const serviceName = offer.details?.serviceName || offer.serviceName || 'Service Request';
  const distanceKm = offer.details?.distanceKm || offer.distanceKm || 2.1;
  const etaMinutes = offer.details?.etaMinutes || offer.etaMinutes || 8;
  const payout = offer.details?.estimatedPayout || offer.estimatedPayout || 540;
  const address = offer.details?.addressText || offer.addressText || 'Customer Location';

  // Circular progress calculation
  const progressPct = ((45 - countdown) / 45) * 100;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        
        {/* Top Countdown Ring & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
              {isEmergency ? '⚡ Emergency Job Offer' : '📅 Scheduled Job Offer'}
            </span>
          </div>

          {/* Countdown timer badge */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-amber-400 font-mono font-black text-sm">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>{countdown}s</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000"
            style={{ width: `${100 - progressPct}%` }}
          />
        </div>

        {/* Job Title */}
        <div>
          <h3 className="text-lg font-black text-white">{serviceName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Bengaluru South Labour Welfare Society</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Distance & Transit</span>
            <p className="font-extrabold text-sm text-white mt-0.5">{distanceKm} km</p>
            <p className="text-[10px] text-blue-400 font-medium">~{etaMinutes} min travel</p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Net Take-Home (80%)</span>
            <p className="font-extrabold text-sm text-emerald-400 mt-0.5">₹{payout}</p>
            <p className="text-[10px] text-emerald-500/80 font-medium">Direct worker payout</p>
          </div>
        </div>

        {/* Address text */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="truncate">{address}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            disabled={processing}
            onClick={() => handleRespond(false)}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            disabled={processing}
            onClick={() => handleRespond(true)}
            className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Accept Job</span>
          </button>
        </div>
      </div>
    </div>
  );
}
