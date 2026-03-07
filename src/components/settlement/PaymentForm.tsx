'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/constants';

interface PaymentFormProps {
  fromName: string;
  toName: string;
  remaining: number;
  currency: string;
  onSubmit: (amount: number, note: string) => Promise<void>;
  onCancel: () => void;
}

export default function PaymentForm({
  fromName,
  toName,
  remaining,
  currency,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [amount, setAmount] = useState(remaining.toString());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (numAmount > remaining) {
      setError(`Cannot exceed remaining balance of ${formatCurrency(remaining, currency)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(numAmount, note);
    } catch {
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-[16px] border border-[#7C3AED]/15 bg-gradient-to-br from-[#F9F5FF] to-[#FDF2F8] p-4">
      <p className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
        <span>💸</span> {fromName} pays {toName}
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-[12px] font-medium text-slate-500">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[15px] font-medium text-slate-900 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          placeholder="0.00"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-[12px] font-medium text-slate-500">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          placeholder="e.g. Bank transfer, PayNow..."
          maxLength={100}
        />
      </div>

      {error && <p className="mb-3 text-[13px] text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[12px] border border-slate-200 bg-white py-2.5 text-[14px] font-medium text-slate-600 transition-all hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-[12px] bg-gradient-to-r from-[#7C3AED] to-[#EC4899] py-2.5 text-[14px] font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Recording...' : 'Record Payment 💸'}
        </button>
      </div>
    </form>
  );
}
