'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import PasscodeDisplay from '@/components/trip/PasscodeDisplay';
import CurrencyPicker from '@/components/ui/CurrencyPicker';

const CURRENCIES = [
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'VND', label: 'VND - Vietnamese Dong' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'TWD', label: 'TWD - Taiwan Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
];

export default function CreateTripPage() {
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('SGD');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPasscode, setCreatedPasscode] = useState('');

  function validate() {
    const errs: Record<string, string> = {};
    if (!tripName.trim()) errs.tripName = 'Trip name is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate)
      errs.endDate = 'End date must be after start date';
    if (!currency) errs.currency = 'Currency is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName: tripName.trim(),
          startDate,
          endDate,
          currency,
          ...(currencies.length > 0 && { currencies }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setApiError(data?.message ?? 'Failed to create trip. Please try again.');
        return;
      }

      const data = await res.json();
      setCreatedPasscode(data.passcode);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdPasscode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#EDE9FE] via-[#F0EAFF] to-[#FFF7ED] px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          {/* Celebratory emojis */}
          <div className="flex items-center gap-3 text-5xl">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>✈️</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🌟</span>
          </div>

          <div className="text-center">
            <h1 className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-3xl font-bold text-transparent">
              Adventure Created!
            </h1>
            <p className="mt-2 text-[15px] text-slate-600">
              Share this passcode with your group so they can hop on board
            </p>
          </div>

          {/* Ticket-style passcode card */}
          <div className="w-full overflow-hidden rounded-[20px] bg-white shadow-lg">
            <div className="border-b-2 border-dashed border-slate-200 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-3">
              <p className="text-center text-[12px] font-semibold uppercase tracking-widest text-white/80">
                Boarding Pass
              </p>
            </div>
            <div className="px-5 py-6">
              <PasscodeDisplay passcode={createdPasscode} />
            </div>
            <div className="flex justify-between border-t-2 border-dashed border-slate-200 px-5 py-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">GroupTrip</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Ready to Explore</span>
            </div>
          </div>

          <Link href={`/trip/${createdPasscode}`} className="w-full">
            <Button>Let&apos;s Go! ✈️</Button>
          </Link>
          <Link href="/" className="text-[13px] font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FE] via-[#F0EAFF] to-[#FFF7ED]">
      {/* Fun gradient header with floating emojis */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-5 pb-10 pt-4">
        {/* Floating travel emojis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute left-[10%] top-[18%] text-2xl opacity-30 animate-pulse">✈️</span>
          <span className="absolute right-[12%] top-[12%] text-xl opacity-25 animate-pulse" style={{ animationDelay: '500ms' }}>🌍</span>
          <span className="absolute left-[60%] top-[30%] text-lg opacity-20 animate-pulse" style={{ animationDelay: '1000ms' }}>🏖️</span>
          <span className="absolute right-[30%] top-[8%] text-xl opacity-20 animate-pulse" style={{ animationDelay: '750ms' }}>🗺️</span>
          <span className="absolute left-[35%] top-[22%] text-lg opacity-25 animate-pulse" style={{ animationDelay: '1250ms' }}>⛰️</span>
        </div>

        <div className="relative flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
        </div>
        <div className="relative mt-4 text-center">
          <h1 className="font-display text-[26px] font-bold text-white">Plan Your Adventure</h1>
          <p className="mt-1 text-[14px] text-white/70">Where are we going this time?</p>
        </div>
      </div>

      {/* Boarding-pass style form card */}
      <div className="relative z-10 -mt-4 px-5 pb-8">
        <div className="overflow-hidden rounded-[20px] border-t-2 border-dashed border-white/50 bg-white shadow-lg shadow-purple-900/10">
          <div className="px-5 pb-6 pt-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Trip Name *"
                placeholder="e.g., Barcelona 2026"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                error={errors.tripName}
              />
              <Input
                label="Start Date *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.startDate}
              />
              <Input
                label="End Date *"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.endDate}
              />
              <Select
                label="Currency *"
                options={CURRENCIES}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                error={errors.currency}
              />
              <CurrencyPicker
                selected={currencies}
                onChange={setCurrencies}
                exclude={currency}
              />
              {apiError && <ErrorMessage message={apiError} />}
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Trip ✈️'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
