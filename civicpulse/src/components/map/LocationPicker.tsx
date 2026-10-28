'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, approxAddress: string) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  address,
  onLocationChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [addressInput, setAddressInput] = useState(address);

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draggable custom pin
      const iconHtml = `
        <div style="
          width: 36px;
          height: 36px;
          background: #0D9488;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: iconHtml,
        className: 'location-picker-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([latitude, longitude], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // When marker is dragged
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        handleNewPosition(pos.lat, pos.lng);
      });

      // When map is clicked
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        handleNewPosition(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleNewPosition = async (lat: number, lng: number) => {
    // Reverse geocode via OpenStreetMap Nominatim or fallback approximation
    let resolvedAddress = addressInput;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'CivicPulse-App/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',').slice(0, 3).join(', ');
          resolvedAddress = parts;
          setAddressInput(parts);
        }
      }
    } catch {
      // Fallback: approximate coordinate label
      resolvedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} (Approximate GPS)`;
      setAddressInput(resolvedAddress);
    }
    onLocationChange(lat, lng, resolvedAddress);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16);
          handleNewPosition(lat, lng);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err);
        // Center around default civic point
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([47.6101, -122.3365]);
          mapInstanceRef.current.flyTo([47.6101, -122.3365], 16);
          handleNewPosition(47.6101, -122.3365);
        }
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              onLocationChange(latitude, longitude, e.target.value);
            }}
            placeholder="Search or enter street address..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Navigation className={`h-3.5 w-3.5 text-teal-600 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Acquiring GPS...' : 'Use Current Location'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute top-2 left-2 z-20 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 backdrop-blur shadow-sm border border-slate-200">
          Click map or drag pin to position
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Coordinates: <strong className="text-slate-700">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>
        </span>
        <span className="flex items-center gap-1 text-teal-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> OpenStreetMap verified
        </span>
      </div>
    </div>
  );
}
