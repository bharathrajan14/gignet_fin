import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
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
  Flame,
  Car
} from 'lucide-react';


const CANONICAL_OPTIONS_MAP = {
  PLUMBING: [
    'plumber_pipe_leakage',
    'plumber_tap_leakage',
    'plumber_drain_blockage',
    'plumber_toilet_repair',
    'plumber_water_pump_repair',
    'plumber_bathroom_fitting'
  ],
  ELECTRICAL: [
    'electrician_fan',
    'electrician_washing_machine',
    'electrician_kitchen_items',
    'electrician_installation',
    'electrician_wiring'
  ],
  CARPENTRY: [
    'carpenter_door_repair',
    'carpenter_furniture_repair',
    'carpenter_cupboard_repair',
    'carpenter_bed_repair',
    'carpenter_shelf_installation'
  ],
  MECHANIC: [
    'mechanic_brake_repair',
    'mechanic_engine_problem',
    'mechanic_clutch_problem',
    'mechanic_battery_problem',
    'mechanic_tyre_puncture'
  ],
  DRIVER: [
    'driver_airport_transport',
    'driver_local_trip',
    'driver_outstation_trip',
    'driver_parcel_delivery',
    'driver_goods_transport'
  ],
  APPLIANCE: [
    'electrician_washing_machine',
    'electrician_kitchen_items',
    'electrician_fan'
  ],
  CLEANING: [
    'plumber_drain_blockage',
    'plumber_bathroom_fitting'
  ],
  MASONRY: [
    'carpenter_shelf_installation',
    'plumber_pipe_leakage'
  ]
};

function getCategorySubSkills(category) {
  const norm = (category || '').toUpperCase();
  if (norm.includes('PLUMB')) return CANONICAL_OPTIONS_MAP.PLUMBING;
  if (norm.includes('ELEC')) return CANONICAL_OPTIONS_MAP.ELECTRICAL;
  if (norm.includes('CARP')) return CANONICAL_OPTIONS_MAP.CARPENTRY;
  if (norm.includes('MECH')) return CANONICAL_OPTIONS_MAP.MECHANIC;
  if (norm.includes('DRIV')) return CANONICAL_OPTIONS_MAP.DRIVER;
  if (norm.includes('APPL')) return CANONICAL_OPTIONS_MAP.APPLIANCE;
  if (norm.includes('CLEAN')) return CANONICAL_OPTIONS_MAP.CLEANING;
  if (norm.includes('MASON')) return CANONICAL_OPTIONS_MAP.MASONRY;
  return CANONICAL_OPTIONS_MAP.PLUMBING;
}

export function HomePage({ onBookingCreated, hasActiveBooking, onViewActiveBooking }) {
  const {
    language,
    isTamil,
    t,
    getServiceName,
    getSubServiceName,
    getServiceDescription,
    getBookingTypeName
  } = useLanguage();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // DistilBERT AI Problem Classification State
  const [problemDescription, setProblemDescription] = useState('');
  const [isAnalyzingProblem, setIsAnalyzingProblem] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [isConfirmedProblem, setIsConfirmedProblem] = useState(false);
  const [manualSelectOpen, setManualSelectOpen] = useState(false);

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

  // 8 Canonical Categories with Instant Multilingual Reactive Lookup
  const categoryCards = [
    {
      id: 'plumber',
      category: 'PLUMBING',
      slug: 'plumber',
      icon: Wrench,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      defaultType: 'EMERGENCY',
      options: CANONICAL_OPTIONS_MAP.PLUMBING,
      startingPrice: 199,
      duration: '30–45 mins',
      rating: 4.8
    },
    {
      id: 'electrician',
      category: 'ELECTRICAL',
      slug: 'electrician',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.ELECTRICAL,
      startingPrice: 249,
      duration: '30–60 mins',
      rating: 4.9
    },
    {
      id: 'carpenter',
      category: 'CARPENTRY',
      slug: 'carpenter',
      icon: Hammer,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10 border-pink-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.CARPENTRY,
      startingPrice: 249,
      duration: '1–2 hours',
      rating: 4.8
    },
    {
      id: 'mechanic',
      category: 'MECHANIC',
      slug: 'mechanic',
      icon: Wrench,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.MECHANIC,
      startingPrice: 299,
      duration: '30–45 mins',
      rating: 4.8
    },
    {
      id: 'driver',
      category: 'DRIVER',
      slug: 'driver',
      icon: Car,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.DRIVER,
      startingPrice: 349,
      duration: 'On Demand',
      rating: 4.9
    },
    {
      id: 'appliance',
      category: 'APPLIANCE',
      slug: 'appliance',
      icon: Cpu,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.APPLIANCE,
      startingPrice: 299,
      duration: '45–60 mins',
      rating: 4.8
    },
    {
      id: 'cleaning',
      category: 'CLEANING',
      slug: 'cleaning',
      icon: Sparkles,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.CLEANING,
      startingPrice: 349,
      duration: '2–3 hours',
      rating: 4.7
    },
    {
      id: 'masonry',
      category: 'MASONRY',
      slug: 'masonry',
      icon: Paintbrush,
      iconColor: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/20',
      defaultType: 'SCHEDULED',
      options: CANONICAL_OPTIONS_MAP.MASONRY,
      startingPrice: 499,
      duration: '3–4 hours',
      rating: 4.6
    }
  ];

  // Recommended list cards matching canonical services
  const recommendedItems = [
    {
      id: 'rec-1',
      category: 'PLUMBING',
      slug: 'plumber',
      rating: '4.8',
      icon: Wrench,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15',
      options: CANONICAL_OPTIONS_MAP.PLUMBING,
      startingPrice: 199,
      duration: '45–60 mins'
    },
    {
      id: 'rec-2',
      category: 'ELECTRICAL',
      slug: 'electrician',
      rating: '4.9',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
      options: CANONICAL_OPTIONS_MAP.ELECTRICAL,
      startingPrice: 249,
      duration: '30–60 mins'
    },
    {
      id: 'rec-3',
      category: 'MECHANIC',
      slug: 'mechanic',
      rating: '4.8',
      icon: Wrench,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15',
      options: CANONICAL_OPTIONS_MAP.MECHANIC,
      startingPrice: 299,
      duration: '30–45 mins'
    }
  ];


  const handleOpenBookingModal = (item, defaultBookingType = 'SCHEDULED') => {
    // Reset AI problem classification state
    setProblemDescription('');
    setAiClassification(null);
    setAiError(null);
    setIsConfirmedProblem(false);
    setManualSelectOpen(false);

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

    const initialOpts = item.options || getCategorySubSkills(item.category);
    setSelectedOptions(initialOpts.slice(0, 2));
    setSelectedService({
      ...matchedBackendService,
      slug: item.slug || item.id,
      category: item.category,
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

  const handleAnalyzeProblem = async () => {
    if (!problemDescription.trim()) return;
    if (!selectedService) return;
    try {
      setIsAnalyzingProblem(true);
      setAiError(null);
      setAiClassification(null);
      const res = await api.post('/customer/classify-problem', {
        description: problemDescription.trim(),
        serviceCategory: selectedService.category
      });

      if (res.data?.success && res.data?.data) {
        const classification = res.data.data;
        setAiClassification(classification);
        setIsConfirmedProblem(true);
        if (!classification.isConfident) {
          setManualSelectOpen(true);
        }
      } else {
        setAiError('AI classification returned no result. Please select manually.');
        setManualSelectOpen(true);
      }
    } catch (err) {
      console.error('[AI] Problem classification error:', err);
      const msg = err?.response?.data?.message || err?.message || 'AI service unavailable';
      setAiError(`Classification failed: ${msg}. Please select your problem manually below.`);
      setManualSelectOpen(true);
    } finally {
      setIsAnalyzingProblem(false);
    }
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
        scheduledFor: bookingType === 'SCHEDULED' ? new Date(Date.now() + 7200000).toISOString() : null,
        problemDescription: problemDescription.trim(),
        serviceCategory: selectedService.category,
        subSkillId: aiClassification?.subSkillId || '',
        classificationConfidence: aiClassification?.confidence || 0,
        classificationSource: aiClassification?.source || (aiClassification?.subSkillId ? 'distilbert' : ''),
        modelVersion: aiClassification?.modelVersion || (aiClassification?.subSkillId ? 'v1' : '')
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

  // Filter categories with bilingual search support (English & Tamil)
  const filteredCategories = categoryCards.filter((c) => {
    const localized = getServiceName(c.slug).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      localized.includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 pb-24 space-y-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Live Sync Active Header Indicator */}
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-400 font-semibold px-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{t('ui.liveSync', 'Cross-App Live Sync Active')}</span>
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
              <p className="text-xs font-black text-white">{t('ui.activeBookingBanner', 'Active Booking in Progress')}</p>
              <p className="text-[10px] text-sky-300">{t('ui.activeBookingSub', 'Tap to view live technician map & bill')}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-400 flex items-center">
            {t('ui.track', 'Track')} <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      )}

      {/* 1. Search Bar (Bilingual placeholder) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('ui.searchPlaceholder', 'Search 14+ services (e.g. AC repair, tap leak, CCTV)...')}
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

      {/* 2. Urgent SLA SOS Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-4 border border-amber-600/40 bg-gradient-to-r from-[#2c120a] via-[#1c1424] to-[#121927] shadow-xl shadow-red-950/20">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1 pr-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#e11d48] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                {t('emergency.badge', 'URGENT SLA')}
              </span>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                {t('emergency.title', 'Emergency Service Needed?')}
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {t('emergency.subtitle', 'Pipeline burst, power failure, short circuit? Dispatched under 15 mins.')}
            </p>
          </div>

          <button
            onClick={() => handleOpenBookingModal(categoryCards[0], 'EMERGENCY')}
            className="flex-shrink-0 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/40 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            {t('emergency.sosBtn', 'Instant SOS')}
          </button>
        </div>
      </div>

      {/* 3. Service Categories (8 Cards with Instant Reactive Multilingual Names) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white">{t('ui.serviceCategories', 'Service Categories')}</h2>
          <span className="text-xs font-bold text-sky-400 hover:underline cursor-pointer">
            {t('ui.servicesAvailable', '14 Services Available')}
          </span>
        </div>

        {/* 4 columns x 2 rows grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {filteredCategories.map((cat) => {
            const IconComponent = cat.icon;
            const localizedName = getServiceName(cat.slug);
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
                  {localizedName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recommended Services */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-white">{t('ui.recommendedServices', 'Recommended Services')}</h2>
          <span className="text-xs font-semibold text-slate-400">{t('ui.verifiedCooperative', 'Verified Cooperative')}</span>
        </div>

        <div className="space-y-2.5">
          {recommendedItems.map((rec) => {
            const RecIcon = rec.icon;
            const recTitle = getServiceName(rec.slug);
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
                      {recTitle}
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

      {/* 5. Service Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />

          <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto z-10 text-white animate-in slide-in-from-bottom duration-250">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

            {/* Header: Cooperative Badge & Close button */}
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 bg-[#0369a1]/20 border border-[#0284c7]/50 text-sky-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('ui.cooperativeBadge', 'COOPERATIVE VERIFIED SERVICE')}</span>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="w-7 h-7 rounded-full bg-slate-800/90 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Title and Subtitle with Multilingual translation */}
            <div>
              <h3 className="text-xl font-black text-white">
                {getServiceName(selectedService.slug || selectedService.category)}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {getServiceDescription(selectedService.slug || selectedService.category) || selectedService.description}
              </p>
            </div>

            {/* 3-Column Stats Card */}
            <div className="bg-[#141e33] border border-slate-800/90 rounded-2xl p-3.5 grid grid-cols-3 text-center">
              <div className="border-r border-slate-800/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {t('ui.startingAt', 'STARTING AT')}
                </span>
                <span className="text-base font-black text-white block mt-0.5">
                  ₹{selectedService.startingPrice || 249}
                </span>
              </div>
              <div className="border-r border-slate-800/80 px-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {t('ui.typicalTime', 'TYPICAL TIME')}
                </span>
                <span className="text-xs font-black text-sky-400 block mt-1">
                  {selectedService.duration || '30–45 mins'}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {t('ui.rating', 'RATING')}
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-1 mt-1">
                  ★ {selectedService.rating || 4.8}
                </span>
              </div>
            </div>

            {/* AI Problem Diagnosis with DistilBERT */}
            <div className="bg-[#141e33] border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>{t('ai.describeTitle', 'Describe the problem')}</span>
                </label>
                <span className="text-[10px] font-bold text-sky-400/80 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-sky-400" /> DistilBERT AI
                </span>
              </div>

              <div className="space-y-2">
                <textarea
                  id="problem-description-input"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAnalyzeProblem();
                    }
                  }}
                  rows={2}
                  placeholder={t('ai.describePlaceholder', 'e.g. Kitchen pipe is leaking badly, ceiling fan not spinning, car tyre punctured...')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                />
                <button
                  id="analyze-problem-btn"
                  type="button"
                  onClick={handleAnalyzeProblem}
                  disabled={isAnalyzingProblem || !problemDescription.trim()}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer active:scale-98"
                >
                  {isAnalyzingProblem ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('ai.analyzing', 'Analyzing Problem with DistilBERT...')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('ai.analyzeBtn', 'Analyze Problem')} <span className="font-normal opacity-60 text-[10px]">(Ctrl+Enter)</span></span>
                    </>
                  )}
                </button>

                {/* AI Error Display */}
                {aiError && !aiClassification && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              {/* AI Detection Card (Translates detected problem while preserving canonical subSkillId) */}
              {aiClassification && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-sky-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('ai.detectedProblem', 'AI Detected Problem')}:
                      </span>
                      <p className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {getSubServiceName(aiClassification.subSkillId) || aiClassification.displayName || aiClassification.subSkillId}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {t('ai.subSkillLabel', 'subSkillId')}: {aiClassification.subSkillId}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('ai.confidenceLabel', 'Confidence')}:
                      </span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        aiClassification.confidence >= 0.70 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {(aiClassification.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Low Confidence Warning */}
                  {!aiClassification.isConfident && (
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>{t('ai.lowConfidenceWarning')}</span>
                    </div>
                  )}

                  {/* Category Mismatch Alert */}
                  {aiClassification.categoryMismatch && (
                    <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>{t('ai.categoryMismatchTitle', 'Category Mismatch Detected')}</span>
                      </div>
                      <p className="text-slate-300">
                        {t('ai.categoryMismatchDesc')
                          .replace('{selectedCategory}', selectedService.category)
                          .replace('{detectedCategory}', aiClassification.detectedCategory)
                          .replace('{displayName}', getSubServiceName(aiClassification.subSkillId) || aiClassification.displayName)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons: Confirm / Change */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="confirm-detected-problem-btn"
                      type="button"
                      onClick={() => {
                        setIsConfirmedProblem(true);
                        setManualSelectOpen(false);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        isConfirmedProblem && !manualSelectOpen
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isConfirmedProblem && !manualSelectOpen ? t('ai.confirmed', 'Confirmed') : t('ai.confirm', 'Confirm')}</span>
                    </button>

                    <button
                      id="change-detected-problem-btn"
                      type="button"
                      onClick={() => setManualSelectOpen(!manualSelectOpen)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        manualSelectOpen
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{t('ai.change', 'Change')}</span>
                    </button>
                  </div>

                  {/* Manual Sub-Skill Picker */}
                  {(manualSelectOpen || !aiClassification.isConfident) && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        {t('ai.selectSubSkill', 'Select Specific Sub-Skill:')}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {getCategorySubSkills(selectedService.category).map((subSkillId) => {
                          const localizedSub = getSubServiceName(subSkillId);
                          return (
                            <button
                              key={subSkillId}
                              type="button"
                              onClick={() => {
                                setAiClassification(prev => ({
                                  ...prev,
                                  subSkillId,
                                  predictedLabel: subSkillId,
                                  displayName: localizedSub,
                                  confidence: 1.0,
                                  source: 'manual',
                                  categoryMismatch: false,
                                  isConfident: true
                                }));
                                setIsConfirmedProblem(true);
                                setManualSelectOpen(false);
                              }}
                              className={`p-2 rounded-lg text-[11px] font-bold text-left truncate transition cursor-pointer ${
                                aiClassification.subSkillId === subSkillId
                                  ? 'bg-sky-950 border border-sky-500 text-sky-200'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {localizedSub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available Repair Options (Selectable Chips with Multilingual Names) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-white">
                  {t('ui.repairOptions', 'Available Repair Options')}
                </label>
                <span className="text-xs font-bold text-sky-400">
                  {selectedOptions.length} {t('ui.selectedCount', 'Selected')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedService.availableOptions || getCategorySubSkills(selectedService.category)).map((optionId) => {
                  const isChecked = selectedOptions.includes(optionId);
                  const optionLabel = getSubServiceName(optionId) || optionId;
                  return (
                    <button
                      key={optionId}
                      type="button"
                      onClick={() => toggleOption(optionId)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-400' : 'opacity-0'}`} />
                      <span>{optionLabel}</span>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {t('ui.serviceLocation', 'Service Location')}
                  </span>
                  <p className="text-xs font-bold text-white truncate">{addressText}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
              >
                {detectingLocation ? t('ui.detectingGps', 'Detecting...') : t('ui.useDeviceGps', '📍 Use Device GPS')}
              </button>
            </div>

            {/* Society Guarantee notice */}
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                {t('ui.societyName', 'Bengaluru South Labour Welfare Cooperative')}
              </span>
              <span className="text-emerald-400 font-extrabold">{t('ui.middlemanZero', '0% Middleman')}</span>
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
                <span>{t('scheduled.title', 'Schedule Service')}</span>
              </button>

              <button
                id="emergency-service-btn"
                disabled={submitting}
                type="button"
                onClick={() => handleConfirmBooking('EMERGENCY')}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 fill-current" />
                <span>{t('bookingTypes.EMERGENCY', 'Emergency Service')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

