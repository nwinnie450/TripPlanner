'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useGoogleMapsLoaded } from '@/components/providers/GoogleMapsProvider';
import { ITINERARY_CATEGORY_CONFIG } from '@/lib/constants';
import type { ItineraryItem } from '@/types';
import Card from '@/components/ui/Card';

interface ItineraryMapViewProps {
  items: ItineraryItem[];
}

export default function ItineraryMapView({ items }: ItineraryMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapsLoaded = useGoogleMapsLoaded();

  const withCoords = useMemo(
    () => items.filter((i) => i.locationLat != null && i.locationLng != null),
    [items],
  );
  const withoutCoords = useMemo(
    () =>
      items.filter(
        (i) =>
          (i.locationLat == null || i.locationLng == null) && i.location,
      ),
    [items],
  );

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || withCoords.length === 0) return;

    // Clean up old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }

    const map = mapInstance.current;
    const bounds = new google.maps.LatLngBounds();

    withCoords.forEach((item) => {
      const position = {
        lat: item.locationLat!,
        lng: item.locationLng!,
      };
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        map,
        title: item.title,
      });

      const categoryHtml = item.category
        ? `<span style="display:inline-block;background:${ITINERARY_CATEGORY_CONFIG[item.category].bg};color:${ITINERARY_CATEGORY_CONFIG[item.category].text};padding:2px 8px;border-radius:12px;font-size:11px;margin-top:4px">${ITINERARY_CATEGORY_CONFIG[item.category].emoji} ${item.category}</span>`
        : '';

      const infoContent = `<div style="font-family:system-ui,sans-serif;max-width:220px;padding:4px 0">
        <strong style="font-size:14px">${item.title}</strong>
        ${categoryHtml}
        ${item.time ? `<br/><span style="color:#1B6B93;font-size:12px">${item.time}</span>` : ''}
        ${item.location ? `<br/><span style="color:#666;font-size:12px">${item.location}</span>` : ''}
      </div>`;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    map.fitBounds(bounds);
    if (withCoords.length === 1) {
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        map.setZoom(14);
      });
    }
  }, [mapsLoaded, withCoords]);

  if (!mapsLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        Loading map...
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-[18px] font-semibold text-slate-900">
          No locations on map
        </p>
        <p className="mt-1 text-[13px] text-slate-600">
          Add a location to your activities using the autocomplete to see them
          on the map.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={mapRef}
        className="h-[400px] w-full overflow-hidden rounded-[14px] shadow-card"
      />
      {withoutCoords.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-[13px] font-semibold text-slate-600">
            Activities without map location ({withoutCoords.length})
          </h3>
          <div className="flex flex-col gap-2">
            {withoutCoords.map((item) => (
              <Card key={item.itemId} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {item.time && (
                    <span className="text-[13px] font-semibold text-ocean">
                      {item.time}
                    </span>
                  )}
                  <span className="text-[13px] text-slate-900">
                    {item.title}
                  </span>
                  {item.category && (
                    <span
                      className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor:
                          ITINERARY_CATEGORY_CONFIG[item.category].bg,
                        color:
                          ITINERARY_CATEGORY_CONFIG[item.category].text,
                      }}
                    >
                      {ITINERARY_CATEGORY_CONFIG[item.category].emoji}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
