import { formatCurrency } from '@/lib/constants';

const AVATAR_COLORS = ['#8B5CF6', '#14B8A6', '#F472B6', '#F59E0B'];

interface BalanceEntry {
  currency: string;
  net: number;
}

interface PersonBalanceCardProps {
  memberName: string;
  entries: BalanceEntry[];
  colorIndex: number;
}

export default function BalanceCard({
  memberName,
  entries,
  colorIndex,
}: PersonBalanceCardProps) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const firstLetter = memberName.charAt(0).toUpperCase();
  const maxAbsolute = Math.max(...entries.map((e) => Math.abs(e.net)), 0);
  const overallPositive = entries.reduce((sum, e) => sum + e.net, 0) >= 0;
  const showCurrency = entries.length > 1;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {firstLetter}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-slate-900">{memberName}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
            {entries.map((entry) => {
              const isPositive = entry.net >= 0;
              return (
                <div key={entry.currency} className="flex items-center gap-1.5">
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: isPositive ? '#14B8A6' : '#EF4444' }}
                  >
                    {isPositive ? '+' : '-'}
                    {formatCurrency(Math.abs(entry.net), entry.currency)}
                  </span>
                  {showCurrency && (
                    <span className="rounded-full bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                      {entry.currency}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${maxAbsolute > 0 ? Math.round((Math.max(...entries.map((e) => Math.abs(e.net))) / maxAbsolute) * 100) : 0}%`,
            backgroundColor: overallPositive ? '#14B8A6' : '#EF4444',
          }}
        />
      </div>
    </div>
  );
}
