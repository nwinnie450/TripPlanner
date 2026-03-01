import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/constants';

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
}

export default function TransactionCard({ transaction, currency }: TransactionCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[15px] text-slate-900">
        <span className="font-semibold">{transaction.fromName}</span>{' '}
        <span className="text-slate-400">&rarr;</span>{' '}
        <span className="font-semibold">{transaction.toName}</span>
      </p>
      <span className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-3 py-1.5 text-[14px] font-bold text-white">
        {formatCurrency(transaction.amount, currency)}
      </span>
    </div>
  );
}
