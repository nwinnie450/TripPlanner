'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange, formatDate } from '@/lib/utils';
import DaySection from '@/components/itinerary/DaySection';
import ViewToggle from '@/components/itinerary/ViewToggle';
import ItineraryMapView from '@/components/itinerary/ItineraryMapView';
import ShareButton from '@/components/ui/ShareButton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatItineraryText } from '@/lib/formatExport';

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
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-amber-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-8 pt-2">
        {/* Floating travel emojis */}
        <span className="pointer-events-none absolute -right-2 top-2 text-[40px] opacity-20 rotate-12">
          ✈️
        </span>
        <span className="pointer-events-none absolute left-8 top-1 text-[28px] opacity-15 -rotate-12">
          🌍
        </span>
        <span className="pointer-events-none absolute right-16 bottom-2 text-[24px] opacity-20 rotate-6">
          🧳
        </span>
        <span className="pointer-events-none absolute left-2 bottom-4 text-[20px] opacity-15">
          🗺️
        </span>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-[family-name:var(--font-display)] text-[28px] font-bold text-white drop-shadow-sm">
              ✨ Itinerary
            </h1>
            <p className="text-[13px] font-medium text-white/90">
              🗓️ {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
            </p>
          </div>
          {hasItems && (
            <ShareButton
              getShareData={() => ({
                title: `${trip.tripName} Itinerary`,
                text: formatItineraryText(
                  trip.tripName,
                  trip.startDate,
                  trip.endDate,
                  items,
                  dates,
                ),
              })}
            />
          )}
        </div>
        {hasItems && (
          <div className="relative z-10 mt-4">
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}
      </div>

      <div className="px-5 py-6">
        {!hasItems ? (
          <div className="flex flex-col items-center rounded-[24px] bg-white/80 py-16 text-center shadow-sm backdrop-blur-sm">
            <div className="mb-4 text-[56px]">🏖️</div>
            <p className="text-[18px] font-bold text-slate-900">No plans yet!</p>
            <p className="mt-2 text-[14px] text-slate-500">
              Time to start planning the adventure! 🎉
              <br />
              Tap the + button below to add your first activity.
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
