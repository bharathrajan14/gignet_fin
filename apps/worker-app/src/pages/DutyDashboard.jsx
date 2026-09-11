import React from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { useWorkerLanguage } from '../context/WorkerLanguageContext';
import { Shield, Zap, Clock, Award, CheckCircle, TrendingUp, AlertTriangle, CheckSquare, Wrench } from 'lucide-react';

export function DutyDashboard({ onTriggerDemoOffer, pendingOffer }) {
  const { workerProfile } = useWorkerAuth();
  const { isTamil, t, getServiceName, getSubServiceName, getWorkerSkillInfo } = useWorkerLanguage();

  const isOnline = workerProfile?.isOnline;
  const metrics = workerProfile?.fairnessMetrics || {};
  const status = metrics.workloadStatus || 'BALANCED';

  // Fallback skills based on trade if worker profile skills array is empty
  const defaultSkills = workerProfile?.skills?.length
    ? workerProfile.skills
    : ['plumber_pipe_leakage', 'plumber_tap_leakage', 'plumber_drain_blockage', 'PLUMBING_BASIC'];

  const statusColor = {
    BALANCED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    UNDERUTILIZED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    HIGH_WORKLOAD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    OVERLOADED: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }[status] || 'bg-slate-800 text-slate-300 border-slate-700';

  const localizedStatus = {
    BALANCED: isTamil ? 'சீரான பணிச்சுமை' : 'BALANCED',
    UNDERUTILIZED: isTamil ? 'குறைந்த பணிச்சுமை' : 'UNDERUTILIZED',
    HIGH_WORKLOAD: isTamil ? 'அதிக பணிச்சுமை' : 'HIGH WORKLOAD',
    OVERLOADED: isTamil ? 'அதிகரித்த பணிச்சுமை' : 'OVERLOADED'
  }[status] || status;

  return (
    <div className="p-4 pb-24 space-y-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
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
                {isOnline 
                  ? (isTamil ? 'கூட்டுறவு நெட்வொர்க்கில் செயலில் உள்ளது' : 'Active on Society Network')
                  : (isTamil ? 'தற்போது ஆஃப்லைனில் உள்ளது' : 'Currently Off Duty')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOnline 
                  ? (isTamil ? '2dsphere அருகாமை பணி ஒதுக்கீட்டிற்கு தகுதியானது' : 'Eligible for 2dsphere proximity matching')
                  : (isTamil ? 'பணி வாய்ப்புகளைப் பெற மேலே உள்ள சுவிட்சை ஆன் செய்யவும்' : 'Toggle switch above to receive job offers')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Worker Skills & Trade Certifications Portfolio */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('ui.verifiedSkills', 'Verified Skills & Trade Certifications')}
            </span>
            <h4 className="font-black text-sm text-white mt-0.5">
              {isTamil ? 'தொழில்சார் திறன் போர்ட்ஃபோலியோ' : 'Accredited Sub-Skills Portfolio'}
            </h4>
          </div>
          <span className="text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
            {defaultSkills.length} {isTamil ? 'திறன்கள்' : 'Skills'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          {t('ui.verifiedSkillsSub', 'Accredited under National Skill Qualification Framework (NSQF)')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {defaultSkills.map((skillId) => {
            const skillInfo = getWorkerSkillInfo(skillId);
            return (
              <div key={skillId} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/90 flex items-start justify-between gap-2 shadow-sm">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <h5 className="font-bold text-xs text-white truncate">
                      {skillInfo.name}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {skillInfo.desc}
                  </p>
                  <span className="text-[9px] font-mono text-slate-500 block pt-0.5">
                    ID: {skillId}
                  </span>
                </div>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                  {isTamil ? 'சரிபார்க்கப்பட்டது' : 'VERIFIED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workload & Fairness Scorecard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isTamil ? 'பணிச்சுமை & நியாயமான மதிப்பீடு' : 'Workload & Fairness Score'}
            </span>
            <h4 className="font-black text-sm text-white mt-0.5">
              {isTamil ? 'ஒதுக்கீட்டு இயந்திர சுயவிவரம்' : 'Allocation Engine Profile'}
            </h4>
          </div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColor}`}>
            {localizedStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {isTamil ? 'வாராந்திர பணிகள்' : 'Weekly Jobs'}
            </span>
            <p className="font-extrabold text-base text-white mt-0.5">
              {metrics.completedJobsCount || 0} {isTamil ? 'பணிகள்' : 'jobs'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {metrics.emergencyJobsCount || 0} {isTamil ? 'அவசரம்' : 'Emergency'} / {metrics.scheduledJobsCount || 0} {isTamil ? 'திட்டமிட்டவை' : 'Scheduled'}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {isTamil ? 'நியாய முன்னுரிமை' : 'Fairness Weight'}
            </span>
            <p className="font-extrabold text-base text-emerald-400 mt-0.5">
              {isTamil ? '60% முன்னுரிமை' : '60% Priority'}
            </p>
            <p className="text-[10px] text-emerald-500/80 font-medium mt-0.5">
              {isTamil ? 'சீரான பணிச்சுமைக்கு அதிக முன்னுரிமை' : 'Higher score for low fatigue'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {isTamil 
              ? 'GIGNET திட்டமிடப்பட்ட ஒதுக்கீட்டில், சமத்துவத்தை மேம்படுத்த அதிக பணிச்சுமை கொண்ட தொழிலாளர்களை விட சீரான பணிச்சுமை கொண்டவர்களுக்கு முன்னுரிமை அளிக்கப்படுகிறது.'
              : 'In GIGNET scheduled matching, workers with balanced workloads rank higher than closer overloaded workers to promote cooperative equity.'}
          </p>
        </div>
      </div>

      {/* Society Affiliation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isTamil ? 'தொழிலாளர் கூட்டுறவு சங்கம்' : 'Labour Cooperative Society'}
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">{t('ui.societyName', 'Bengaluru South Labour Welfare Society')}</p>
            <p className="text-xs text-slate-400 mt-0.5">Code: COOP_BLR_01 • Reg #REG-KA-2024</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg">
            {t('ui.activeMember', 'Active Member')}
          </span>
        </div>
      </div>
    </div>
  );
}
