import Link from 'next/link';
import type { ItineraryItem } from '@/types';
import Card from '@/components/ui/Card';

interface ItineraryItemProps {
  item: ItineraryItem;
  passcode: string;
}

export default function ItineraryItemCard({
  item,
  passcode,
}: ItineraryItemProps) {
  return (
    <Link href={`/trip/${passcode}/itinerary/${item.itemId}/edit`}>
      <Card className="active:bg-sand transition-colors">
        <div className="flex gap-3">
          {item.time && (
            <span className="shrink-0 text-[13px] font-semibold text-ocean">
              {item.time}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-slate-900">
              {item.title}
            </p>
            {item.location && (
              <p className="mt-0.5 text-[13px] text-slate-600">
                {item.location}
              </p>
            )}
            {item.notes && (
              <p className="mt-1 text-[13px] text-slate-400 line-clamp-2">
                {item.notes}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
