import useSWR from 'swr';
import type { Balance, Transaction } from '@/types';
import { fetcher } from '@/lib/fetcher';

interface SettlementResponse {
  balances: Balance[];
  transactions: Transaction[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  refreshInterval: 30_000,
};

export function useSettlement(passcode: string) {
  const { data, error, isLoading, mutate } = useSWR<SettlementResponse>(
    passcode ? `/api/trip/${passcode}/settlement` : null,
    fetcher,
    SWR_OPTIONS,
  );

  return {
    balances: data?.balances ?? [],
    transactions: data?.transactions ?? [],
    isLoading,
    error,
    mutate,
  };
}
