'use client';

import { useState } from 'react';
import { Car, Footprints, Train, Bike, Plane } from 'lucide-react';
import type { ItineraryItem, ItineraryCategory, TransportMode } from '@/types';
import { ITINERARY_CATEGORIES, ITINERARY_CATEGORY_CONFIG } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

interface ItineraryFormProps {
  dates: string[];
  initialData?: Partial<ItineraryItem>;
  onSubmit: (data: {
    dayDate: string;
    title: string;
    time: string;
    location: string;
    locationLat?: number;
    locationLng?: number;
    category?: ItineraryCategory;
    transportMode?: TransportMode;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

export default function ItineraryForm({
  dates,
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}: ItineraryFormProps) {
  const [dayDate, setDayDate] = useState(initialData?.dayDate ?? dates[0] ?? '');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [time, setTime] = useState(initialData?.time ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [locationLat, setLocationLat] = useState<number | undefined>(initialData?.locationLat);
  const [locationLng, setLocationLng] = useState<number | undefined>(initialData?.locationLng);
  const [category, setCategory] = useState<ItineraryCategory | undefined>(initialData?.category);
  const [transportMode, setTransportMode] = useState<TransportMode | undefined>(
    initialData?.transportMode,
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!dayDate) errs.dayDate = 'Day is required';
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      dayDate,
      title: title.trim(),
      time,
      location: location.trim(),
      ...(locationLat != null && locationLng != null && { locationLat, locationLng }),
      ...(category != null && { category }),
      ...(transportMode != null && { transportMode }),
      notes: notes.trim(),
    });
  }

  function handleLocationSelect(loc: string, lat: number, lng: number) {
    setLocation(loc);
    setLocationLat(lat);
    setLocationLng(lng);
  }

  function handleLocationChange(val: string) {
    setLocation(val);
    setLocationLat(undefined);
    setLocationLng(undefined);
  }

  const dateOptions = dates.map((d) => ({ value: d, label: formatDate(d) }));

  const travelModeEmojis: Record<string, string> = {
    DRIVING: '🚗',
    WALKING: '🚶',
    TRANSIT: '🚌',
    BICYCLING: '🚲',
    FLIGHT: '✈️',
  };

  return (
    <div className="overflow-hidden rounded-[24px] border-t-4 border-dashed border-[#8B5CF6]/30 bg-white shadow-lg">
      {/* Boarding pass header */}
      <div className="relative bg-gradient-to-r from-violet-50 to-amber-50/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[20px]">🎫</span>
          <h2 className="font-[family-name:var(--font-display)] text-[16px] font-bold text-slate-800">
            {initialData ? 'Update Your Plans' : 'Plan Something Fun'}
          </h2>
        </div>
        {/* Decorative perforation */}
        <div className="absolute -bottom-[1px] left-0 right-0 flex justify-between px-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-gradient-to-b from-violet-50/0 to-white"
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
        <Input
          label="Title *"
          placeholder="e.g., Visit Sagrada Familia"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        {/* Side-by-side Day and Time */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="🗓️ Day *"
            options={dateOptions}
            value={dayDate}
            onChange={(e) => setDayDate(e.target.value)}
            error={errors.dayDate}
          />
          <Input
            label="🕐 Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Location with map-pin icon label */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600">
            📍 Location
          </label>
          <LocationAutocomplete
            value={location}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-600">🏷️ Category</label>
          <div className="flex flex-wrap gap-2">
            {ITINERARY_CATEGORIES.map((cat) => {
              const config = ITINERARY_CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(isSelected ? undefined : cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'scale-105 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-md ring-2 ring-[#8B5CF6]/30'
                      : 'bg-slate-50 text-slate-600 shadow-sm hover:bg-slate-100 hover:shadow'
                  }`}
                >
                  <span className="text-[15px]">{config.emoji}</span> {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transport mode pills */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-600">🚀 Travel Mode</label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { mode: 'DRIVING' as TransportMode, icon: Car, label: 'Drive' },
                { mode: 'WALKING' as TransportMode, icon: Footprints, label: 'Walk' },
                { mode: 'TRANSIT' as TransportMode, icon: Train, label: 'Transit' },
                { mode: 'BICYCLING' as TransportMode, icon: Bike, label: 'Bike' },
                { mode: 'FLIGHT' as TransportMode, icon: Plane, label: 'Fly' },
              ] as const
            ).map(({ mode, icon: Icon, label }) => {
              const isSelected = transportMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTransportMode(isSelected ? undefined : mode)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'scale-105 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-md ring-2 ring-[#8B5CF6]/30'
                      : 'bg-slate-50 text-slate-600 shadow-sm hover:bg-slate-100 hover:shadow'
                  }`}
                >
                  <span className="text-[15px]">{travelModeEmojis[mode]}</span> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes textarea */}
        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-[13px] font-semibold text-slate-600">
            📝 Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any additional details..."
            className="w-full rounded-[16px] bg-slate-50 px-4 py-3 text-[15px] text-slate-900 shadow-inner placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] font-[family-name:var(--font-display)] text-[16px] font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Saving... ✨' : initialData ? '💾 Save' : '🎉 Add'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-[16px] border border-slate-200 text-[15px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-1 self-center rounded-full px-4 py-1.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            🗑️ Delete this activity
          </button>
        )}
      </form>
    </div>
  );
}
