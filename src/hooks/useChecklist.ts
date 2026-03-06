import useSWR from 'swr';
import type { ChecklistItem } from '@/types';
import { fetcher } from '@/lib/fetcher';

const SWR_OPTIONS = { revalidateOnFocus: true, refreshInterval: 30_000 };

export function useChecklist(passcode: string) {
  const { data, error, isLoading, mutate } = useSWR<ChecklistItem[]>(
    passcode ? `/api/trip/${passcode}/checklist` : null,
    fetcher,
    SWR_OPTIONS,
  );
  return { items: data ?? [], isLoading, error, mutate };
}
