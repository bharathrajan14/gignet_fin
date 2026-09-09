import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';

// Worker Icons with Workload Indicators
function createWorkerIcon(color, label) {
  return L.divIcon({
    className: 'admin-worker-marker',
    html: `
      <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        ${label}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

const emergencyBookingIcon = L.divIcon({
  className: 'admin-booking-marker',
  html: `
    <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 0 15px #ef4444; animation: pulse 1.5s infinite;">
      ⚡
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export function MapOperations({ workers = [], bookings = [], hexClusters = [], onSelectBooking }) {
  const center = [12.9352, 77.6245]; // Koramangala, Bengaluru

  return (
    <div className="w-full h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* H3 Hexagonal Grid Bins */}
        {hexClusters.map((cluster) => {
          if (!cluster.boundary || cluster.boundary.length === 0) return null;
          return (
            <Polygon
              key={cluster.cellId}
              positions={cluster.boundary}
              pathOptions={{
                color: cluster.demandCount > cluster.workerCount ? '#ef4444' : '#0ea5e9',
                fillColor: cluster.demandCount > cluster.workerCount ? '#ef4444' : '#0ea5e9',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-0.5">
                  <p className="font-extrabold text-sky-400">H3 Cell: {cluster.cellId}</p>
                  <p className="text-slate-300">Active Workers: <span className="text-emerald-400 font-bold">{cluster.workerCount}</span></p>
                  <p className="text-slate-300">Pending Demand: <span className="text-rose-400 font-bold">{cluster.demandCount}</span></p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Worker Markers */}
        {workers.map((item) => {
          const coords = item.location?.coordinates;
          if (!coords) return null;
          const latLon = [coords[1], coords[0]];
          const status = item.workerId?.fairnessMetrics?.workloadStatus || 'BALANCED';

          const color = {
            BALANCED: '#10b981',      // Green (Suresh)
            OVERLOADED: '#ef4444',    // Red (Ramesh)
            UNDERUTILIZED: '#0ea5e9', // Sky blue
            HIGH_WORKLOAD: '#f59e0b'  // Amber
          }[status] || '#10b981';

          const badge = item.workerId?.badgeNumber?.slice(-3) || 'W';

          return (
            <Marker
              key={item._id}
              position={latLon}
              icon={createWorkerIcon(color, badge)}
            >
              <Popup>
                <div className="p-1.5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-white">
                    <span>{item.workerId?.badgeNumber}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: color }}>
                      {status}
                    </span>
                  </div>
                  <p className="text-slate-300">Rating: <span className="text-amber-400 font-bold">★ {item.workerId?.rating?.average || 4.9}</span></p>
                  <p className="text-slate-300">Weekly Jobs: <span className="text-white font-semibold">{item.workerId?.fairnessMetrics?.completedJobsCount || 0}</span></p>
                  <p className="text-slate-400 text-[10px] font-mono">Lat: {coords[1].toFixed(4)}, Lon: {coords[0].toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Booking Markers */}
        {bookings.map((b) => {
          const coords = b.customerLocation?.coordinates;
          if (!coords) return null;
          const latLon = [coords[1], coords[0]];

          return (
            <Marker
              key={b._id}
              position={latLon}
              icon={emergencyBookingIcon}
              eventHandlers={{
                click: () => {
                  if (typeof onSelectBooking === 'function') onSelectBooking(b);
                }
              }}
            >
              <Popup>
                <div className="p-1.5 space-y-1.5 text-xs">
                  <p className="font-extrabold text-rose-400">{b.bookingNumber} [EMERGENCY]</p>
                  <p className="font-bold text-white">{b.serviceId?.name}</p>
                  <p className="text-slate-400 text-[11px] truncate max-w-[200px]">{b.addressText}</p>
                  <button
                    onClick={() => onSelectBooking(b)}
                    className="w-full mt-1 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-lg text-[11px] shadow transition"
                  >
                    View Explainable Trail →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
