'use client';

import { useState, useEffect, useRef } from 'react';
import { useGoogleMapsLoaded } from '@/components/providers/GoogleMapsProvider';
import type { ItineraryItem, TravelSegment, TransportMode } from '@/types';

// In-memory cache keyed by "lat1,lng1|lat2,lng2|MODE"
const segmentCache = new Map<
  string,
  {
    distance: string;
    distanceMeters: number;
    duration: string;
    durationSeconds: number;
  }
>();

function cacheKey(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  mode: TransportMode,
): string {
  return `${fromLat},${fromLng}|${toLat},${toLng}|${mode}`;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return '1 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}

const GOOGLE_TRAVEL_MODES: Partial<Record<TransportMode, google.maps.TravelMode>> = {
  DRIVING: google.maps.TravelMode.DRIVING,
  WALKING: google.maps.TravelMode.WALKING,
  TRANSIT: google.maps.TravelMode.TRANSIT,
  BICYCLING: google.maps.TravelMode.BICYCLING,
};

function toGoogleTravelMode(
  mode: TransportMode,
): google.maps.TravelMode | null {
  return GOOGLE_TRAVEL_MODES[mode] ?? null;
}

interface SegmentPair {
  index: number;
  from: ItineraryItem;
  to: ItineraryItem;
  mode: TransportMode;
}

export function useTravelSegments(items: ItineraryItem[]): TravelSegment[] {
  const mapsLoaded = useGoogleMapsLoaded();
  const [segments, setSegments] = useState<TravelSegment[]>([]);
  const requestRef = useRef(0);

  useEffect(() => {
    if (items.length < 2) {
      setSegments([]);
      return;
    }

    const requestId = ++requestRef.current;

    // Build initial segments array (one per consecutive pair)
    const pairs: SegmentPair[] = [];
    const initial: TravelSegment[] = [];

    for (let i = 0; i < items.length - 1; i++) {
      const from = items[i];
      const to = items[i + 1];
      const hasCoords =
        from.locationLat != null &&
        from.locationLng != null &&
        to.locationLat != null &&
        to.locationLng != null;

      if (!hasCoords) {
        initial.push({
          fromItemId: from.itemId,
          toItemId: to.itemId,
          distance: '',
          distanceMeters: 0,
          duration: '',
          durationSeconds: 0,
          mode: from.transportMode ?? 'DRIVING',
          status: 'no-coords',
        });
        continue;
      }

      const mode = from.transportMode ?? 'DRIVING';

      // FLIGHT: use Haversine distance + estimated flight time (no Google API)
      if (mode === 'FLIGHT') {
        const meters = haversineDistance(
          from.locationLat!,
          from.locationLng!,
          to.locationLat!,
          to.locationLng!,
        );
        // Estimate flight time: ~800 km/h average + 1 hr for boarding/taxi
        const flightSeconds = (meters / 800000) * 3600 + 3600;
        initial.push({
          fromItemId: from.itemId,
          toItemId: to.itemId,
          distance: formatDistance(meters),
          distanceMeters: meters,
          duration: `~${formatDuration(flightSeconds)}`,
          durationSeconds: flightSeconds,
          mode,
          status: 'ok',
        });
        continue;
      }

      const key = cacheKey(
        from.locationLat!,
        from.locationLng!,
        to.locationLat!,
        to.locationLng!,
        mode,
      );
      const cached = segmentCache.get(key);

      if (cached) {
        initial.push({
          fromItemId: from.itemId,
          toItemId: to.itemId,
          ...cached,
          mode,
          status: 'ok',
        });
      } else {
        initial.push({
          fromItemId: from.itemId,
          toItemId: to.itemId,
          distance: '',
          distanceMeters: 0,
          duration: '',
          durationSeconds: 0,
          mode,
          status: 'loading',
        });
        pairs.push({ index: i, from, to, mode });
      }
    }

    setSegments(initial);

    // If nothing to fetch or maps not loaded, done
    if (pairs.length === 0 || !mapsLoaded) return;

    // Fetch uncached segments via Distance Matrix API
    async function fetchSegments() {
      const service = new google.maps.DistanceMatrixService();

      // Process each pair individually to handle different transport modes
      const results = await Promise.allSettled(
        pairs.map((pair) =>
          service.getDistanceMatrix({
            origins: [
              new google.maps.LatLng(
                pair.from.locationLat!,
                pair.from.locationLng!,
              ),
            ],
            destinations: [
              new google.maps.LatLng(
                pair.to.locationLat!,
                pair.to.locationLng!,
              ),
            ],
            travelMode: toGoogleTravelMode(pair.mode)!,
          }),
        ),
      );

      if (requestRef.current !== requestId) return;

      setSegments((prev) => {
        const next = [...prev];
        results.forEach((result, idx) => {
          const pair = pairs[idx];
          const segIdx = pair.index;

          if (
            result.status === 'fulfilled' &&
            result.value.rows[0]?.elements[0]?.status === 'OK'
          ) {
            const el = result.value.rows[0].elements[0];
            const data = {
              distance: el.distance.text,
              distanceMeters: el.distance.value,
              duration: el.duration.text,
              durationSeconds: el.duration.value,
            };

            // Cache it
            const key = cacheKey(
              pair.from.locationLat!,
              pair.from.locationLng!,
              pair.to.locationLat!,
              pair.to.locationLng!,
              pair.mode,
            );
            segmentCache.set(key, data);

            next[segIdx] = {
              ...next[segIdx],
              ...data,
              status: 'ok',
            };
          } else {
            // Fallback to Haversine estimate
            const meters = haversineDistance(
              pair.from.locationLat!,
              pair.from.locationLng!,
              pair.to.locationLat!,
              pair.to.locationLng!,
            );
            next[segIdx] = {
              ...next[segIdx],
              distance: `~${formatDistance(meters)}`,
              distanceMeters: meters,
              duration: '',
              durationSeconds: 0,
              status: 'error',
            };
          }
        });
        return next;
      });
    }

    fetchSegments();
  }, [items, mapsLoaded]);

  return segments;
}
