import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AllocationAuditDrawer } from '../components/AllocationAuditDrawer';
import { GitPullRequest, Search, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function AllocationAuditPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings/live');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('[AllocationAuditPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-xl font-black">Explainable Multi-Criteria Allocation Audit</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditable record of every candidate evaluated, proximity scoring, workload utilization, and exclusion reasons.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold">Loading audit logs...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold">No booking audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="pb-3">Booking #</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Assigned Technician</th>
                  <th className="pb-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-mono font-bold text-sky-400">{b.bookingNumber}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        b.bookingType === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {b.bookingType}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">{b.serviceId?.name}</td>
                    <td className="py-3 text-slate-300">{b.status}</td>
                    <td className="py-3 font-mono text-emerald-400">
                      {b.assignedWorkerId?.badgeNumber || 'Unassigned'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition shadow-sm inline-flex items-center gap-1"
                      >
                        <span>View Explainability Trail</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBooking && (
        <AllocationAuditDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
