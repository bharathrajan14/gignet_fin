import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, AlertCircle, Clock, CheckCircle, XCircle, ArrowRight, Zap } from 'lucide-react';

export function AllocationAuditDrawer({ booking, onClose }) {
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (booking?._id) {
      fetchTrail();
    }
  }, [booking?._id]);

  const fetchTrail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/bookings/${booking._id}/allocation-trail`);
      if (res.data.success) {
        setTrail(res.data.data);
      }
    } catch (err) {
      console.error('[AuditDrawer] Failed to fetch trail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-250 text-white">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              Audit Subsystem
            </span>
            <span className="text-xs font-bold text-slate-400">{booking.bookingNumber}</span>
          </div>
          <h2 className="font-extrabold text-base text-white mt-1">Explainable Allocation Decision Trail</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-bold">Loading audit telemetry...</div>
        ) : trail.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 font-bold">
            No allocation runs recorded for this booking yet.
          </div>
        ) : (
          trail.map(({ run, candidates }, runIdx) => (
            <div key={run._id} className="bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4">
              {/* Run Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Stage {runIdx + 1}: Progressive Geo Search
                  </span>
                  <h3 className="font-black text-sm text-white mt-0.5">
                    {run.searchStage} ({run.radiusKm} km radius)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {booking.bookingType === 'EMERGENCY' ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-rose-400 fill-current" /> Nearest Responder (70% Distance)
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Workload Balance (60% Fairness)
                    </span>
                  )}
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    run.status === 'CANDIDATE_OFFERED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {run.status}
                  </span>
                </div>
              </div>

              {/* Candidates Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                      <th className="pb-2">Rank</th>
                      <th className="pb-2">Worker</th>
                      <th className="pb-2">Dist</th>
                      <th className="pb-2">Rating</th>
                      <th className="pb-2">Utilization</th>
                      <th className="pb-2">Coop Bonus</th>
                      <th className="pb-2">Final Score</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {candidates.map((c) => {
                      const isSelected = String(c.workerId?._id) === String(run.selectedWorkerId?._id);
                      return (
                        <tr key={c._id} className={isSelected ? 'bg-emerald-500/10' : ''}>
                          <td className="py-2.5 font-bold">{c.isExcluded ? '—' : `#${c.rank}`}</td>
                          <td className="py-2.5 font-bold text-white">
                            {c.workerId?.badgeNumber || 'Worker'}
                          </td>
                          <td className="py-2.5 text-slate-300">
                            {c.scores?.distanceKm ? `${c.scores.distanceKm}km` : '—'}
                          </td>
                          <td className="py-2.5 text-amber-400">
                            {c.scores?.ratingScore ? `${(c.scores.ratingScore * 5).toFixed(1)}★` : '—'}
                          </td>
                          <td className="py-2.5 text-blue-300">
                            {c.scores?.utilizationScore !== undefined ? c.scores.utilizationScore : '—'}
                          </td>
                          <td className="py-2.5 text-slate-400">
                            {c.scores?.cooperativeBonus > 0 ? `+${c.scores.cooperativeBonus}` : '0.00'}
                          </td>
                          <td className="py-2.5 font-black text-emerald-400">
                            {c.scores?.finalScore !== undefined ? c.scores.finalScore : '—'}
                          </td>
                          <td className="py-2.5">
                            {c.isExcluded ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                                Excluded
                              </span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400">Candidate</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Explainability Telemetry Paragraphs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider">
                  Explainability Rationales (Computed from Live Telemetry)
                </span>
                {candidates.map((c) => (
                  <div
                    key={c._id}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      c.isExcluded
                        ? 'bg-rose-950/30 border border-rose-900/60 text-rose-200'
                        : String(c.workerId?._id) === String(run.selectedWorkerId?._id)
                        ? 'bg-emerald-950/30 border border-emerald-900/60 text-emerald-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {c.isExcluded ? (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{c.explainabilitySummary}</p>
                        {c.isExcluded && c.exclusionReasons?.length > 0 && (
                          <p className="text-[11px] text-rose-300 mt-1 font-mono">
                            Reason: {c.exclusionReasons.join('; ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
  );
}
