import type { Balance } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface BalanceCardProps {
  balance: Balance;
  maxAbsolute: number;
  currency: string;
}

export default function BalanceCard({
  balance,
  maxAbsolute,
  currency,
}: BalanceCardProps) {
  const isPositive = balance.net >= 0;
  const barWidth =
    maxAbsolute > 0
      ? Math.round((Math.abs(balance.net) / maxAbsolute) * 100)
      : 0;

  return (
    <Card className="mb-2">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-slate-900">
          {balance.memberName}
        </p>
        <p
          className={`text-[15px] font-bold ${isPositive ? 'text-forest' : 'text-sunset'}`}
        >
          {isPositive ? '+' : ''}
          {formatCurrency(balance.net, currency)}
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sand-dark">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isPositive ? 'bg-forest' : 'bg-sunset'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </Card>
  );
}
