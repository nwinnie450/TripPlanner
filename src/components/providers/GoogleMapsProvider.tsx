'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

const GoogleMapsContext = createContext(false);

export function useGoogleMapsLoaded() {
  return useContext(GoogleMapsContext);
}

export default function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY || loaded) return;

    // Check if already loaded
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => {}; // Keep loaded=false so map components gracefully skip
    document.head.appendChild(script);
  }, [loaded]);

  return (
    <GoogleMapsContext.Provider value={loaded}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
