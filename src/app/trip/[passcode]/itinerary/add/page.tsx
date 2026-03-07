'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange } from '@/lib/utils';
import ItineraryForm from '@/components/itinerary/ItineraryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AddItineraryPage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading } = useTrip(passcode);
  const { mutate } = useItinerary(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !trip) return <LoadingSpinner />;

  const dates = generateDateRange(trip.startDate, trip.endDate);

  async function handleSubmit(data: {
    dayDate: string;
    title: string;
    time: string;
    location: string;
    locationLat?: number;
    locationLng?: number;
    category?: string;
    transportMode?: string;
    notes: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trip/${passcode}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: currentMember?.memberId ?? '',
        }),
      });
      if (res.ok) {
        await mutate();
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-amber-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-6 pt-12">
        {/* Floating travel emojis */}
        <span className="pointer-events-none absolute right-4 top-6 text-[32px] opacity-20 rotate-12">
          🎒
        </span>
        <span className="pointer-events-none absolute left-4 bottom-2 text-[24px] opacity-15 -rotate-6">
          📍
        </span>
        <span className="pointer-events-none absolute right-20 bottom-1 text-[20px] opacity-20">
          🌟
        </span>

        <div className="relative z-10 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h1 className="ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white drop-shadow-sm">
            ✏️ Add Activity
          </h1>
        </div>
      </div>
      <div className="px-5 py-6">
        <ItineraryForm
          dates={dates}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
