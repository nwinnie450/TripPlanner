import useSWR from 'swr';
import type { TripMetadata } from '@/types';
import { fetcher } from '@/lib/fetcher';

interface TripResponse extends TripMetadata {
  memberCount: number;
  totalExpenses: number;
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  refreshInterval: 30_000,
};

export function useTrip(passcode: string) {
  const { data, error, isLoading, mutate } = useSWR<TripResponse>(
    passcode ? `/api/trip/${passcode}` : null,
    fetcher,
    SWR_OPTIONS,
  );

  return { trip: data, isLoading, error, mutate };
}
