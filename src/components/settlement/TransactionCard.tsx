'use client';

import { useState } from 'react';
import type { Payment } from '@/types';
import { formatCurrency } from '@/lib/constants';
import PaymentForm from './PaymentForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
  onRecordPayment: (from: string, to: string, amount: number, currency: string, note: string) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
  colorIndex: number;
}

export default function TransactionCard({
  from,
  fromName,
  debts,
  payments,
  onRecordPayment,
  onDeletePayment,
  colorIndex,
}: PersonDebtCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const firstLetter = fromName.charAt(0).toUpperCase();
  const allSettled = debts.every((d) => d.remaining <= 0);
  const showCurrency = debts.some((d, _, arr) => d.currency !== arr[0].currency);

  // All payments from this person (deduplicated at card level)
  const allPayments = payments.filter((p) => p.from === from);

  async function handleSubmit(debt: Debt, amount: number, note: string) {
    await onRecordPayment(from, debt.to, amount, debt.currency, note);
    setExpandedIndex(null);
  }

  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-md"
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
          <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-1 text-[12px] font-bold text-white shadow-sm">
            All Settled 🎉
          </span>
        )}
      </div>

      {/* Dashed separator like a receipt */}
      <div className="my-3 border-t-2 border-dashed border-slate-100" />

      {/* Debt rows */}
      <div className="flex flex-col gap-2">
        {debts.map((debt, index) => {
          const isSettled = debt.remaining <= 0;
          const progressPercent =
            debt.amount > 0
              ? Math.min(100, Math.round((debt.paid / debt.amount) * 100))
              : 0;

          return (
            <div key={`${debt.to}-${debt.currency}`} className="rounded-[16px] bg-gradient-to-r from-slate-50 to-slate-50/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">➡️</span>
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
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600">
                    Settled ✅
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
                      className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3.5 py-1 text-[12px] font-semibold text-white shadow-sm transition-all hover:shadow-md"
                    >
                      Pay 💸
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
                    <span className="font-medium text-[#7C3AED]">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${progressPercent}%`,
                        background: isSettled
                          ? 'linear-gradient(to right, #059669, #14B8A6)'
                          : 'linear-gradient(to right, #7C3AED, #EC4899)',
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

      {/* Payment history -- one toggle per person card */}
      {allPayments.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-[12px] font-medium text-[#7C3AED]"
          >
            <span>📜</span>
            {showHistory ? 'Hide' : 'View'} payment history ({allPayments.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {allPayments.map((p) => {
                const toDebt = debts.find((d) => d.to === p.to);
                const toName = toDebt?.toName ?? p.to;
                const cur = p.currency ?? toDebt?.currency ?? debts[0]?.currency ?? 'USD';
                return (
                  <div
                    key={p.paymentId}
                    className="flex items-center justify-between rounded-[12px] bg-gradient-to-r from-slate-50 to-white px-3 py-2 border border-slate-100"
                  >
                    <div>
                      <span className="text-[12px] font-medium text-slate-700">
                        {formatCurrency(p.amount, cur)}
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => setConfirmDeleteId(p.paymentId)}
                        className="text-[11px] font-medium text-red-400 hover:text-red-600"
                      >
                        Undo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Undo payment?"
        message="This will remove the recorded payment. The debt will reappear in the settlement."
        confirmLabel="Undo"
        onConfirm={() => {
          if (confirmDeleteId) onDeletePayment(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
