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
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white/80 transition-colors hover:bg-white/30 hover:text-white"
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
        </div>
        <div className="relative mt-4 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold text-white">Edit Adventure</h1>
          <p className="mt-1 text-[14px] text-white/70">Fine-tune your trip details</p>
        </div>
      </div>

      {/* Boarding-pass style form card */}
      <div className="relative z-10 -mt-4 px-5 pb-8">
        <div className="overflow-hidden rounded-[20px] border-t-2 border-dashed border-white/50 bg-white shadow-lg shadow-purple-900/10">
          <div className="px-5 pb-6 pt-5">
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
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
