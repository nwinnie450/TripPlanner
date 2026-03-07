'use client';

import { useState } from 'react';

interface ExchangeRateFormProps {
  fromCurrency: string;
  toCurrency: string;
  currentRate?: number;
  onSave: (rate: number) => void;
}

export default function ExchangeRateForm({
  fromCurrency,
  toCurrency,
  currentRate,
  onSave,
}: ExchangeRateFormProps) {
  const [rate, setRate] = useState(currentRate?.toString() ?? '');

  function handleSave() {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed <= 0) return;
    onSave(parsed);
  }

  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#F5F3FF] to-[#FDF2F8] px-4 py-3 shadow-sm">
      <span className="text-[16px]">💱</span>
      <span className="whitespace-nowrap text-[13px] font-medium text-slate-600">
        1 {fromCurrency} =
      </span>
      <input
        type="number"
        step="any"
        min="0"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="0.00"
        className="h-9 w-24 rounded-[10px] border border-slate-200 bg-white px-2 text-center text-[15px] text-slate-900 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
      />
      <span className="whitespace-nowrap text-[13px] font-medium text-slate-600">
        {toCurrency}
      </span>
      <button
        type="button"
        onClick={handleSave}
        className="ml-auto rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition-all hover:shadow-md"
      >
        Save
      </button>
    </div>
  );
}
