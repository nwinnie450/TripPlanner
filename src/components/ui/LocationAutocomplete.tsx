'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleMapsLoaded } from '@/components/providers/GoogleMapsProvider';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: string, lat: number, lng: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

interface Suggestion {
  placeId: string;
  description: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  label = 'Location',
  placeholder = 'e.g., Sagrada Familia, Barcelona',
  error,
}: LocationAutocompleteProps) {
  const mapsLoaded = useGoogleMapsLoaded();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!mapsLoaded || !input.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        // Use legacy AutocompleteService first, fall back to new API
        if (window.google?.maps?.places?.AutocompleteService) {
          const service =
            new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            { input },
            (predictions, status) => {
              if (
                status ===
                  window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                setSuggestions(
                  predictions.map((p) => ({
                    placeId: p.place_id,
                    description: p.description,
                  })),
                );
                setShowDropdown(true);
              } else {
                setSuggestions([]);
              }
            },
          );
        }
      } catch {
        setSuggestions([]);
      }
    },
    [mapsLoaded],
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  }

  async function handleSelect(suggestion: Suggestion) {
    onChange(suggestion.description);
    setSuggestions([]);
    setShowDropdown(false);

    try {
      // Use Geocoder to get lat/lng from the place description
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        address: suggestion.description,
      });
      if (result.results[0]) {
        const loc = result.results[0].geometry.location;
        onSelect(suggestion.description, loc.lat(), loc.lng());
      } else {
        onSelect(suggestion.description, 0, 0);
      }
    } catch {
      onSelect(suggestion.description, 0, 0);
    }
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-slate-600"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={`h-12 w-full rounded-[10px] border border-sand-dark bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean ${error ? 'border-red' : ''}`}
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-[10px] border border-sand-dark bg-white shadow-lg">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-4 py-3 text-[14px] text-slate-700 hover:bg-sand active:bg-sand-dark"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-[13px] text-red">{error}</p>}
    </div>
  );
}
