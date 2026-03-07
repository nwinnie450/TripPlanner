import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/constants';

interface BudgetSummaryProps {
  spent: number;
  budget: number;
  currency: string;
  budgetPerPax?: number;
  memberCount?: number;
  label?: string;
}

export default function BudgetSummary({
  spent,
  budget,
  currency,
  budgetPerPax,
  memberCount,
  label,
}: BudgetSummaryProps) {
  const remaining = budget - spent;
  const pct = budget > 0 ? ((spent / budget) * 100).toFixed(1) : '0';
  const pctNum = budget > 0 ? (spent / budget) * 100 : 0;
  const statusEmoji = pctNum > 100 ? '🔴' : pctNum >= 80 ? '🟡' : '🟢';

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-600">💰 {label ?? 'Budget'}</p>
        <span
          className="text-sm"
          title={pctNum > 100 ? 'Over budget' : pctNum >= 80 ? 'Getting close' : 'On track'}
        >
          {statusEmoji}
        </span>
      </div>
      {budgetPerPax != null && budgetPerPax > 0 && memberCount != null && (
        <p className="mb-1 text-[13px] text-slate-500">
          {formatCurrency(budgetPerPax, currency)} per person &middot; {memberCount}{' '}
          {memberCount === 1 ? 'person' : 'people'}
        </p>
      )}
      <p className="mb-2 text-[15px] font-semibold text-slate-900">
        {formatCurrency(spent, currency)}{' '}
        <span className="font-normal text-slate-600">of {formatCurrency(budget, currency)}</span>
      </p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pctNum > 100
              ? 'bg-gradient-to-r from-red-400 to-red-500'
              : pctNum >= 80
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400'
          }`}
          style={{ width: `${Math.min(pctNum, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-slate-600">
        {pct}% spent &middot; {formatCurrency(remaining, currency)} left
      </p>
    </Card>
  );
}
