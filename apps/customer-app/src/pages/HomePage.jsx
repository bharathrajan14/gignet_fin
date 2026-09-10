import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search,
  Zap, 
  Calendar, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Cpu,
  Hammer,
  Check,
  Building,
  ChevronRight,
  Paintbrush,
  Snowflake,
  Star,
  MapPin,
  X,
  Flame
} from 'lucide-react';

export function HomePage({ onBookingCreated, hasActiveBooking, onViewActiveBooking }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Location state
  const [customerCoords, setCustomerCoords] = useState([77.6245, 12.9352]); // [lon, lat]
  const [addressText, setAddressText] = useState('12th Main, Koramangala 4th Block, Bengaluru');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCustomerCoords([lon, lat]);
        setAddressText(`Live Device GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        setDetectingLocation(false);
      },
      (error) => {
        console.warn('GPS location error:', error.message);
        alert('Device GPS error: ' + error.message + '. Using default Koramangala location.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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

  // 8 Grid Categories from Screenshot 1
  const categoryCards = [
    {
      id: 'EMERGENCY_PLUMBING',
      category: 'PLUMBING',
      name: 'Emergency Plumbing',
      icon: Wrench,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      defaultType: 'EMERGENCY',
      desc: 'Urgent pipeline burst, tap flood, drainage blockage requiring immediate response',
      options: ['Pipe repair', 'Leakage', 'Tap repair', 'Drainage', 'Water connection'],
      startingPrice: 249,
      duration: '30–45 mins',
      rating: 4.8
    },
    {
      id: 'SCHEDULED_PLUMBING',
      category: 'PLUMBING',
      name: 'Scheduled Plumbing',
      icon: Wrench,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Fixture installation, geyser line setup, bathroom sanitary fitting and maintenance',
      options: ['Faucet replacement', 'Geyser pipeline', 'Water tank cleaning', 'Sanitary fittings'],
      startingPrice: 199,
      duration: '45–60 mins',
      rating: 4.7
    },
    {
      id: 'ELECTRICAL_SERVICE',
      category: 'ELECTRICAL',
      name: 'Electrical Service',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Switchboard repair, short circuit fixes, fan/light wiring and power surge diagnosis',
      options: ['Short circuit fix', 'Switchboard install', 'MCB replacement', 'Ceiling fan wiring'],
      startingPrice: 299,
      duration: '30–60 mins',
      rating: 4.9
    },
    {
      id: 'HOME_CLEANING',
      category: 'CLEANING',
      name: 'Home Cleaning',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Deep kitchen scrubbing, bathroom sanitization, floor buffing and complete home disinfection',
      options: ['Kitchen deep clean', 'Bathroom sanitization', 'Floor scrub', 'Sofa shampoo'],
      startingPrice: 349,
      duration: '2–3 hours',
      rating: 4.7
    },
    {
      id: 'CARPENTRY_WOODWORK',
      category: 'CARPENTRY',
      name: 'Carpentry & Woodwork',
      icon: Hammer,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10 border-pink-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Door latch repair, furniture assembly, hinge realignment and cabinet fabrication',
      options: ['Door lock fix', 'Hinge replacement', 'Bed assembly', 'Shelf mounting'],
      startingPrice: 249,
      duration: '1–2 hours',
      rating: 4.8
    },
    {
      id: 'PAINTING_WATERPROOFING',
      category: 'MASONRY',
      name: 'Painting & Waterproofing',
      icon: Paintbrush,
      iconColor: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Wall seepage treatment, touch-up painting, roof waterproofing coat application',
      options: ['Wall seepage fix', 'Balcony waterproofing', 'Room repaint', 'Crack filling'],
      startingPrice: 499,
      duration: '3–4 hours',
      rating: 4.6
    },
    {
      id: 'APPLIANCE_REPAIR',
      category: 'APPLIANCE',
      name: 'Appliance Repair',
      icon: Cpu,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Washing machine motor fix, refrigerator cooling issues, microwave diagnosis',
      options: ['Washing machine fix', 'Refrigerator cooling', 'Microwave repair', 'Motor replacement'],
      startingPrice: 299,
      duration: '45–60 mins',
      rating: 4.8
    },
    {
      id: 'HVAC_AC_SERVICE',
      category: 'APPLIANCE',
      name: 'HVAC & AC Service',
      icon: Snowflake,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      defaultType: 'SCHEDULED',
      desc: 'Split AC filter foam clean, gas charging, cooling coil repair, outdoor unit servicing',
      options: ['AC filter deep clean', 'Gas leak recharge', 'PCB circuit fix', 'Water dripping fix'],
      startingPrice: 399,
      duration: '1–2 hours',
      rating: 4.9
    }
  ];

  // Recommended list cards matching Screenshot 1
  const recommendedItems = [
    {
      id: 'rec-1',
      category: 'PLUMBING',
      title: 'Scheduled Plumbing',
      subtitle: 'From ₹199 • 45–60 mins',
      rating: '4.7',
      icon: Wrench,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15',
      desc: 'Comprehensive society plumbing inspection, fixture installation & pipe leak seal.',
      options: ['Pipe repair', 'Leakage', 'Tap repair', 'Drainage', 'Water connection'],
      startingPrice: 199,
      duration: '45–60 mins'
    },
    {
      id: 'rec-2',
      category: 'ELECTRICAL',
      title: 'Electrical Service',
      subtitle: 'From ₹299 • 30–60 mins',
      rating: '4.9',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
      desc: 'Certified society electrician for short circuits, MCB repair, switchboard rewiring.',
      options: ['Short circuit fix', 'Switchboard install', 'MCB replacement', 'Ceiling fan wiring'],
      startingPrice: 299,
      duration: '30–60 mins'
    },
    {
      id: 'rec-3',
      category: 'CLEANING',
      title: 'Home Cleaning',
      subtitle: 'From ₹349 • 2–3 hours',
      rating: '4.7',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
      desc: 'Deep home sanitization, kitchen chimney degreasing and tile scrubbing.',
      options: ['Kitchen deep clean', 'Bathroom sanitization', 'Floor scrub', 'Sofa shampoo'],
      startingPrice: 349,
      duration: '2–3 hours'
    }
  ];

  const handleOpenBookingModal = (item, defaultBookingType = 'SCHEDULED') => {
    // Find matching service from backend catalog, or create virtual matching item
    const matchedBackendService = services.find(
      (s) => s.category === item.category || s.name.toLowerCase().includes(item.name?.toLowerCase() || '')
    ) || services[0] || {
      _id: '65f000000000000000000001',
      name: item.name || item.title,
      category: item.category,
      basePrice: item.startingPrice || 249,
      emergencyMultiplier: 1.5,
      estimatedDurationMinutes: 45
    };

    const initialOpts = item.options || ['Pipe repair', 'Leakage', 'Tap repair', 'Drainage', 'Water connection'];
    setSelectedOptions(initialOpts);
    setSelectedService({
      ...matchedBackendService,
      displayName: item.name || item.title,
      description: item.desc,
      startingPrice: item.startingPrice || matchedBackendService.basePrice || 249,
      duration: item.duration || `${matchedBackendService.estimatedDurationMinutes || 45} mins`,
      rating: item.rating || 4.8,
      defaultType: defaultBookingType,
      availableOptions: initialOpts
    });
  };

  const toggleOption = (opt) => {
    setSelectedOptions((prev) => 
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleConfirmBooking = async (bookingType) => {
    if (!selectedService) return;
    try {
      setSubmitting(true);
      const targetService = services.find((s) => s._id === selectedService._id) ||
                            services.find((s) => s.category === selectedService.category) ||
                            services[0];
      const serviceId = targetService?._id;

      const res = await api.post('/customer/bookings', {
        serviceId,
        bookingType,
        customerLocation: customerCoords,
        addressText: `${addressText} (Options: ${selectedOptions.join(', ') || 'Standard Inspection'})`,
        scheduledFor: bookingType === 'SCHEDULED' ? new Date(Date.now() + 7200000).toISOString() : null
      });

      if (res.data.success) {
        setSelectedService(null);
        if (typeof onBookingCreated === 'function') {
          onBookingCreated(res.data.data);
        }
      }
    } catch (err) {
      alert('Failed to book service: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories and recommended if user types in search bar
  const filteredCategories = categoryCards.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 pb-24 space-y-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Live Sync Active Header Indicator */}
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-400 font-semibold px-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Cross-App Live Sync Active</span>
      </div>

      {/* Active Booking Floating Banner if exists */}
      {hasActiveBooking && (
        <div 
          onClick={onViewActiveBooking}
          className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/50 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-sky-400 transition shadow-lg shadow-sky-950/40"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Active Booking in Progress</p>
              <p className="text-[10px] text-sky-300">Tap to view live technician map & bill</p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-400 flex items-center">
            Track <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      )}

      {/* 1. Search Bar (Matching Screenshot 1) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 14+ services (e.g. AC repair, tap leak, CCTV)..."
          className="w-full bg-[#111928] border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Urgent SLA SOS Hero Banner (Matching Screenshot 1) */}
      <div className="relative overflow-hidden rounded-3xl p-4 border border-amber-600/40 bg-gradient-to-r from-[#2c120a] via-[#1c1424] to-[#121927] shadow-xl shadow-red-950/20">
        {/* Glow ambient */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1 pr-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#e11d48] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                URGENT SLA
              </span>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                Emergency Service Needed?
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Pipeline burst, power failure, short circuit? Dispatched under 15 mins.
            </p>
          </div>

          <button
            onClick={() => handleOpenBookingModal(categoryCards[0], 'EMERGENCY')}
            className="flex-shrink-0 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/40 active:scale-95 transition flex items-center gap-1.5"
          >
            Instant SOS
          </button>
        </div>
      </div>

      {/* 3. Service Categories (Matching Screenshot 1 - 8 Squircle Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white">Service Categories</h2>
          <span className="text-xs font-bold text-sky-400 hover:underline cursor-pointer">
            14 Services Available
          </span>
        </div>

        {/* 4 columns x 2 rows grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {filteredCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleOpenBookingModal(cat, cat.defaultType)}
                className="bg-[#121a2d] hover:bg-[#18233c] border border-slate-800/90 hover:border-sky-500/50 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] group shadow-sm min-h-[96px]"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.iconBg} border flex items-center justify-center mb-1.5 group-hover:scale-110 transition`}>
                  <IconComponent className={`w-5 h-5 ${cat.iconColor}`} />
                </div>
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recommended Services (Matching Screenshot 1) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white">Recommended Services</h2>
          <span className="text-xs font-semibold text-slate-400">Verified Cooperative</span>
        </div>

        <div className="space-y-2.5">
          {recommendedItems.map((rec) => {
            const RecIcon = rec.icon;
            return (
              <div
                key={rec.id}
                onClick={() => handleOpenBookingModal(rec, 'SCHEDULED')}
                className="bg-[#121a2d] hover:bg-[#18233c] border border-slate-800/80 hover:border-sky-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl ${rec.iconBg} border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition`}>
                    <RecIcon className={`w-5 h-5 ${rec.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-white group-hover:text-sky-400 transition truncate">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {rec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rec.rating}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Service Booking Modal (Matching Screenshot 2) */}
      {selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />

          {/* Bottom Sheet Card */}
          <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto z-10 text-white animate-in slide-in-from-bottom duration-250">
            {/* Grab Bar for mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

            {/* Header: Cooperative Badge & Close button */}
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 bg-[#0369a1]/20 border border-[#0284c7]/50 text-sky-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>COOPERATIVE VERIFIED SERVICE</span>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="w-7 h-7 rounded-full bg-slate-800/90 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Title and Subtitle */}
            <div>
              <h3 className="text-xl font-black text-white">
                {selectedService.displayName || selectedService.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedService.description || 'Urgent pipeline burst, tap flood, drainage blockage requiring immediate response'}
              </p>
            </div>

            {/* 3-Column Stats Card (Starting At / Typical Time / Rating) */}
            <div className="bg-[#141e33] border border-slate-800/90 rounded-2xl p-3.5 grid grid-cols-3 text-center">
              <div className="border-r border-slate-800/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  STARTING AT
                </span>
                <span className="text-base font-black text-white block mt-0.5">
                  ₹{selectedService.startingPrice || 249}
                </span>
              </div>
              <div className="border-r border-slate-800/80 px-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  TYPICAL TIME
                </span>
                <span className="text-xs font-black text-sky-400 block mt-1">
                  {selectedService.duration || '30–45 mins'}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  RATING
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-1 mt-1">
                  ★ {selectedService.rating || 4.8}
                </span>
              </div>
            </div>

            {/* Available Repair Options (Green Selectable Pill Chips) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-white">
                  Available Repair Options
                </label>
                <span className="text-xs font-bold text-sky-400">
                  {selectedOptions.length} Selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedService.availableOptions || [
                  'Pipe repair',
                  'Leakage',
                  'Tap repair',
                  'Drainage',
                  'Water connection'
                ]).map((option) => {
                  const isChecked = selectedOptions.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-400' : 'opacity-0'}`} />
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live GPS Location Detector Card */}
            <div className="bg-[#141e33] border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Service Location</span>
                  <p className="text-xs font-bold text-white truncate">{addressText}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold shrink-0 transition flex items-center gap-1"
              >
                {detectingLocation ? 'Detecting...' : '📍 Use Device GPS'}
              </button>
            </div>

            {/* Society Guarantee notice */}
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                Bengaluru South Labour Welfare Cooperative
              </span>
              <span className="text-emerald-400 font-extrabold">0% Middleman</span>
            </div>

            {/* Dual Action Buttons: Schedule Service & Emergency Service */}
            <div className="flex gap-2.5 pt-1">
              <button
                id="schedule-service-btn"
                disabled={submitting}
                type="button"
                onClick={() => handleConfirmBooking('SCHEDULED')}
                className="flex-1 py-3.5 rounded-2xl bg-[#141e33] hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Schedule Service</span>
              </button>

              <button
                id="emergency-service-btn"
                disabled={submitting}
                type="button"
                onClick={() => handleConfirmBooking('EMERGENCY')}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 fill-current" />
                <span>Emergency Service</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
