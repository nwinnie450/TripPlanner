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
  const accentColor = categoryConfig?.text ?? '#8B5CF6';

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
      className="group cursor-pointer overflow-hidden rounded-[20px] border border-slate-100/80 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex">
        {/* Left accent bar */}
        <div className="w-1.5 shrink-0 rounded-l-[20px]" style={{ backgroundColor: accentColor }} />

        <div className="flex flex-1 items-center gap-3 p-4">
          {/* Time badge with emoji */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[11px] font-bold text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              {item.time ? item.time.slice(0, 5) : (categoryConfig?.emoji ?? '📌')}
            </div>
            {item.category && categoryConfig && (
              <span className="text-[14px]">{categoryConfig.emoji}</span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-bold text-slate-900">{item.title}</p>
              {item.category && categoryConfig && (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: categoryConfig.bg,
                    color: categoryConfig.text,
                  }}
                >
                  {item.category}
                </span>
              )}
            </div>
            {item.location && (
              <a
                href={getMapsUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-1 flex items-center gap-1 text-[13px] text-ocean hover:underline"
              >
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{shortenLocation(item.location)}</span>
              </a>
            )}
            {item.notes && (
              <p className="mt-1 truncate text-[12px] italic text-slate-400">{item.notes}</p>
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 transition-colors hover:bg-emerald-100"
            aria-label="Add expense for this activity"
          >
            <DollarSign className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
