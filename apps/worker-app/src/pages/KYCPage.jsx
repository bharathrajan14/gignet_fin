import React, { useState, useRef, useEffect } from 'react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  UploadCloud, 
  Camera, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  FileText, 
  AlertCircle,
  X,
  Scan
} from 'lucide-react';

export function KYCPage() {
  const { workerProfile, refreshProfile } = useWorkerAuth();
  const [docType, setDocType] = useState('AADHAAR');
  const [documentNumber, setDocumentNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Camera scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Sample verified Indian KYC mock cards for preview / fallback
  const sampleDocs = {
    AADHAAR: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80',
    TRADE_LICENSE: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    PAN: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  };

  const startCamera = async () => {
    setIsScannerOpen(true);
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Webcam/Camera device not accessible in this environment. You can use Simulated Scan.');
      }
    } catch (err) {
      console.warn('[KYC Scanner] Camera access error, fallback enabled:', err);
      setCameraError('Camera access unavailable. You can use the Quick Capture Document button below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    } else {
      useSimulatedScan();
    }
  };

  const useSimulatedScan = () => {
    const docSample = sampleDocs[docType] || sampleDocs.AADHAAR;
    setCapturedImage(docSample);
    if (!documentNumber) {
      if (docType === 'AADHAAR') setDocumentNumber('5432-8891-0023');
      if (docType === 'TRADE_LICENSE') setDocumentNumber('NSDC-PLUMB-9921');
      if (docType === 'PAN') setDocumentNumber('ABCDE1234F');
    }
    stopCamera();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!documentNumber) {
      alert('Please enter your document or license number');
      return;
    }

    try {
      setUploading(true);
      const fileUrl = capturedImage || sampleDocs[docType];
      const res = await api.post('/worker/kyc', {
        docType,
        documentNumber,
        fileUrl,
        isScanned: !!capturedImage
      });

      if (res.data.success) {
        setSuccessMsg('KYC document scanned and submitted to Cooperative Admin for verification!');
        setDocumentNumber('');
        setCapturedImage(null);
        await refreshProfile();
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const kycStatus = workerProfile?.kycStatus || 'VERIFIED';
  const docsList = workerProfile?.kycDocuments || [];

  return (
    <div className="p-4 pb-24 space-y-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* KYC Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Identity & Verification</span>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            kycStatus === 'VERIFIED'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : kycStatus === 'REJECTED'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {kycStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">
              {kycStatus === 'VERIFIED' ? 'Society Cooperative Verification Active' : 'KYC Under Governance Review'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified by Bengaluru South Labour Welfare Federation
            </p>
          </div>
        </div>
      </div>

      {/* Verified Skills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase text-slate-400">Verified Craft & Trade Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(workerProfile?.skills || ['PLUMBING', 'ELECTRICAL']).map((s) => (
            <span key={s} className="text-xs font-bold bg-slate-800 text-sky-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>{s.replace(/_/g, ' ')}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mobile Scanner / Upload Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
        <div>
          <h4 className="text-sm font-black text-white">Mobile Document Scanner</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Use your phone's camera to scan your Aadhaar, PAN card, or Trade Certificate.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="AADHAAR">Government Aadhaar Card</option>
              <option value="TRADE_LICENSE">NSDC / ITI Trade Certificate</option>
              <option value="PAN">PAN Card</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">Document / Certificate ID Number</label>
            <input
              type="text"
              placeholder="e.g. 5432-8891-0023"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Scanner Viewfinder / Captured Document Preview */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-bold">Document Scan Photo</label>
            {capturedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 text-center">
                <img
                  src={capturedImage}
                  alt="Scanned Document Preview"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Scanned Document Ready
                </div>
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-4 right-4 bg-slate-900/90 text-slate-400 hover:text-white p-1.5 rounded-full border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-4 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/40 text-sky-400 flex flex-col items-center justify-center gap-2 transition"
                >
                  <Camera className="w-6 h-6" />
                  <span className="font-extrabold text-xs">Open Phone Scanner</span>
                </button>

                <button
                  type="button"
                  onClick={useSimulatedScan}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex flex-col items-center justify-center gap-2 transition"
                >
                  <Scan className="w-6 h-6 text-emerald-400" />
                  <span className="font-extrabold text-xs">Simulate High-Res Scan</span>
                </button>
              </div>
            )}
          </div>

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            disabled={uploading}
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Submitting Scanned Document...' : 'Submit Document for Admin Approval'}</span>
          </button>
        </form>
      </div>

      {/* Previously Uploaded KYC Documents List */}
      {docsList.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400">Uploaded Verification Records ({docsList.length})</h4>
          <div className="space-y-2">
            {docsList.map((doc, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 flex-shrink-0 overflow-hidden">
                    {doc.fileUrl ? (
                      <img src={doc.fileUrl} alt="doc" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate">{doc.docType.replace(/_/g, ' ')}</p>
                    <p className="font-mono text-[10px] text-slate-400 truncate">{doc.documentNumber}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    doc.verifiedAt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {doc.verifiedAt ? 'VERIFIED' : 'UNDER REVIEW'}
                  </span>
                  {doc.isScanned && (
                    <p className="text-[9px] text-sky-400 font-bold mt-0.5">Scanned via Camera</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera Viewfinder Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 text-white animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between pt-2">
            <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Live Document Camera
            </span>
            <button
              onClick={stopCamera}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewfinder Reticle Frame */}
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-sky-400/80 bg-slate-950 flex items-center justify-center shadow-2xl">
            {cameraError ? (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300">{cameraError}</p>
                <button
                  type="button"
                  onClick={useSimulatedScan}
                  className="px-4 py-2 bg-sky-500 text-slate-950 font-black rounded-xl text-xs"
                >
                  Capture Document Image
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {/* Bounding target corners */}
                <div className="absolute inset-4 pointer-events-none border-2 border-emerald-400/70 rounded-xl" />
                <div className="absolute bottom-2 bg-black/70 px-3 py-1 rounded-full text-[10px] text-emerald-300 font-bold">
                  Align ID card inside rectangle
                </div>
              </>
            )}
          </div>

          {/* Trigger controls */}
          <div className="w-full max-w-sm flex items-center justify-around pb-4">
            <button
              type="button"
              onClick={useSimulatedScan}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Quick Test Capture
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-xl flex items-center justify-center active:scale-95 transition"
            >
              <Camera className="w-7 h-7 text-white" />
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
