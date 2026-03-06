import useSWR from 'swr';
import type { Balance, Transaction, Payment } from '@/types';
import { fetcher } from '@/lib/fetcher';

export interface EnrichedTransaction extends Transaction {
  paid: number;
  remaining: number;
}

export interface CurrencySettlementGroup {
  currency: string;
  balances: Balance[];
  transactions: EnrichedTransaction[];
}

interface SettlementResponse {
  groups: CurrencySettlementGroup[];
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
    groups: data?.groups ?? [],
    payments: data?.payments ?? [],
    isLoading,
    error,
    mutate,
  };
}
