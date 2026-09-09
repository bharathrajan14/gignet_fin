import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useWorkerSocket } from '../context/WorkerSocketContext';
import { 
  MapPin, 
  Phone, 
  CheckCircle, 
  Navigation, 
  Play, 
  Flag, 
  Shield, 
  AlertCircle,
  Plus,
  Trash2,
  Wrench,
  DollarSign,
  Receipt,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

export function ActiveJobPage({ onJobFinished }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  // Spare Parts billing state
  const [parts, setParts] = useState([]);
  const [customPartName, setCustomPartName] = useState('');
  const [customPartQty, setCustomPartQty] = useState(1);
  const [customPartPrice, setCustomPartPrice] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [billGeneratedNotice, setBillGeneratedNotice] = useState(false);
  const [isPaidNotice, setIsPaidNotice] = useState(false);

  const socket = useWorkerSocket();

  useEffect(() => {
    loadActiveJob();
  }, []);

  useEffect(() => {
    if (!socket || !job?._id) return;

    socket.on('payment:confirmed', (data) => {
      console.log('[WorkerSocket] Customer payment confirmed:', data);
      setIsPaidNotice(true);
      loadActiveJob();
    });

    return () => {
      socket.off('payment:confirmed');
    };
  }, [socket, job?._id]);

  const loadActiveJob = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker/jobs/current');
      if (res.data.success && res.data.data) {
        setJob(res.data.data);
        if (res.data.data.partsUsed && res.data.data.partsUsed.length > 0) {
          setParts(res.data.data.partsUsed);
        }
      }
    } catch (err) {
      console.error('[ActiveJob] Error loading job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (nextStatus) => {
    if (!job) return;
    try {
      setAdvancing(true);
      const res = await api.put(`/worker/jobs/${job._id}/status`, { nextStatus });
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      alert('Status update error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdvancing(false);
    }
  };

  // Quick spare parts presets
  const quickPresets = [
    { name: 'CPVC Pipe 10ft', unitCost: 180 },
    { name: 'Brass Ball Valve 1/2"', unitCost: 220 },
    { name: 'Teflon Tape Roll', unitCost: 40 },
    { name: 'M-Seal Waterproof Sealant', unitCost: 35 },
    { name: 'PVC Elbow & Socket', unitCost: 50 },
    { name: 'Brass Bibcock Tap', unitCost: 280 },
    { name: 'MCB Switch 16A', unitCost: 190 },
    { name: 'Copper Wire Coil 5m', unitCost: 250 }
  ];

  const handleAddPresetPart = (preset) => {
    setParts((prev) => {
      const existing = prev.find((p) => p.name === preset.name);
      if (existing) {
        return prev.map((p) =>
          p.name === preset.name
            ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.unitCost }
            : p
        );
      }
      return [...prev, { name: preset.name, quantity: 1, unitCost: preset.unitCost, total: preset.unitCost }];
    });
  };

  const handleAddCustomPart = () => {
    if (!customPartName || !customPartPrice || Number(customPartPrice) <= 0) {
      alert('Please enter a valid part name and price');
      return;
    }
    const unitCost = Number(customPartPrice);
    const quantity = Number(customPartQty) || 1;
    setParts((prev) => [
      ...prev,
      { name: customPartName, quantity, unitCost, total: quantity * unitCost }
    ]);
    setCustomPartName('');
    setCustomPartQty(1);
    setCustomPartPrice('');
  };

  const handleUpdatePartQty = (index, delta) => {
    setParts((prev) =>
      prev
        .map((p, idx) => {
          if (idx !== index) return p;
          const newQty = p.quantity + delta;
          if (newQty <= 0) return null;
          return { ...p, quantity: newQty, total: newQty * p.unitCost };
        })
        .filter(Boolean)
    );
  };

  const handleRemovePart = (index) => {
    setParts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const partsTotal = parts.reduce((acc, p) => acc + (p.total || 0), 0);
  const laborFee = job?.pricing?.baseFare || 249;
  const welfareFee = 15;
  const estimatedCustomerTotal = laborFee + partsTotal + welfareFee;
  const estimatedWorkerEarnings = Math.round(laborFee * 0.8) + partsTotal;

  const handleGenerateBillAndComplete = async () => {
    if (!job) return;
    try {
      setIsSubmittingBill(true);
      const res = await api.post(`/worker/jobs/${job._id}/complete-with-parts`, {
        parts
      });

      if (res.data.success) {
        setJob((prev) => ({ ...prev, status: 'COMPLETED' }));
        setBillGeneratedNotice(true);
        // Refresh job
        await loadActiveJob();
      }
    } catch (err) {
      alert('Failed to generate bill: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingBill(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-bold">Checking active assignments...</div>;
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
        <Navigation className="w-12 h-12 mx-auto text-slate-700 stroke-1" />
        <p className="font-bold text-sm text-slate-300">No active job right now</p>
        <p className="text-xs text-slate-500">When an allocation offer is accepted, your job workflow appears here.</p>
      </div>
    );
  }

  const customerLatLon = job.customerLocation?.coordinates
    ? [job.customerLocation.coordinates[1], job.customerLocation.coordinates[0]]
    : [12.9352, 77.6245];

  return (
    <div className="p-4 pb-28 space-y-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Real-time Payment Notice */}
      {(isPaidNotice || job.status === 'PAID') && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-3.5 text-xs text-emerald-300 font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
            <div>
              <p className="text-white font-extrabold">Payment Received from Customer!</p>
              <p className="text-[10px] text-emerald-400">₹{job.pricing?.workerPayout || estimatedWorkerEarnings} credited to your society payout balance.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (typeof onJobFinished === 'function') onJobFinished();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
          >
            Done
          </button>
        </div>
      )}

      {/* Status Header */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{job.bookingNumber}</span>
          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
            job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            job.status === 'PAID' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
            'bg-sky-500/20 text-sky-400 border-sky-500/30'
          }`}>
            {job.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div>
          <h3 className="font-black text-lg text-white">{job.serviceId?.name || 'Emergency Repair'}</h3>
          <p className="text-xs text-emerald-400 font-bold mt-0.5">
            Technician Share: ₹{job.pricing?.workerPayout || estimatedWorkerEarnings} (80% Labor + 100% Parts)
          </p>
        </div>

        {/* Customer Contact */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              C
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{job.customerId?.userId?.email || 'Customer'}</p>
              <p className="text-[10px] text-slate-400 truncate">{job.addressText}</p>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center hover:bg-emerald-500/30 transition"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Navigation Map */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-md">
        <LeafletMap customerCoords={customerLatLon} height="190px" zoom={15} />
      </div>

      {/* Work Progression Action Buttons */}
      <div className="space-y-3">
        {job.status === 'CONFIRMED' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('ON_THE_WAY')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500 transition"
          >
            <Navigation className="w-5 h-5" />
            <span>Mark: On The Way to Customer</span>
          </button>
        )}

        {job.status === 'ON_THE_WAY' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('ARRIVED')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition"
          >
            <MapPin className="w-5 h-5" />
            <span>I Have Arrived at Location</span>
          </button>
        )}

        {job.status === 'ARRIVED' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('IN_PROGRESS')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Work at Customer Site</span>
          </button>
        )}

        {/* IN PROGRESS: Spare Parts & Bill Generation Section */}
        {job.status === 'IN_PROGRESS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-400">Step 2: Work Completion</span>
                <h4 className="font-extrabold text-sm text-white">Add Spare Parts & Materials</h4>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                Parts: ₹{partsTotal}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Add Common Materials
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPresetPart(preset)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-[11px] font-semibold text-slate-300 flex items-center gap-1 transition active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-sky-400" />
                    <span>{preset.name} (₹{preset.unitCost})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Part Entry Form */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Or Enter Custom Material
              </label>
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Material / Part Name"
                  value={customPartName}
                  onChange={(e) => setCustomPartName(e.target.value)}
                  className="col-span-6 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={customPartQty}
                  onChange={(e) => setCustomPartQty(e.target.value)}
                  className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="₹ Price"
                  value={customPartPrice}
                  onChange={(e) => setCustomPartPrice(e.target.value)}
                  className="col-span-4 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomPart}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to Bill</span>
              </button>
            </div>

            {/* Selected Parts List */}
            {parts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bill Items ({parts.length})
                </label>
                <div className="divide-y divide-slate-800/80 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
                  {parts.map((p, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          ₹{p.unitCost} × {p.quantity} = <strong className="text-white">₹{p.total}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleUpdatePartQty(idx, -1)}
                            className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="px-1 text-xs font-mono font-bold text-white">{p.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePartQty(idx, 1)}
                            className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePart(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary Box */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Labor Fee</span>
                <span className="text-white font-bold">₹{laborFee}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spare Parts & Materials Total</span>
                <span className="text-sky-400 font-bold">₹{partsTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Society Welfare Reserve Fund</span>
                <span className="text-slate-400 font-medium">₹{welfareFee}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white">
                <span>Customer Bill Total</span>
                <span className="text-emerald-400 font-black">₹{estimatedCustomerTotal}</span>
              </div>
              <p className="text-[10px] text-emerald-400/90 pt-1 font-semibold">
                Your Direct Payout: ₹{estimatedWorkerEarnings} (100% of parts reimbursed + 80% labor)
              </p>
            </div>

            {/* Submit Bill & Complete Job Button */}
            <button
              disabled={isSubmittingBill}
              type="button"
              onClick={handleGenerateBillAndComplete}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition"
            >
              <Receipt className="w-5 h-5" />
              <span>{isSubmittingBill ? 'Issuing Bill to Customer...' : 'Generate Bill & Finish Job'}</span>
            </button>
          </div>
        )}

        {job.status === 'COMPLETED' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Official Bill Issued to Customer</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              The itemized invoice with spare parts has been sent to the customer's phone. Awaiting UPI settlement.
            </p>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Expected Direct Payout</span>
              <span className="font-black text-emerald-400">₹{job.pricing?.workerPayout || estimatedWorkerEarnings}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
