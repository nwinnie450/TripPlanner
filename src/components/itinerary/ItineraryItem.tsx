'use client';

import { useRouter } from 'next/navigation';
import { MapPin, DollarSign } from 'lucide-react';
import type { ItineraryItem } from '@/types';
import { ITINERARY_CATEGORY_CONFIG, mapItineraryCategoryToExpense } from '@/lib/constants';

interface ItineraryItemProps {
  item: ItineraryItem;
  passcode: string;
}

function getMapsUrl(item: ItineraryItem): string {
  if (item.locationLat && item.locationLng) {
    return `https://www.google.com/maps/search/?api=1&query=${item.locationLat},${item.locationLng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
}

function shortenLocation(location: string): string {
  const parts = location.split(',').map((p) => p.trim());
  if (parts.length <= 2) return location;
  return parts.slice(0, 2).join(', ');
}

export default function ItineraryItemCard({ item, passcode }: ItineraryItemProps) {
  const router = useRouter();
  const categoryConfig = item.category ? ITINERARY_CATEGORY_CONFIG[item.category] : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/trip/${passcode}/itinerary/${item.itemId}/edit`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/trip/${passcode}/itinerary/${item.itemId}/edit`);
        }
      }}
      className="cursor-pointer rounded-xl border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Time badge — matches settlement avatar style */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: categoryConfig?.text ?? '#8B5CF6' }}
        >
          {item.time ? item.time.slice(0, 5) : (categoryConfig?.emoji ?? '📌')}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-slate-900">{item.title}</p>
            {item.category && categoryConfig && (
              <span
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: categoryConfig.bg,
                  color: categoryConfig.text,
                }}
              >
                {categoryConfig.emoji}
              </span>
            )}
          </div>
          {item.location && (
            <a
              href={getMapsUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 flex items-center gap-1 text-[13px] text-ocean hover:underline"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{shortenLocation(item.location)}</span>
            </a>
          )}
          {item.notes && (
            <p className="mt-0.5 truncate text-[12px] text-slate-400">{item.notes}</p>
          )}
        </div>

        {/* Expense shortcut */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/trip/${passcode}/expenses/add?title=${encodeURIComponent(item.title)}&category=${mapItineraryCategoryToExpense(item.category)}&date=${item.dayDate}`,
            );
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean"
          aria-label="Add expense for this activity"
        >
          <DollarSign className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
