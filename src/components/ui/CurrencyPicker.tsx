'use client';

import { useState } from 'react';

const CURRENCIES = [
  { value: 'SGD', label: 'SGD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'KRW', label: 'KRW' },
  { value: 'CNY', label: 'CNY' },
  { value: 'MYR', label: 'MYR' },
  { value: 'USD', label: 'USD' },
  { value: 'THB', label: 'THB' },
  { value: 'VND', label: 'VND' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
  { value: 'CAD', label: 'CAD' },
  { value: 'TWD', label: 'TWD' },
  { value: 'HKD', label: 'HKD' },
  { value: 'IDR', label: 'IDR' },
  { value: 'PHP', label: 'PHP' },
  { value: 'INR', label: 'INR' },
  { value: 'NZD', label: 'NZD' },
  { value: 'CHF', label: 'CHF' },
];

interface CurrencyPickerProps {
  selected: string[];
  onChange: (currencies: string[]) => void;
  exclude?: string;
}

export default function CurrencyPicker({ selected, onChange, exclude }: CurrencyPickerProps) {
  const [selectValue, setSelectValue] = useState('');

  const availableOptions = CURRENCIES.filter(
    (c) => c.value !== exclude && !selected.includes(c.value),
  );

  const maxReached = selected.length >= 5;

  function handleAdd(value: string) {
    if (!value || maxReached) return;
    onChange([...selected, value]);
    setSelectValue('');
  }

  function handleRemove(value: string) {
    onChange(selected.filter((c) => c !== value));
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="text-[13px] font-semibold text-slate-600">Additional Currencies</label>
        <span className="ml-1.5 text-[13px] text-slate-400">(optional, max 5)</span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-3 py-1.5 text-[13px] font-medium text-white"
            >
              {code}
              <button
                type="button"
                onClick={() => handleRemove(code)}
                className="ml-0.5 text-white/80 transition-colors hover:text-white"
                aria-label={`Remove ${code}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <select
        value={selectValue}
        onChange={(e) => handleAdd(e.target.value)}
        disabled={maxReached || availableOptions.length === 0}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-900 transition-colors focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">
          {maxReached ? 'Maximum 5 currencies selected' : 'Add a currency...'}
        </option>
        {availableOptions.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
