import Link from 'next/link';
import type { Expense, Member } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import CategoryBadge from './CategoryBadge';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  currency: string;
  passcode: string;
}

export default function ExpenseCard({
  expense,
  members,
  currency,
  passcode,
}: ExpenseCardProps) {
  const payer = members.find((m) => m.memberId === expense.paidBy);

  return (
    <Link href={`/trip/${passcode}/expenses/${expense.expenseId}/edit`}>
      <Card className="active:bg-sand transition-colors">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-slate-900">
              {expense.description}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <CategoryBadge category={expense.category} />
              <span className="text-[13px] text-slate-600">
                Paid by {payer?.name ?? 'Unknown'}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-400">
              {formatDate(expense.date)} &middot; Split:{' '}
              {expense.splitBetween.length}{' '}
              {expense.splitBetween.length === 1 ? 'person' : 'people'}
            </p>
          </div>
          <p className="shrink-0 pl-3 text-[18px] font-bold text-slate-900">
            {formatCurrency(expense.amount, currency)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
