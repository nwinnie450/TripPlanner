'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import PasscodeDisplay from '@/components/trip/PasscodeDisplay';

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'THB', label: 'THB - Thai Baht' },
];

export default function CreateTripPage() {
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('USD');
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ocean">Trip Created!</h1>
            <p className="mt-1 text-[15px] text-slate-600">
              Share this passcode with your group
            </p>
          </div>
          <div className="w-full">
            <PasscodeDisplay passcode={createdPasscode} />
          </div>
          <Link href={`/trip/${createdPasscode}`} className="w-full">
            <Button>Go to Dashboard &rarr;</Button>
          </Link>
          <Link href="/" className="text-[13px] text-ocean">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-[15px] text-ocean"
        >
          &larr; Back
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Create a New Trip
        </h1>
        <Card>
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
            {apiError && <ErrorMessage message={apiError} />}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
