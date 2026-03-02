import useSWR from 'swr';
import type { Balance, Transaction, Payment } from '@/types';
import { fetcher } from '@/lib/fetcher';

export interface EnrichedTransaction extends Transaction {
  paid: number;
  remaining: number;
}

interface SettlementResponse {
  balances: Balance[];
  transactions: EnrichedTransaction[];
  payments: Payment[];
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
    payments: data?.payments ?? [],
    isLoading,
    error,
    mutate,
  };
}
