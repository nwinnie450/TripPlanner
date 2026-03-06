'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { formatCurrency } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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

export default function EditTripPage() {
  const { passcode } = useTripContext();
  const { trip, isLoading, mutate } = useTrip(passcode);
  const { members } = useMembers(passcode);
  const router = useRouter();

  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('');
  const [budgetPerPax, setBudgetPerPax] = useState('');
  const [budget, setBudget] = useState('');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [personalBudgets, setPersonalBudgets] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (trip && !initialized) {
      setTripName(trip.tripName);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setCurrency(trip.currency);
      setBudgetPerPax(trip.budgetPerPax != null ? String(trip.budgetPerPax) : '');
      setBudget(trip.budget != null ? String(trip.budget) : '');
      setCurrencies(trip.currencies ?? []);
      const pb = trip.personalBudgets ?? {};
      const pbStrings: Record<string, string> = {};
      for (const [key, val] of Object.entries(pb)) {
        pbStrings[key] = String(val);
      }
      setPersonalBudgets(pbStrings);
      setInitialized(true);
    }
  }, [trip, initialized]);

  if (isLoading) return <LoadingSpinner />;
  if (!trip) return null;

  function validate() {
    const errs: Record<string, string> = {};
    if (!tripName.trim()) errs.tripName = 'Trip name is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate)
      errs.endDate = 'End date must be after start date';
    if (!currency) errs.currency = 'Currency is required';
    if (budgetPerPax !== '' && (isNaN(Number(budgetPerPax)) || Number(budgetPerPax) < 0))
      errs.budgetPerPax = 'Budget per person must be a non-negative number';
    if (budget !== '' && (isNaN(Number(budget)) || Number(budget) < 0))
      errs.budget = 'Budget must be a non-negative number';
    for (const [memberId, val] of Object.entries(personalBudgets)) {
      if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) {
        errs[`pb_${memberId}`] = 'Must be a non-negative number';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    const payload: Record<string, unknown> = {};
    if (tripName.trim() !== trip!.tripName) payload.tripName = tripName.trim();
    if (startDate !== trip!.startDate) payload.startDate = startDate;
    if (endDate !== trip!.endDate) payload.endDate = endDate;
    if (currency !== trip!.currency) payload.currency = currency;
    const perPaxNum = budgetPerPax !== '' ? Number(budgetPerPax) : undefined;
    if (perPaxNum !== trip!.budgetPerPax) {
      payload.budgetPerPax = perPaxNum ?? 0;
    }
    if (!perPaxNum) {
      const budgetNum = budget !== '' ? Number(budget) : undefined;
      if (budgetNum !== trip!.budget) payload.budget = budgetNum;
    }
    const prevCurrencies = trip!.currencies ?? [];
    if (JSON.stringify(currencies) !== JSON.stringify(prevCurrencies)) {
      payload.currencies = currencies;
    }
    const pbPayload: Record<string, number> = {};
    for (const [memberId, val] of Object.entries(personalBudgets)) {
      if (val !== '' && Number(val) > 0) pbPayload[memberId] = Number(val);
    }
    const prevPb = trip!.personalBudgets ?? {};
    if (JSON.stringify(pbPayload) !== JSON.stringify(prevPb)) {
      payload.personalBudgets = pbPayload;
    }

    if (Object.keys(payload).length === 0) {
      router.back();
      return;
    }

    try {
      const res = await fetch(`/api/trip/${passcode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setApiError(data?.message ?? 'Failed to update trip. Please try again.');
        return;
      }

      await mutate();
      router.back();
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-4 pt-12">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h1 className="ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
          Edit Trip
        </h1>
      </div>

      <div className="px-6 pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Trip Name"
            placeholder="e.g., Barcelona 2026"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            error={errors.tripName}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={errors.startDate}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
          />
          <Select
            label="Currency"
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
          <Input
            label="Budget per person"
            type="number"
            placeholder="0"
            min="0"
            step="any"
            value={budgetPerPax}
            onChange={(e) => setBudgetPerPax(e.target.value)}
            error={errors.budgetPerPax}
          />
          {budgetPerPax && Number(budgetPerPax) > 0 && members.length > 0 && (
            <p className="text-[13px] text-slate-500">
              Total budget: {formatCurrency(Number(budgetPerPax) * members.length, currency || 'USD')}{' '}
              ({members.length} {members.length === 1 ? 'person' : 'people'})
            </p>
          )}
          {!budgetPerPax && (
            <Input
              label="Total Budget (manual)"
              type="number"
              placeholder="0"
              min="0"
              step="any"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              error={errors.budget}
            />
          )}
          {members.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-slate-600">
                Personal Budgets
              </label>
              <p className="text-[12px] text-slate-400">
                Each member can only see their own personal budget.
              </p>
              {members.map((m) => (
                <Input
                  key={m.memberId}
                  label={m.name}
                  type="number"
                  placeholder="No budget set"
                  min="0"
                  step="any"
                  value={personalBudgets[m.memberId] ?? ''}
                  onChange={(e) =>
                    setPersonalBudgets((prev) => ({
                      ...prev,
                      [m.memberId]: e.target.value,
                    }))
                  }
                  error={errors[`pb_${m.memberId}`]}
                />
              ))}
            </div>
          )}
          {apiError && <ErrorMessage message={apiError} />}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
