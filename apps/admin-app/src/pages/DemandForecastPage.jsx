import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, RefreshCw, Share2, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export function DemandForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [sharingRequests, setSharingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [forecastRes, sharingRes] = await Promise.all([
        api.get('/admin/forecasts'),
        api.get('/admin/worker-sharing')
      ]);

      if (forecastRes.data.success) setForecasts(forecastRes.data.data || []);
      if (sharingRes.data.success) setSharingRequests(sharingRes.data.data || []);
    } catch (err) {
      console.error('[ForecastPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await api.post('/admin/forecasts/recalculate');
      if (res.data.success) {
        await fetchData();
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
        serviceCategory: 'PLUMBING',
        requestedCount: 3
      });
      if (res.data.success) {
        await fetchData();
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

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Demand Forecasting & Workforce Planning Microservice</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Python FastAPI + scikit-learn Ridge/Poisson regression running CPU-only (0 GPU / 0 paid AI APIs).
          </p>
        </div>

        <button
          disabled={recalculating}
          onClick={handleRecalculate}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Running Python ML...' : 'Recalculate Forecast'}</span>
        </button>
      </div>

      {/* Top Deficit & Recommendation Alert */}
      <div className="bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-900/60 rounded-3xl p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Projected Net Workforce Deficit: ~{Math.round(totalShortage)} Worker Shifts
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Predicted demand for PLUMBING exceeds currently verified active workforce across the coming 7 days.
              Workforce Gap = Predicted Demand − Available Workforce. Federation sharing recommended.
            </p>
          </div>
        </div>

        <button
          disabled={sharingLoading}
          onClick={handleInitiateSharing}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition flex-shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>{sharingLoading ? 'Processing...' : 'Request 3 Workers from Indiranagar'}</span>
        </button>
      </div>

      {/* 7-Day Demand vs Available Capacity Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white">7-Day Predicted Demand vs Available Society Workforce</h3>
            <p className="text-xs text-slate-400 mt-0.5">Computed by lightweight CPU ML model with weekend seasonality priors</p>
          </div>
          <span className="text-xs font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800">
            Horizon: 7 Days
          </span>
        </div>

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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Inter-Cooperative Sharing Contracts */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-white">Active Inter-Cooperative Workforce Sharing Agreements</h4>
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
