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
  globalMaxAbsolute?: number;
}

export default function BalanceCard({
  memberName,
  entries,
  colorIndex,
  globalMaxAbsolute,
}: PersonBalanceCardProps) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const firstLetter = memberName.charAt(0).toUpperCase();
  const maxAbsolute = Math.max(...entries.map((e) => Math.abs(e.net)), 0);
  const barDenominator = globalMaxAbsolute ?? maxAbsolute;
  const overallPositive = entries.reduce((sum, e) => sum + e.net, 0) >= 0;
  const showCurrency = entries.length > 1;

  return (
    <div
      className={`rounded-[20px] p-4 shadow-sm transition-all hover:shadow-md ${
        overallPositive
          ? 'bg-gradient-to-r from-white to-[#ECFDF5] border border-emerald-100'
          : 'bg-gradient-to-r from-white to-[#FEF2F2] border border-red-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-md"
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
                  <span className="text-[13px]">{isPositive ? '🟢' : '🔴'}</span>
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: isPositive ? '#059669' : '#DC2626' }}
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
        <span className="text-[20px]">{overallPositive ? '📈' : '📉'}</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${barDenominator > 0 ? Math.round((maxAbsolute / barDenominator) * 100) : 0}%`,
            backgroundColor: overallPositive ? '#059669' : '#DC2626',
          }}
        />
      </div>
    </div>
  );
}
