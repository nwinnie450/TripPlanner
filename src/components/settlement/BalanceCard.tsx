import type { Balance } from '@/types';
import { formatCurrency } from '@/lib/constants';

const AVATAR_COLORS = ['#8B5CF6', '#14B8A6', '#F472B6', '#F59E0B'];

interface BalanceCardProps {
  balance: Balance;
  maxAbsolute: number;
  currency: string;
  colorIndex?: number;
  showCurrencyBadge?: boolean;
}

export default function BalanceCard({
  balance,
  maxAbsolute,
  currency,
  colorIndex = 0,
  showCurrencyBadge = false,
}: BalanceCardProps) {
  const isPositive = balance.net >= 0;
  const barWidth = maxAbsolute > 0 ? Math.round((Math.abs(balance.net) / maxAbsolute) * 100) : 0;

  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const firstLetter = balance.memberName.charAt(0).toUpperCase();

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {firstLetter}
          </div>
          <p className="text-[15px] font-semibold text-slate-900">{balance.memberName}</p>
        </div>
        <div className="flex items-center gap-2">
          {showCurrencyBadge && (
            <span className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold text-[#7C3AED]">
              {currency}
            </span>
          )}
          <p className="text-[15px] font-bold" style={{ color: isPositive ? '#14B8A6' : '#EF4444' }}>
            {isPositive ? '+' : '-'}
            {formatCurrency(balance.net, currency)}
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            backgroundColor: isPositive ? '#14B8A6' : '#EF4444',
          }}
        />
      </div>
    </div>
  );
}
