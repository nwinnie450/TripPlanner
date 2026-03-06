import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
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

  return (
    <Card>
      <p className="mb-2 text-[13px] font-semibold text-slate-600">{label ?? 'Budget'}</p>
      {budgetPerPax != null && budgetPerPax > 0 && memberCount != null && (
        <p className="mb-1 text-[13px] text-slate-500">
          {formatCurrency(budgetPerPax, currency)} per person &middot; {memberCount}{' '}
          {memberCount === 1 ? 'person' : 'people'}
        </p>
      )}
      <p className="mb-2 text-[15px] font-semibold text-slate-900">
        {formatCurrency(spent, currency)}{' '}
        <span className="font-normal text-slate-600">
          of {formatCurrency(budget, currency)}
        </span>
      </p>
      <ProgressBar value={spent} max={budget} />
      <p className="mt-2 text-[13px] text-slate-600">
        {pct}% spent &middot; {formatCurrency(remaining, currency)} left
      </p>
    </Card>
  );
}
