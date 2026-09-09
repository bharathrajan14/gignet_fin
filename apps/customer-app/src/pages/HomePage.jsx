import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Zap, Calendar, Wrench, Sparkles, ShieldCheck, MapPin, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

export function HomePage({ onBookingCreated }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('EMERGENCY'); // 'EMERGENCY' or 'SCHEDULED'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Default Bengaluru location
  const [customerCoords, setCustomerCoords] = useState([77.6245, 12.9352]); // [lon, lat]
  const [addressText, setAddressText] = useState('12th Main, Koramangala 4th Block, Bengaluru');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/customer/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('[Home] Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    return true;
  });

  const handleBookService = async (service) => {
    try {
      setSubmitting(true);
      const res = await api.post('/customer/bookings', {
        serviceId: service._id,
        bookingType,
        customerLocation: customerCoords,
        addressText,
        scheduledFor: bookingType === 'SCHEDULED' ? new Date(Date.now() + 7200000).toISOString() : null
      });

      if (res.data.success) {
        setSelectedService(null);
        if (typeof onBookingCreated === 'function') {
          onBookingCreated(res.data.data);
        }
      }
    } catch (err) {
      alert('Failed to create booking: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      {/* Emergency vs Scheduled Switcher */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex shadow-inner">
        <button
          onClick={() => setBookingType('EMERGENCY')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${bookingType === 'EMERGENCY'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>⚡ Emergency (30m)</span>
        </button>
        <button
          onClick={() => setBookingType('SCHEDULED')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${bookingType === 'SCHEDULED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 Scheduled (Fair Care)</span>
        </button>
      </div>

      {/* Emergency Alert Banner */}
      {bookingType === 'EMERGENCY' ? (
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Rapid Emergency Dispatch</h3>
              <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
                Prioritizes nearest verified society technicians (70% distance weight). Guaranteed 30-min response for urgent leaks & blackouts.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Cooperative Fair Allocation</h3>
              <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                Prioritizes worker workload balance (60% weight) to avoid burnout, with a +0.08 bonus for your local neighbourhood society.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Location</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">H3 Hex #87608b2</span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{addressText}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PLUMBING', 'ELECTRICAL', 'CLEANING'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Available Cooperative Services ({filteredServices.length})
          </h2>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Loading society catalog...
          </div>
        ) : (
          filteredServices.map((svc) => {
            const price = bookingType === 'EMERGENCY'
              ? Math.round(svc.basePrice * (svc.emergencyMultiplier || 1.5))
              : svc.basePrice;

            return (
              <div
                key={svc._id}
                onClick={() => setSelectedService(svc)}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 text-slate-600">
                        {svc.category}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1 group-hover:text-emerald-700 transition">
                        {svc.name}
                      </h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-slate-900">₹{price}</span>
                      <p className="text-[10px] text-slate-400 font-medium">Standard rate</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 font-medium text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {svc.estimatedDurationMinutes} mins
                    </span>
                    {bookingType === 'EMERGENCY' && (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                        1.5x Surcharge
                      </span>
                    )}
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition">
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Confirmation Drawer / Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-1" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  {bookingType} Request
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{selectedService.name}</h3>
                <p className="text-xs text-slate-500">Bengaluru South Labour Welfare Cooperative Society</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Mini Map Preview */}
            <LeafletMap customerCoords={[customerCoords[1], customerCoords[0]]} height="130px" zoom={15} />

            {/* Transparent Breakdown */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Service Amount</span>
                <span>₹{selectedService.basePrice}</span>
              </div>
              {bookingType === 'EMERGENCY' && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Emergency Surcharge (1.5x Speed)</span>
                  <span>+₹{Math.round(selectedService.basePrice * (selectedService.emergencyMultiplier - 1.0))}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200">
                <span>Cooperative Reserve Share (15%)</span>
                <span>₹{Math.round((selectedService.basePrice * (bookingType === 'EMERGENCY' ? 1.5 : 1)) * 0.15)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1">
                <span>Total Payable</span>
                <span>₹{Math.round(selectedService.basePrice * (bookingType === 'EMERGENCY' ? 1.5 : 1))}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              disabled={submitting}
              onClick={() => handleBookService(selectedService)}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition ${bookingType === 'EMERGENCY'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-rose-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
            >
              {submitting ? (
                <span>Dispatching to Allocation Engine...</span>
              ) : (
                <>
                  <span>Confirm & Find Verified Worker</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
