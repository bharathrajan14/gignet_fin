import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, Phone, CheckCircle, Navigation, Play, Flag, Shield, AlertCircle } from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

export function ActiveJobPage({ onJobFinished }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    loadActiveJob();
  }, []);

  const loadActiveJob = async () => {
    try {
      const res = await api.get('/worker/jobs/current');
      if (res.data.success) {
        setJob(res.data.data);
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
        if (nextStatus === 'COMPLETED') {
          setTimeout(() => {
            if (typeof onJobFinished === 'function') onJobFinished();
          }, 1500);
        }
      }
    } catch (err) {
      alert('Status advance error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-bold">Checking active assignments...</div>;
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
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
    <div className="p-4 pb-24 space-y-4 text-white">
      {/* Status Header */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400">{job.bookingNumber}</span>
          <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {job.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div>
          <h3 className="font-black text-lg text-white">{job.serviceId?.name || 'Emergency Repair'}</h3>
          <p className="text-xs text-emerald-400 font-bold mt-0.5">Net Payout: ₹{job.pricing?.workerPayout || 540} (80%)</p>
        </div>

        {/* Customer Info */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              C
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{job.customerId?.userId?.email || 'Asha Sharma'}</p>
              <p className="text-[10px] text-slate-400 truncate">{job.addressText}</p>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Navigation Map */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-md">
        <LeafletMap customerCoords={customerLatLon} height="220px" zoom={15} />
      </div>

      {/* Lifecycle Progression Action Button */}
      <div className="space-y-2">
        {job.status === 'CONFIRMED' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('ON_THE_WAY')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition"
          >
            <Navigation className="w-5 h-5" />
            <span>Start Trip to Customer</span>
          </button>
        )}

        {job.status === 'ON_THE_WAY' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('ARRIVED')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-indigo-700 transition"
          >
            <MapPin className="w-5 h-5" />
            <span>I Have Arrived at Location</span>
          </button>
        )}

        {job.status === 'ARRIVED' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('IN_PROGRESS')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Work</span>
          </button>
        )}

        {job.status === 'IN_PROGRESS' && (
          <button
            disabled={advancing}
            onClick={() => handleAdvance('COMPLETED')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete Work & Trigger Invoice</span>
          </button>
        )}

        {job.status === 'COMPLETED' && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-center text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Work completed! Invoice issued to customer.</span>
          </div>
        )}
      </div>
    </div>
  );
}
