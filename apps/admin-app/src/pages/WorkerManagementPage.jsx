import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, ShieldCheck, Check, X, Eye, FileText, AlertCircle } from 'lucide-react';

export function WorkerManagementPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/workers');
      if (res.data.success) {
        setWorkers(res.data.data);
      }
    } catch (err) {
      console.error('[WorkerManagement] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status, rejectionReason = '') => {
    if (!selectedWorker) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/workers/${selectedWorker._id}/kyc-verify`, {
        status,
        rejectionReason
      });
      if (res.data.success) {
        setSelectedWorker(null);
        await fetchWorkers();
      }
    } catch (err) {
      alert('Verification error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-xl font-black">Cooperative Workforce & KYC Governance</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verify government Aadhaar/PAN identity documents, trade certifications, and society badge credentials.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold">Loading society technicians...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="pb-3">Badge #</th>
                  <th className="pb-3">Name / Contact</th>
                  <th className="pb-3">Skills & Certs</th>
                  <th className="pb-3">KYC Status</th>
                  <th className="pb-3">Duty Status</th>
                  <th className="pb-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-mono font-bold text-sky-400">{w.badgeNumber}</td>
                    <td className="py-3">
                      <p className="font-bold text-white">{w.userId?.email || 'Technician'}</p>
                      <p className="text-[10px] text-slate-400">{w.userId?.phoneNumber || '+91 9876543210'}</p>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {(w.skills || []).map((s) => (
                          <span key={s} className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        w.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        w.kycStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {w.kycStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold ${w.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {w.isOnline ? '● Online' : '○ Offline'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedWorker(w)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[11px] transition border border-slate-700"
                      >
                        Inspect KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Review Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-white animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-400">KYC Compliance Check</span>
                <h3 className="font-extrabold text-base text-white mt-0.5">
                  {selectedWorker.userId?.email} ({selectedWorker.badgeNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Document Details */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Identity Document</span>
                <span className="font-bold text-white">Govt Aadhaar Identity</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Document Ref #</span>
                <span className="font-mono text-sky-400 font-bold">5432-8891-0023</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trade Certification</span>
                <span className="font-bold text-emerald-400">NSDC Certified Master Plumber</span>
              </div>
            </div>

            {/* Approval / Rejection Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleReview('REJECTED', 'Identity document mismatch with regional cooperative roster.')}
                className="flex-1 py-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 font-bold text-xs hover:bg-rose-900/60 transition flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Reject KYC</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleReview('VERIFIED')}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs hover:from-emerald-600 hover:to-teal-600 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
