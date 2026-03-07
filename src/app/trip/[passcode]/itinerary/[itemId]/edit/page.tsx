'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange } from '@/lib/utils';
import ItineraryForm from '@/components/itinerary/ItineraryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function EditItineraryPage() {
  const { passcode } = useTripContext();
  const params = useParams();
  const rawItemId = params.itemId;
  const itemId = typeof rawItemId === 'string' ? rawItemId : '';
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { items, isLoading: itemsLoading, mutate } = useItinerary(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (tripLoading || itemsLoading) return <LoadingSpinner />;
  if (!trip) return null;

  const item = items.find((i) => i.itemId === itemId);
  if (!item) return <ErrorMessage message="Item not found." />;

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
      const res = await fetch(`/api/trip/${passcode}/itinerary/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await mutate();
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setShowConfirm(false);
    try {
      const res = await fetch(`/api/trip/${passcode}/itinerary/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        await mutate();
        router.replace(`/trip/${passcode}/itinerary`);
      }
    } catch {
      alert('Failed to delete. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-amber-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-6 pt-12">
        {/* Floating travel emojis */}
        <span className="pointer-events-none absolute right-6 top-8 text-[28px] opacity-20 rotate-12">
          🛠️
        </span>
        <span className="pointer-events-none absolute left-6 bottom-2 text-[22px] opacity-15 -rotate-6">
          ✨
        </span>

        <div className="relative z-10 flex items-center">
          <Link
            href={`/trip/${passcode}/itinerary`}
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white drop-shadow-sm">
            ✏️ Edit Activity
          </h1>
        </div>
      </div>
      <div className="px-5 py-6">
        <ItineraryForm
          dates={dates}
          initialData={item}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          onDelete={() => setShowConfirm(true)}
          isSubmitting={isSubmitting}
        />
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Delete Activity"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
