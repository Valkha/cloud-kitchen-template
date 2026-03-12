"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { siteConfig } from '@/config/site';

// ✅ Configuration des icônes Leaflet (Emoji/DivIcon)
const driverIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="font-size: 32px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5)); transform: scaleX(-1);">🛵</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const restaurantIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="font-size: 32px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5));">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// ✅ Composant pour recentrer la carte sur le livreur
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 1.5
    });
  }, [lat, lng, map]);
  return null;
}

interface DeliveryMapProps {
  driverLat: number | null;
  driverLng: number | null;
}

export default function DeliveryMap({ driverLat, driverLng }: DeliveryMapProps) {
  // Localisation par défaut du restaurant (Genève)
  const restaurantLocation = { lat: 46.1978, lng: 6.1432 }; 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ✅ CORRECTION ESLINT : On utilise un délai de 0ms pour rendre l'appel asynchrone
    // Cela évite le rendu "synchronous cascading" que le linter interdit.
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 md:h-80 bg-neutral-900 animate-pulse rounded-2xl border border-neutral-800 flex items-center justify-center">
        <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">Chargement de la carte...</span>
      </div>
    );
  }

  const currentLat = driverLat || restaurantLocation.lat;
  const currentLng = driverLng || restaurantLocation.lng;

  return (
    <div className="h-64 md:h-80 w-full rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative z-0">
      <MapContainer 
        center={[currentLat, currentLng]} 
        zoom={15} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0a0a0a' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <RecenterAutomatically lat={currentLat} lng={currentLng} />

        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
          <Popup className="custom-leaflet-popup">
            <div className="font-bold text-black">{siteConfig.name}</div>
          </Popup>
        </Marker>

        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="font-bold text-black text-center">Livreur en approche ! 🛵</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
        Live Tracking
      </div>
    </div>
  );
}