import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, RefreshCw, Share2, AlertTriangle, ShieldCheck, CheckCircle, Wrench, Zap, Wind, Hammer, Sparkles, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const CATEGORIES = [
  { id: 'PLUMBING', label: 'Plumbing', icon: Wrench },
  { id: 'ELECTRICAL', label: 'Electrical', icon: Zap },
  { id: 'APPLIANCE', label: 'Appliance & HVAC', icon: Wind },
  { id: 'CARPENTRY', label: 'Carpentry', icon: Hammer },
  { id: 'CLEANING', label: 'Cleaning', icon: Sparkles },
  { id: 'MASONRY', label: 'Masonry & Painting', icon: Building2 }
];

export function DemandForecastPage() {
  const [selectedCategory, setSelectedCategory] = useState('PLUMBING');
  const [forecasts, setForecasts] = useState([]);
  const [sharingRequests, setSharingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);

  useEffect(() => {
    fetchData(selectedCategory);
  }, [selectedCategory]);

  const fetchData = async (category = selectedCategory) => {
    try {
      setLoading(true);
      const [forecastRes, sharingRes] = await Promise.all([
        api.get(`/admin/forecasts?category=${category}`),
        api.get('/admin/worker-sharing')
      ]);

      if (forecastRes.data.success) {
        setForecasts(forecastRes.data.data || []);
      }
      if (sharingRes.data.success) {
        setSharingRequests(sharingRes.data.data || []);
      }
    } catch (err) {
      console.error('[ForecastPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await api.post('/admin/forecasts/recalculate', { category: selectedCategory });
      if (res.data.success) {
        await fetchData(selectedCategory);
      }
    } catch (err) {
      alert('Forecast computation error: ' + err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleInitiateSharing = async () => {
    try {
      setSharingLoading(true);
      const res = await api.post('/admin/worker-sharing', {
        serviceCategory: selectedCategory,
        requestedCount: 3
      });
      if (res.data.success) {
        await fetchData(selectedCategory);
      }
    } catch (err) {
      alert('Workforce sharing error: ' + err.message);
    } finally {
      setSharingLoading(false);
    }
  };

  const chartData = forecasts.map((f, idx) => ({
    day: `Day ${idx + 1} (${new Date(f.targetDate).toLocaleDateString(undefined, { weekday: 'short' })})`,
    predictedDemand: f.predictedDemandCount,
    availableWorkforce: f.currentAvailableWorkforce,
    workforceGap: f.workforceGap
  }));

  const totalShortage = forecasts.reduce((acc, f) => acc + (f.workforceGap > 0 ? f.workforceGap : 0), 0);
  const hasShortage = totalShortage > 0;
  const currentActiveCategory = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">AI Demand Forecasting & Workforce Planning</h1>
            <span className="text-[10px] font-mono uppercase bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded">
              Ridge ML Microservice
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seasonality-aware ML model running CPU-only (0 GPU / 0 paid AI APIs). Computes 7-day predictive demand & workforce deficits across all 6 trade guilds.
          </p>
        </div>

        <button
          disabled={recalculating}
          onClick={handleRecalculate}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? `Computing ${currentActiveCategory?.label}...` : `Recalculate ${currentActiveCategory?.label} ML`}</span>
        </button>
      </div>

      {/* Trade Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Deficit & Recommendation Alert */}
      <div className={`border rounded-3xl p-5 flex flex-col md:flex-row items-start justify-between gap-4 transition ${
        hasShortage
          ? 'bg-gradient-to-r from-rose-950/60 to-slate-900 border-rose-900/60'
          : 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-900/60'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            hasShortage ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {hasShortage ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>
                {hasShortage
                  ? `Projected Net Deficit in ${currentActiveCategory?.label}: ~${Math.round(totalShortage)} Worker Shifts`
                  : `Workforce Balanced for ${currentActiveCategory?.label}`}
              </span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                hasShortage ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
              }`}>
                {hasShortage ? 'Shortage Warning' : 'Optimal Capacity'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {hasShortage
                ? `Predicted 7-day demand for ${currentActiveCategory?.label} exceeds current verified local society capacity. Deficit = Predicted Demand − Available Workforce. Federation Workforce Sharing recommended.`
                : `Current verified ${currentActiveCategory?.label} workforce meets or exceeds projected customer bookings for the coming 7-day period.`}
            </p>
          </div>
        </div>

        {hasShortage && (
          <button
            disabled={sharingLoading}
            onClick={handleInitiateSharing}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition flex-shrink-0 self-start md:self-center"
          >
            <Share2 className="w-4 h-4" />
            <span>{sharingLoading ? 'Processing Guild Transfer...' : `Request 3 ${currentActiveCategory?.label} Workers from Indiranagar`}</span>
          </button>
        )}
      </div>

      {/* 7-Day Demand vs Available Capacity Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white">
              7-Day Predicted Demand vs Available Society Workforce ({currentActiveCategory?.label})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ridge Regression with Temporal Seasonality (Weekend surge multipliers & trend priors)
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800">
            Horizon: 7 Days
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-bold">
            No forecast data generated for {currentActiveCategory?.label} yet. Click "Recalculate ML" to generate.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="predictedDemand" name="Predicted Demand" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="availableWorkforce" name="Active Workers" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="workforceGap" name="Deficit Gap" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Active Inter-Cooperative Sharing Contracts */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-white">Inter-Cooperative Workforce Sharing Agreements</h4>
            <p className="text-[11px] text-slate-400">Mutual aid pact between Bengaluru cooperative societies</p>
          </div>
          <span className="text-xs text-slate-400 font-bold">{sharingRequests.length} Active Contracts</span>
        </div>

        {sharingRequests.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-bold">
            No inter-cooperative worker sharing requests initiated yet.
          </div>
        ) : (
          <div className="space-y-2">
            {sharingRequests.map((req) => (
              <div
                key={req._id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-white">
                      Loaned {req.approvedCount || req.requestedCount} Workers in {req.serviceCategory}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Transferred from Indiranagar Society to Bengaluru South Society
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
