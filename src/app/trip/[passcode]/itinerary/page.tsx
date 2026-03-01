'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange, formatDate } from '@/lib/utils';
import DaySection from '@/components/itinerary/DaySection';
import ViewToggle from '@/components/itinerary/ViewToggle';
import ItineraryMapView from '@/components/itinerary/ItineraryMapView';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ItineraryPage() {
  const { passcode } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { items, isLoading: itemsLoading, error } = useItinerary(passcode);
  const [view, setView] = useState<'list' | 'map'>('list');

  if (tripLoading || itemsLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load itinerary." />;
  if (!trip) return null;

  const dates = generateDateRange(trip.startDate, trip.endDate);
  const hasItems = items.length > 0;

  return (
    <div>
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-[28px] font-bold text-white">
          Itinerary
        </h1>
        <p className="text-[13px] text-white/80">
          {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
        </p>
        {hasItems && (
          <div className="mt-4">
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}
      </div>

      <div className="bg-white p-6">
        {!hasItems ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg
              className="mb-4 text-slate-400"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-[18px] font-semibold text-slate-900">No plans yet!</p>
            <p className="mt-1 text-[13px] text-slate-600">
              Start building your itinerary by tapping the + button below.
            </p>
          </div>
        ) : view === 'list' ? (
          dates.map((date, i) => {
            const dayItems = items
              .filter((item) => item.dayDate === date)
              .sort((a, b) => a.time.localeCompare(b.time));
            return (
              <DaySection
                key={date}
                date={date}
                dayNumber={i + 1}
                items={dayItems}
                passcode={passcode}
              />
            );
          })
        ) : (
          <ItineraryMapView items={items} />
        )}
      </div>

      <FloatingActionButton href={`/trip/${passcode}/itinerary/add`} label="Add activity" />
    </div>
  );
}
