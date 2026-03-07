import Link from 'next/link';
import type { Expense, Member } from '@/types';
import { formatDate } from '@/lib/utils';
import { formatCurrency, CATEGORY_COLORS } from '@/lib/constants';
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

  const categoryConfig = CATEGORY_COLORS[expense.category];

  return (
    <Link href={`/trip/${passcode}/expenses/${expense.expenseId}/edit`}>
      <div className="relative flex overflow-hidden rounded-[20px] border border-dashed border-[#D4D4D8] bg-white shadow-sm active:shadow-none transition-all active:scale-[0.98]">
        {/* Left accent bar */}
        <div
          className="w-2 shrink-0 rounded-l-[20px]"
          style={{ backgroundColor: categoryConfig.bg, borderRight: `3px solid ${categoryConfig.text}44` }}
        />
        <div className="flex flex-1 items-start justify-between p-3.5">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: categoryConfig.bg }}>
              {categoryConfig.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-slate-900">
                {expense.description}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <CategoryBadge category={expense.category} />
                {expense.expenseType === 'personal' && (
                  <span className="rounded-full bg-gradient-to-r from-pink-100 to-pink-50 px-2.5 py-0.5 text-[11px] font-bold text-pink-500 border border-pink-200">
                    Personal
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[12px] text-slate-400">
                Paid by <span className="font-medium text-slate-500">{payer?.name ?? 'Unknown'}</span>
                {' '}&middot; {formatDate(expense.date)}
                {expense.expenseType !== 'personal' && (
                  <>
                    {' '}&middot; {expense.splitBetween.length}{' '}
                    {expense.splitBetween.length === 1 ? 'person' : 'people'}
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="shrink-0 pl-3 font-[family-name:var(--font-display)] text-[18px] font-extrabold text-[#7C3AED]">
            {formatCurrency(expense.amount, currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
