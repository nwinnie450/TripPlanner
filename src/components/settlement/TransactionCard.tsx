'use client';

import { useState } from 'react';
import type { EnrichedTransaction } from '@/hooks/useSettlement';
import type { Payment } from '@/types';
import { formatCurrency } from '@/lib/constants';
import PaymentForm from './PaymentForm';

interface TransactionCardProps {
  transaction: EnrichedTransaction;
  currency: string;
  payments: Payment[];
  onRecordPayment: (from: string, to: string, amount: number, note: string) => Promise<void>;
  showCurrencyBadge?: boolean;
}

export default function TransactionCard({
  transaction,
  currency,
  payments,
  onRecordPayment,
  showCurrencyBadge = false,
}: TransactionCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isSettled = transaction.remaining <= 0;
  const progressPercent = transaction.amount > 0
    ? Math.min(100, Math.round((transaction.paid / transaction.amount) * 100))
    : 0;

  // Filter payments for this specific transaction
  const txPayments = payments.filter(
    (p) => p.from === transaction.from && p.to === transaction.to,
  );

  async function handleSubmit(amount: number, note: string) {
    await onRecordPayment(transaction.from, transaction.to, amount, note);
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header: names and amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[15px] text-slate-900">
            <span className="font-semibold">{transaction.fromName}</span>{' '}
            <span className="text-slate-400">&rarr;</span>{' '}
            <span className="font-semibold">{transaction.toName}</span>
          </p>
          {showCurrencyBadge && (
            <span className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold text-[#7C3AED]">
              {currency}
            </span>
          )}
        </div>
        <span className={`rounded-xl px-3 py-1.5 text-[14px] font-bold text-white ${isSettled ? 'bg-[#14B8A6]' : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]'}`}>
          {isSettled ? 'Settled' : formatCurrency(transaction.remaining, currency)}
        </span>
      </div>

      {/* Progress bar */}
      {transaction.paid > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="text-slate-400">
              {formatCurrency(transaction.paid, currency)} of {formatCurrency(transaction.amount, currency)} paid
            </span>
            <span className="font-medium text-[#8B5CF6]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: isSettled ? '#14B8A6' : '#8B5CF6',
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {!isSettled && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full rounded-lg border border-[#8B5CF6]/30 py-2 text-[14px] font-semibold text-[#8B5CF6]"
        >
          Pay
        </button>
      )}

      {/* Payment form */}
      {showForm && (
        <PaymentForm
          fromName={transaction.fromName}
          toName={transaction.toName}
          remaining={transaction.remaining}
          currency={currency}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Payment history toggle */}
      {txPayments.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[12px] font-medium text-[#8B5CF6]"
          >
            {showHistory ? 'Hide' : 'View'} payment history ({txPayments.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {txPayments.map((p) => (
                <div key={p.paymentId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <span className="text-[13px] font-medium text-slate-700">
                      {formatCurrency(p.amount, currency)}
                    </span>
                    {p.note && (
                      <span className="ml-2 text-[12px] text-slate-400">{p.note}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
