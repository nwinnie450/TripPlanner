import useSWR from 'swr';
import type { ItineraryItem } from '@/types';
import { fetcher } from '@/lib/fetcher';

interface ItineraryResponse {
  items: ItineraryItem[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  refreshInterval: 30_000,
};

export function useItinerary(passcode: string) {
  const { data, error, isLoading, mutate } = useSWR<ItineraryResponse>(
    passcode ? `/api/trip/${passcode}/itinerary` : null,
    fetcher,
    SWR_OPTIONS,
  );

  return { items: data?.items ?? [], isLoading, error, mutate };
}
