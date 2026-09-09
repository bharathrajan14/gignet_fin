import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapOperations } from '../components/MapOperations';
import { AllocationAuditDrawer } from '../components/AllocationAuditDrawer';
import { Zap, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle, Clock } from 'lucide-react';

export function LiveOperationsPage() {
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hexClusters, setHexClusters] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
    const interval = setInterval(loadMapData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    try {
      const res = await api.get('/admin/workforce/map-clusters');
      if (res.data.success) {
        setWorkers(res.data.data.workers || []);
        setBookings(res.data.data.bookings || []);
        setHexClusters(res.data.data.hexClusters || []);
      }
    } catch (err) {
      console.error('[OperationsPage] Error loading map telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Live Operations Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial tracking, H3 discrete clustering, and explainable multi-criteria dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">{workers.length} Active Workers</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-400 font-bold">{bookings.length} Open Requests</span>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <MapOperations
        workers={workers}
        bookings={bookings}
        hexClusters={hexClusters}
        onSelectBooking={(b) => setSelectedBooking(b)}
      />

      {/* Live Booking Queue with One-Click Explainable Audit Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Active Service Requests Queue ({bookings.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Click any request to view full explainable audit trail</span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-bold">
            No pending or active bookings at this moment. Create a booking on Customer App to watch live telemetry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.map((b) => (
              <div
                key={b._id}
                onClick={() => setSelectedBooking(b)}
                className="bg-slate-950 border border-slate-800 hover:border-sky-500/60 p-4 rounded-2xl cursor-pointer transition shadow-md hover:shadow-sky-500/10 space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500">{b.bookingNumber}</span>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-sky-400 transition">
                      {b.serviceId?.name || 'Service'}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    b.bookingType === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {b.bookingType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 truncate">{b.addressText}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-amber-400 font-black">₹{b.pricing?.totalAmount || 0}</span>
                  <span className="text-sky-400 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition">
                    Explainable Trail <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explainable Allocation Audit Drawer */}
      {selectedBooking && (
        <AllocationAuditDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
