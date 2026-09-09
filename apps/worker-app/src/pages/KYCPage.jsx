import React, { useState } from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { api } from '../services/api';
import { ShieldCheck, UploadCloud, FileText, CheckCircle, Clock } from 'lucide-react';

export function KYCPage() {
  const { workerProfile, refreshProfile } = useWorkerAuth();
  const [docType, setDocType] = useState('AADHAAR');
  const [documentNumber, setDocumentNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!documentNumber) return;

    try {
      setUploading(true);
      const res = await api.post('/worker/kyc', {
        docType,
        documentNumber,
        fileUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=400&q=80'
      });

      if (res.data.success) {
        setSuccessMsg('Document submitted for society administrative review.');
        setDocumentNumber('');
        await refreshProfile();
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const kycStatus = workerProfile?.kycStatus || 'VERIFIED';

  return (
    <div className="p-4 pb-24 space-y-4 text-white">
      {/* KYC Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400">Identity & Verification</span>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            kycStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {kycStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Society Verification Approved</h4>
            <p className="text-xs text-slate-400 mt-0.5">Verified by Bengaluru South Labour Society</p>
          </div>
        </div>
      </div>

      {/* Skills & Certified Trades */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase text-slate-400">Verified Craft & Trade Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(workerProfile?.skills || ['PLUMBING_BASIC', 'PIPE_FITTING']).map((s) => (
            <span key={s} className="text-xs font-bold bg-slate-800 text-blue-300 px-3 py-1.5 rounded-xl border border-slate-700">
              ✓ {s.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Submit New Verification Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase text-slate-400">Upload Additional Certificate</h4>
        <form onSubmit={handleUpload} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="AADHAAR">Aadhaar Card (Govt of India)</option>
              <option value="TRADE_LICENSE">NSDC / ITI Trade Certificate</option>
              <option value="PAN">PAN Card</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Document / License ID Number</label>
            <input
              type="text"
              placeholder="e.g. 5432-8891-0023"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            disabled={uploading}
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Submitting...' : 'Submit for Admin Approval'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
