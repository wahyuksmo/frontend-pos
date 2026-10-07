"use client";

import React, { useEffect, useRef } from "react";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LocationMapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  radius?: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  height?: string;
}

export function LocationMapPicker({
  latitude,
  longitude,
  radius = 100,
  onChange,
  readOnly = false,
  height = "320px",
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // Default to Jakarta if null
  const defaultLat = -6.2088;
  const defaultLng = 106.8456;

  const currentLat =
    latitude !== undefined && latitude !== null && !isNaN(Number(latitude))
      ? Number(latitude)
      : defaultLat;
  const currentLng =
    longitude !== undefined && longitude !== null && !isNaN(Number(longitude))
      ? Number(longitude)
      : defaultLng;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let L: any;
    let isMounted = true;

    // Dynamically import leaflet on client-side only
    import("leaflet").then((leaflet) => {
      if (!isMounted || !mapContainerRef.current) return;
      L = leaflet;

      // Custom marker icon using styled divIcon
      const customPinIcon = L.divIcon({
        className: "custom-map-pin-icon",
        html: `<div style="
          background-color: #0284c7;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 16,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([currentLat, currentLng], {
          icon: customPinIcon,
          draggable: !readOnly,
        }).addTo(map);

        const circle = L.circle([currentLat, currentLng], {
          radius: Number(radius) || 100,
          color: "#0284c7",
          fillColor: "#38bdf8",
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(map);

        if (!readOnly && onChange) {
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            const formattedLat = Number(lat.toFixed(7));
            const formattedLng = Number(lng.toFixed(7));
            marker.setLatLng([formattedLat, formattedLng]);
            circle.setLatLng([formattedLat, formattedLng]);
            onChange(formattedLat, formattedLng);
          });

          marker.on("dragend", (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            const formattedLat = Number(lat.toFixed(7));
            const formattedLng = Number(lng.toFixed(7));
            circle.setLatLng([formattedLat, formattedLng]);
            onChange(formattedLat, formattedLng);
          });
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;

        // Invalidate map size after modal transition completes
        setTimeout(() => {
          map.invalidateSize();
        }, 250);
      } else {
        const map = mapInstanceRef.current;
        map.setView([currentLat, currentLng], map.getZoom());
        if (markerRef.current) {
          markerRef.current.setLatLng([currentLat, currentLng]);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([currentLat, currentLng]);
          circleRef.current.setRadius(Number(radius) || 100);
        }
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentLat, currentLng, radius, readOnly]);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(7));
          const lng = Number(pos.coords.longitude.toFixed(7));
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 17);
          }
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          if (circleRef.current) {
            circleRef.current.setLatLng([lat, lng]);
          }
          if (onChange) {
            onChange(lat, lng);
          }
        },
        (err) => {
          alert("Gagal mengambil lokasi GPS: " + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation tidak didukung pada peramban ini.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Compass className="h-4 w-4 text-primary-500" />
          <span>
            {readOnly
              ? "Peta Lokasi Absensi"
              : "Klik atau geser pin pada peta untuk memilih lokasi"}
          </span>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            className="h-7 text-xs px-2.5 gap-1 font-heading"
          >
            <Navigation className="h-3.5 w-3.5 text-primary-500" />
            <span>GPS Saya</span>
          </Button>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-galaxy-border shadow-sm">
        <div ref={mapContainerRef} style={{ height, width: "100%" }} className="z-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-galaxy-card/80 p-2 rounded-lg border border-slate-100 dark:border-galaxy-border">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-700 dark:text-slate-300">
            <strong>Lat:</strong> {currentLat.toFixed(6)}
          </span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            <strong>Lng:</strong> {currentLng.toFixed(6)}
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
          <MapPin className="h-3.5 w-3.5" />
          <span>Radius Absen: {radius || 100} meter</span>
        </div>
      </div>
    </div>
  );
}
