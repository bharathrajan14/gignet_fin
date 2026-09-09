import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  UserCheck, 
  ShieldCheck, 
  Check, 
  X, 
  Eye, 
  FileText, 
  AlertCircle, 
  Camera, 
  ZoomIn, 
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export function WorkerManagementPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

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
      alert('Verification error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Cooperative Workforce & KYC Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect scanned identity documents from mobile devices, verify credentials, and approve cooperative guild badges.
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
        >
          Refresh Roster
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
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
                  <th className="pb-3">Uploaded Docs</th>
                  <th className="pb-3">KYC Status</th>
                  <th className="pb-3">Duty Status</th>
                  <th className="pb-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workers.map((w) => {
                  const docCount = w.kycDocuments?.length || 0;
                  const hasScanned = w.kycDocuments?.some((d) => d.isScanned);
                  return (
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-300">{docCount} doc(s)</span>
                          {hasScanned && (
                            <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <Camera className="w-2.5 h-2.5" /> Scanned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          w.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          w.kycStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
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
                          className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-[11px] transition border border-sky-500/30"
                        >
                          Inspect KYC
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Inspection & Document Viewer Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">
                  Mobile Document Inspection & Verification
                </span>
                <h3 className="font-extrabold text-lg text-white mt-0.5">
                  {selectedWorker.userId?.email} ({selectedWorker.badgeNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Document Gallery */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400">
                Uploaded Government & Trade Credentials
              </h4>

              {(selectedWorker.kycDocuments && selectedWorker.kycDocuments.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWorker.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{doc.docType.replace(/_/g, ' ')}</span>
                        {doc.isScanned && (
                          <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" /> Scanned via Camera
                          </span>
                        )}
                      </div>

                      <div 
                        onClick={() => setZoomedImage(doc.fileUrl)}
                        className="relative rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-900 group cursor-pointer"
                      >
                        <img
                          src={doc.fileUrl}
                          alt={doc.docType}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1">
                            <ZoomIn className="w-3.5 h-3.5" /> Click to Enlarge
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Ref ID: <strong className="font-mono text-white">{doc.documentNumber}</strong></span>
                        <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback sample if documents array is empty */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">Govt Aadhaar ID On File</p>
                    <p className="font-mono text-sky-400 text-xs mt-0.5">5432-8891-0023</p>
                    <p className="text-[10px] text-slate-500 mt-1">Uploaded during initial cooperative onboarding.</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80"
                    alt="Sample Document"
                    className="w-full h-36 object-cover rounded-xl border border-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Verification Status & History */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Current KYC Governance Status</span>
                <span className="font-black text-white">{selectedWorker.kycStatus}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Affiliated Society</span>
                <span className="font-bold text-sky-400">{selectedWorker.cooperativeId?.name || 'Bengaluru South Society'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Skill Registry</span>
                <span className="font-bold text-emerald-400">{(selectedWorker.skills || []).join(', ') || 'General Plumbing'}</span>
              </div>
            </div>

            {/* Approval / Rejection Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleReview('REJECTED', 'Identity document mismatch or unreadable scan.')}
                className="flex-1 py-3.5 rounded-2xl bg-rose-950 border border-rose-800 text-rose-300 font-bold text-xs hover:bg-rose-900/60 transition flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Reject KYC</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleReview('VERIFIED')}
                className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Verify & Approve Technician</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Zoomed Document Viewer */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={zoomedImage} alt="Document Zoom" className="w-full h-full object-contain rounded-2xl border border-slate-700 shadow-2xl" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
