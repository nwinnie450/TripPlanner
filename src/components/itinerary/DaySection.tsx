import type { ItineraryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import ItineraryItemCard from './ItineraryItem';

interface DaySectionProps {
  date: string;
  dayNumber: number;
  items: ItineraryItem[];
  passcode: string;
}

export default function DaySection({ date, dayNumber, items, passcode }: DaySectionProps) {
  return (
    <section className="mb-6">
      <div className="sticky top-0 z-10 -mx-6 mb-3 bg-white px-6 py-2">
        <div className="flex items-center gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-[17px] font-bold text-slate-900">
            Day {dayNumber} &mdash; {formatDate(date)}
          </h2>
          <span className="rounded-full bg-[#8B5CF6]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#8B5CF6]">
            {items.length} {items.length === 1 ? 'activity' : 'activities'}
          </span>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItineraryItemCard key={item.itemId} item={item} passcode={passcode} />
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
