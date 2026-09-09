import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Zap, 
  Calendar, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  Cpu,
  Hammer,
  Check,
  Building,
  Info,
  Layers
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

export function HomePage({ onBookingCreated }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('EMERGENCY'); // 'EMERGENCY' or 'SCHEDULED'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOption, setSelectedOption] = useState('standard'); // 'standard', 'comprehensive', 'premium'
  const [selectedSlot, setSelectedSlot] = useState('Today (4:00 PM - 6:00 PM)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Default Bengaluru location
  const [customerCoords, setCustomerCoords] = useState([77.6245, 12.9352]); // [lon, lat]
  const [addressText, setAddressText] = useState('12th Main, Koramangala 4th Block, Bengaluru');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
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

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'PLUMBING', label: 'Plumbing', icon: Wrench },
    { id: 'ELECTRICAL', label: 'Electrical', icon: Zap },
    { id: 'APPLIANCE', label: 'Appliances & AC', icon: Cpu },
    { id: 'CARPENTRY', label: 'Carpentry', icon: Hammer },
    { id: 'CLEANING', label: 'Cleaning', icon: Sparkles },
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    return true;
  });

  const getOptionAddonPrice = (optionKey) => {
    if (optionKey === 'comprehensive') return 150;
    if (optionKey === 'premium') return 350;
    return 0;
  };

  const calculateTotalPrice = (service, type, optionKey) => {
    if (!service) return 0;
    const base = service.basePrice;
    const optionAddon = getOptionAddonPrice(optionKey);
    const emergencySurcharge = type === 'EMERGENCY'
      ? Math.round(base * ((service.emergencyMultiplier || 1.5) - 1.0))
      : 0;
    const welfareFund = 15;
    return base + optionAddon + emergencySurcharge + welfareFund;
  };

  const handleBookService = async () => {
    if (!selectedService) return;
    try {
      setSubmitting(true);
      const res = await api.post('/customer/bookings', {
        serviceId: selectedService._id,
        bookingType,
        customerLocation: customerCoords,
        addressText: notes ? `${addressText} (Notes: ${notes})` : addressText,
        scheduledFor: bookingType === 'SCHEDULED' ? new Date(Date.now() + 7200000).toISOString() : null
      });

      if (res.data.success) {
        setSelectedService(null);
        setNotes('');
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
    <div className="p-4 pb-24 space-y-5 text-slate-100">
      {/* Emergency vs Scheduled Switcher */}
      <div className="bg-slate-950/80 p-1 rounded-2xl flex border border-slate-800 shadow-inner">
        <button
          onClick={() => setBookingType('EMERGENCY')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            bookingType === 'EMERGENCY'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>⚡ Emergency (30m)</span>
        </button>
        <button
          onClick={() => setBookingType('SCHEDULED')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            bookingType === 'SCHEDULED'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 Scheduled (Fair Care)</span>
        </button>
      </div>

      {/* Emergency / Scheduled Explanatory Banner */}
      {bookingType === 'EMERGENCY' ? (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border border-rose-800/40 rounded-2xl p-4 text-white shadow-xl shadow-rose-950/20">
          <div className="flex items-start gap-3">
            <div className="bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight text-white">Rapid Emergency Dispatch</h3>
                <span className="text-[10px] uppercase font-bold bg-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded">30-Min SLA</span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                Prioritizes nearest verified society technicians (70% distance weight). Immediate response for pipe bursts, blackouts, or gas leaks.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-800/40 rounded-2xl p-4 text-white shadow-xl shadow-emerald-950/20">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight text-white">Cooperative Fair Allocation</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">+0.08 Local Bonus</span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                Prioritizes worker workload balance (60% weight) to prevent burnout, paired with verified local guild technicians.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location Bar with H3 Hex Cell */}
      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Service Location</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              H3 Hex #87608b2
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">{addressText}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Service Categories</span>
          <span className="text-[10px] text-slate-400 font-bold">{filteredServices.length} Options</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Available Cooperative Services ({filteredServices.length})
          </h2>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs font-semibold">
            Loading cooperative service catalog...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-slate-950/60 rounded-2xl p-8 text-center text-slate-500 border border-slate-800 text-xs font-bold">
            No services found in this category.
          </div>
        ) : (
          filteredServices.map((svc) => {
            const displayPrice = bookingType === 'EMERGENCY'
              ? Math.round(svc.basePrice * (svc.emergencyMultiplier || 1.5))
              : svc.basePrice;

            return (
              <div
                key={svc._id}
                onClick={() => {
                  setSelectedService(svc);
                  setSelectedOption('standard');
                }}
                className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/90 hover:border-emerald-500/60 transition-all hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-slate-900 border border-slate-800 text-emerald-400">
                          {svc.category}
                        </span>
                        {bookingType === 'EMERGENCY' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Urgent SLA
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-white text-sm mt-1.5 group-hover:text-emerald-400 transition">
                        {svc.name}
                      </h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-white">₹{displayPrice}</span>
                      <p className="text-[10px] text-slate-400 font-medium">Standard rate</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {svc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 font-medium text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {svc.estimatedDurationMinutes} mins
                    </span>
                    <span className="text-emerald-400/90 font-semibold flex items-center gap-1">
                      <Building className="w-3 h-3" /> Society Direct
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-extrabold text-emerald-400 group-hover:translate-x-1 transition">
                    Book Service <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPGRADED COOPERATIVE BOOKING MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedService(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto z-10 text-white animate-in slide-in-from-bottom duration-250">
            {/* Grab Bar */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    bookingType === 'EMERGENCY'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {bookingType} DISPATCH
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded-md">
                    {selectedService.category}
                  </span>
                </div>
                <h3 className="font-black text-base text-white mt-1.5">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Cooperative Verified Shield Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-800/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Cooperative Verified</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                    100% Fair Wage
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned directly to Bengaluru South Labour Welfare Society with 0% middleman commission.
                </p>
              </div>
            </div>

            {/* Service Scope Option Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Select Service Package
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', title: 'Inspection & Repair', fee: '+₹0', desc: 'Standard diagnosis' },
                  { id: 'comprehensive', title: 'Full Overhaul', fee: '+₹150', desc: 'Seal + heavy repair' },
                  { id: 'premium', title: 'Premium Parts', fee: '+₹350', desc: 'Grade-A hardware' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedOption === opt.id
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] leading-tight block">{opt.title}</span>
                        {selectedOption === opt.id && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-400 mt-1.5">{opt.fee}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduled Slot Selector (when Scheduled is selected) */}
            {bookingType === 'SCHEDULED' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Preferred Appointment Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Today (4:00 PM - 6:00 PM)',
                    'Tomorrow (9:00 AM - 11:00 AM)',
                    'Tomorrow (1:00 PM - 3:00 PM)',
                    'Tomorrow (5:00 PM - 7:00 PM)',
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition text-left ${
                        selectedSlot === slot
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Mini Map Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Dispatch Geolocation
                </label>
                <span className="text-[10px] text-slate-400 font-mono">12.9352°N, 77.6245°E</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 h-28">
                <LeafletMap customerCoords={[customerCoords[1], customerCoords[0]]} height="112px" zoom={15} />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">{addressText}</p>
            </div>

            {/* Specific Instructions / Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Notes for Assigned Technician (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 2nd floor, tap leaking near kitchen counter"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Transparent Cooperative Price Breakdown */}
            <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Society Labor Fee</span>
                <span className="text-white font-semibold">₹{selectedService.basePrice}</span>
              </div>

              {selectedOption !== 'standard' && (
                <div className="flex justify-between text-slate-400">
                  <span>Selected Package Addon</span>
                  <span className="text-emerald-400 font-semibold">+₹{getOptionAddonPrice(selectedOption)}</span>
                </div>
              )}

              {bookingType === 'EMERGENCY' && (
                <div className="flex justify-between text-rose-400">
                  <span>Emergency 30m Surcharge (1.5x)</span>
                  <span className="font-semibold">+₹{Math.round(selectedService.basePrice * ((selectedService.emergencyMultiplier || 1.5) - 1.0))}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  Worker Emergency & Welfare Fund <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="text-emerald-400 font-semibold">₹15</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-black">
                <span className="text-white">Total Guaranteed Fare</span>
                <span className="text-lg text-emerald-400 font-black">
                  ₹{calculateTotalPrice(selectedService, bookingType, selectedOption)}
                </span>
              </div>
            </div>

            {/* Confirmation CTA */}
            <button
              onClick={handleBookService}
              disabled={submitting}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                bookingType === 'EMERGENCY'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {submitting ? (
                <span>Dispatching Cooperative Worker...</span>
              ) : bookingType === 'EMERGENCY' ? (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Dispatch Emergency Worker Now</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Scheduled Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
