import Link from 'next/link';
import { MapPin, DollarSign } from 'lucide-react';
import type { ItineraryItem } from '@/types';
import { ITINERARY_CATEGORY_CONFIG, mapItineraryCategoryToExpense } from '@/lib/constants';
import Card from '@/components/ui/Card';

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

export default function ItineraryItemCard({ item, passcode }: ItineraryItemProps) {
  const categoryConfig = item.category ? ITINERARY_CATEGORY_CONFIG[item.category] : null;

  return (
    <Link href={`/trip/${passcode}/itinerary/${item.itemId}/edit`}>
      <Card className="active:bg-sand transition-colors">
        <div className="flex gap-3">
          {item.time && (
            <span
              className="shrink-0 text-[13px] font-semibold"
              style={{ color: categoryConfig?.text ?? '#334155' }}
            >
              {item.time}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-slate-900">{item.title}</p>
              {item.category && categoryConfig && (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: categoryConfig.bg,
                    color: categoryConfig.text,
                  }}
                >
                  {categoryConfig.emoji} {item.category}
                </span>
              )}
            </div>
            {item.location && (
              <a
                href={getMapsUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-ocean hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {item.location}
              </a>
            )}
            {item.notes && (
              <p className="mt-1 text-[13px] text-slate-400 line-clamp-2">{item.notes}</p>
            )}
          </div>
          <Link
            href={`/trip/${passcode}/expenses/add?title=${encodeURIComponent(item.title)}&category=${mapItineraryCategoryToExpense(item.category)}&date=${item.dayDate}`}
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean"
            aria-label="Add expense for this activity"
          >
            <DollarSign className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    </Link>
  );
}
