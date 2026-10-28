'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Issue, STATUS_METADATA, CATEGORY_METADATA } from '@/types/database';
import { ThumbsUp, ArrowRight, MapPin } from 'lucide-react';

interface LeafletIssueMapProps {
  issues: Issue[];
  selectedIssueId?: string | null;
  onSelectIssue?: (issue: Issue) => void;
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}

export default function LeafletIssueMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  center = [47.615, -122.335],
  zoom = 13,
  heightClass = 'h-[600px]',
}: LeafletIssueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet on client side
    let isSubscribed = true;

    import('leaflet').then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add clean, high-contrast OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create markers
      renderMarkers(L, map, issues);
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        renderMarkers(L, mapInstanceRef.current, issues);
      }
    });
  }, [issues, selectedIssueId]);

  const renderMarkers = (L: any, map: any, items: Issue[]) => {
    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (!items || items.length === 0) return;

    const bounds = L.latLngBounds([]);

    items.forEach((issue) => {
      const statusMeta = STATUS_METADATA[issue.status] || STATUS_METADATA.reported;
      const isUrgent = issue.priority === 'urgent' && issue.status !== 'resolved';
      const isSelected = issue.id === selectedIssueId;

      // SVG Pin Icon with Status Coloring
      const iconHtml = `
        <div class="custom-civic-pin ${isUrgent ? 'pulse-urgent' : ''}" style="
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          border: 3px solid ${isSelected ? '#0F172A' : statusMeta.hex};
        ">
          <div style="
            width: ${isSelected ? '16px' : '12px'};
            height: ${isSelected ? '16px' : '12px'};
            border-radius: 50%;
            background-color: ${statusMeta.hex};
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'civic-marker-wrapper',
        iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
        iconAnchor: [isSelected ? 19 : 16, isSelected ? 19 : 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });

      const catMeta = CATEGORY_METADATA[issue.category] || CATEGORY_METADATA.other;

      // Popup Content Card
      const popupHtml = `
        <div style="width: 270px; font-family: system-ui, sans-serif; background: #ffffff;">
          ${
            issue.image_url
              ? `<div style="height: 120px; width: 100%; overflow: hidden; background: #e2e8f0; position: relative;">
                  <img src="${issue.image_url}" alt="${issue.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.8); color: white; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; backdrop-filter: blur(4px);">
                    ${catMeta.label}
                  </span>
                </div>`
              : ''
          }
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: ${statusMeta.hex}; background: ${statusMeta.hex}15; padding: 2px 8px; border-radius: 999px; border: 1px solid ${statusMeta.hex}30;">
                ● ${statusMeta.label}
              </span>
              <span style="font-size: 11px; color: #64748B; font-weight: 500;">
                ▲ ${issue.upvotes_count} upvotes
              </span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #0F172A; line-height: 1.3;">
              ${issue.title}
            </h4>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748B; display: flex; align-items: center; gap: 4px;">
              📍 ${issue.address}
            </p>
            <a href="/issues/${issue.id}" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 8px 12px; background: #0D9488; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; box-sizing: border-box;">
              View Details & Timeline →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('click', () => {
        if (onSelectIssue) onSelectIssue(issue);
      });

      marker.addTo(map);
      markersRef.current.set(issue.id, marker);
      bounds.extend([issue.latitude, issue.longitude]);
    });

    // If an issue is explicitly selected, open its popup and center
    if (selectedIssueId && markersRef.current.has(selectedIssueId)) {
      const selectedMarker = markersRef.current.get(selectedIssueId);
      selectedMarker.openPopup();
      map.flyTo(selectedMarker.getLatLng(), Math.max(map.getZoom(), 15), {
        duration: 0.8,
      });
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 0.8 });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || issues.length === 0) return;
    import('leaflet').then((L) => {
      const bounds = L.latLngBounds(issues.map((i) => [i.latitude, i.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${heightClass}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter to City Center"
          className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur border border-slate-200 hover:bg-white hover:text-teal-700 transition"
        >
          <MapPin className="h-3.5 w-3.5 text-teal-600" />
          City Center
        </button>
        <button
          onClick={handleFitAll}
          title="Fit all markers"
          className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur border border-slate-200 hover:bg-white hover:text-teal-700 transition"
        >
          View All ({issues.length})
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 rounded-xl bg-white/95 p-2.5 text-xs shadow-md backdrop-blur border border-slate-200 hidden sm:block">
        <div className="font-semibold text-slate-800 mb-1.5 text-[11px] uppercase tracking-wider">
          Issue Status Legend
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Reported</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-600">Under Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            <span className="text-slate-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-600">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
