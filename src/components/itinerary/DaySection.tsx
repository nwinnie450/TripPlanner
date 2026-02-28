import type { ItineraryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import ItineraryItemCard from './ItineraryItem';

interface DaySectionProps {
  date: string;
  dayNumber: number;
  items: ItineraryItem[];
  passcode: string;
}

export default function DaySection({
  date,
  dayNumber,
  items,
  passcode,
}: DaySectionProps) {
  return (
    <section className="mb-6">
      <div className="sticky top-0 z-10 -mx-4 mb-3 bg-sand px-4 py-2">
        <h2 className="text-[16px] font-semibold text-ocean">
          Day {dayNumber} &mdash; {formatDate(date)}
        </h2>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItineraryItemCard
              key={item.itemId}
              item={item}
              passcode={passcode}
            />
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-[13px] text-slate-400">
          No activities yet. Tap + to add something!
        </p>
      )}
    </section>
  );
}
