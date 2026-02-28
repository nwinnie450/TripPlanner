import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
}

export default function TransactionCard({
  transaction,
  currency,
}: TransactionCardProps) {
  return (
    <div className="rounded-[14px] bg-sand p-4">
      <p className="text-[15px] text-slate-900">
        <span className="font-semibold">{transaction.fromName}</span>
        {' '}
        <span className="text-slate-400">&rarr;</span>
        {' '}
        <span className="font-semibold">{transaction.toName}</span>
      </p>
      <p className="mt-1 text-[18px] font-bold text-sunset">
        pays {formatCurrency(transaction.amount, currency)}
      </p>
    </div>
  );
}
