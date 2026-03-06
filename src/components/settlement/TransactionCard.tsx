'use client';

import { useState } from 'react';
import type { Payment } from '@/types';
import { formatCurrency } from '@/lib/constants';
import PaymentForm from './PaymentForm';

const AVATAR_COLORS = ['#8B5CF6', '#14B8A6', '#F472B6', '#F59E0B'];

interface Debt {
  to: string;
  toName: string;
  currency: string;
  amount: number;
  remaining: number;
  paid: number;
}

interface PersonDebtCardProps {
  from: string;
  fromName: string;
  debts: Debt[];
  payments: Payment[];
  onRecordPayment: (from: string, to: string, amount: number, note: string) => Promise<void>;
  colorIndex: number;
}

export default function TransactionCard({
  from,
  fromName,
  debts,
  payments,
  onRecordPayment,
  colorIndex,
}: PersonDebtCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const firstLetter = fromName.charAt(0).toUpperCase();
  const allSettled = debts.every((d) => d.remaining <= 0);
  const showCurrency = debts.some((d, _, arr) => d.currency !== arr[0].currency);

  // All payments from this person (deduplicated at card level)
  const allPayments = payments.filter((p) => p.from === from);

  async function handleSubmit(debt: Debt, amount: number, note: string) {
    await onRecordPayment(from, debt.to, amount, note);
    setExpandedIndex(null);
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {firstLetter}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-slate-900">
            {fromName}{' '}
            <span className="font-normal text-slate-400">owes</span>
          </p>
        </div>
        {allSettled && (
          <span className="rounded-xl bg-[#14B8A6] px-3 py-1 text-[12px] font-bold text-white">
            All Settled
          </span>
        )}
      </div>

      {/* Debt rows */}
      <div className="mt-3 flex flex-col gap-2">
        {debts.map((debt, index) => {
          const isSettled = debt.remaining <= 0;
          const progressPercent =
            debt.amount > 0
              ? Math.min(100, Math.round((debt.paid / debt.amount) * 100))
              : 0;

          return (
            <div key={`${debt.to}-${debt.currency}`} className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-slate-400">&rarr;</span>
                  <span className="text-[14px] font-medium text-slate-900">
                    {debt.toName}
                  </span>
                  {showCurrency && (
                    <span className="rounded-full bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                      {debt.currency}
                    </span>
                  )}
                </div>
                {isSettled ? (
                  <span className="rounded-lg bg-[#14B8A6]/10 px-2.5 py-1 text-[12px] font-bold text-[#14B8A6]">
                    Settled
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-slate-900">
                      {formatCurrency(debt.remaining, debt.currency)}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="rounded-lg bg-gradient-to-b from-[#7C3AED] to-[#8B5CF6] px-3 py-1 text-[12px] font-semibold text-white"
                    >
                      Pay
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar if partially paid */}
              {debt.paid > 0 && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {formatCurrency(debt.paid, debt.currency)} of{' '}
                      {formatCurrency(debt.amount, debt.currency)} paid
                    </span>
                    <span className="font-medium text-[#8B5CF6]">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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

              {/* Payment form */}
              {expandedIndex === index && (
                <PaymentForm
                  fromName={fromName}
                  toName={debt.toName}
                  remaining={debt.remaining}
                  currency={debt.currency}
                  onSubmit={(amount, note) => handleSubmit(debt, amount, note)}
                  onCancel={() => setExpandedIndex(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Payment history — one toggle per person card */}
      {allPayments.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] font-medium text-[#8B5CF6]"
          >
            {showHistory ? 'Hide' : 'View'} payment history ({allPayments.length})
          </button>
          {showHistory && (
            <div className="mt-1.5 space-y-1">
              {allPayments.map((p) => {
                const toDebt = debts.find((d) => d.to === p.to);
                const toName = toDebt?.toName ?? p.to;
                const currency = toDebt?.currency ?? debts[0]?.currency ?? 'USD';
                return (
                  <div
                    key={p.paymentId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <span className="text-[12px] font-medium text-slate-700">
                        {formatCurrency(p.amount, currency)}
                      </span>
                      <span className="ml-1.5 text-[11px] text-slate-400">
                        → {toName}
                      </span>
                      {p.note && (
                        <span className="ml-1.5 text-[11px] text-slate-400">
                          · {p.note}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(p.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
