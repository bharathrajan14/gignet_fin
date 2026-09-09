import React from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { Shield, Zap, Clock, Award, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export function DutyDashboard({ onTriggerDemoOffer, pendingOffer }) {
  const { workerProfile } = useWorkerAuth();

  const isOnline = workerProfile?.isOnline;
  const metrics = workerProfile?.fairnessMetrics || {};
  const status = metrics.workloadStatus || 'BALANCED';

  const statusColor = {
    BALANCED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    UNDERUTILIZED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    HIGH_WORKLOAD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    OVERLOADED: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }[status] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="p-4 pb-24 space-y-4 text-white">
      {/* Duty Status Banner */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isOnline
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl'
          : 'bg-slate-900/50 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
              isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              {isOnline ? 'ON' : 'OFF'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {isOnline ? 'Active on Society Network' : 'Currently Off Duty'}
              </h3>
              <p className="text-xs text-slate-400">
                {isOnline ? 'Eligible for 2dsphere proximity matching' : 'Toggle switch above to receive job offers'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workload & Fairness Scorecard (Crucial for SIH Judging) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workload & Fairness Score</span>
            <h4 className="font-black text-sm text-white mt-0.5">Allocation Engine Profile</h4>
          </div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Weekly Jobs</span>
            <p className="font-extrabold text-base text-white mt-0.5">
              {metrics.completedJobsCount || 0} jobs
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {metrics.emergencyJobsCount || 0} Emergency / {metrics.scheduledJobsCount || 0} Scheduled
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Fairness Weight</span>
            <p className="font-extrabold text-base text-emerald-400 mt-0.5">60% Priority</p>
            <p className="text-[10px] text-emerald-500/80 font-medium mt-0.5">
              Higher score for low fatigue
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            In GIGNET scheduled matching, workers with balanced workloads rank higher than closer overloaded workers to promote cooperative equity.
          </p>
        </div>
      </div>

      {/* Society Affiliation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Labour Cooperative Society</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Bengaluru South Labour Welfare Society</p>
            <p className="text-xs text-slate-400 mt-0.5">Code: COOP_BLR_01 • Reg #REG-KA-2024</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg">
            Active Member
          </span>
        </div>
      </div>
    </div>
  );
}
