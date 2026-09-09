import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG Icons
const customerIcon = L.divIcon({
  className: 'custom-customer-pin',
  html: `
    <div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); border: 3px solid white;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const workerIcon = L.divIcon({
  className: 'custom-worker-pin',
  html: `
    <div style="background-color: #2563eb; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); border: 3px solid white; animation: pulse 2s infinite;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export function LeafletMap({
  customerCoords = [12.9352, 77.6245], // [lat, lon]
  workerCoords = null,                 // [lat, lon]
  height = '240px',
  zoom = 14
}) {
  const positions = [];
  if (customerCoords) positions.push(customerCoords);
  if (workerCoords) positions.push(workerCoords);

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={workerCoords || customerCoords}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={workerCoords || customerCoords} />

        {customerCoords && (
          <Marker position={customerCoords} icon={customerIcon}>
            <Popup>
              <span className="font-bold text-xs">Your Location</span>
            </Popup>
          </Marker>
        )}

        {workerCoords && (
          <Marker position={workerCoords} icon={workerIcon}>
            <Popup>
              <span className="font-bold text-xs text-blue-600">Technician En Route</span>
            </Popup>
          </Marker>
        )}

        {customerCoords && workerCoords && (
          <Polyline
            positions={[customerCoords, workerCoords]}
            color="#2563eb"
            dashArray="6, 8"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
