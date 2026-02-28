import useSWR from 'swr';
import type { Expense } from '@/types';
import { fetcher } from '@/lib/fetcher';

interface ExpensesResponse {
  expenses: Expense[];
  total: number;
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  refreshInterval: 30_000,
};

export function useExpenses(passcode: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const query = params.toString();
  const url = passcode
    ? `/api/trip/${passcode}/expenses${query ? `?${query}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ExpensesResponse>(
    url,
    fetcher,
    SWR_OPTIONS,
  );

  return {
    expenses: data?.expenses ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
