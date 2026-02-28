import useSWR from 'swr';
import type { Member } from '@/types';
import { fetcher } from '@/lib/fetcher';

interface MembersResponse {
  members: Member[];
}

const SWR_OPTIONS = {
  revalidateOnFocus: true,
  refreshInterval: 30_000,
};

export function useMembers(passcode: string) {
  const { data, error, isLoading, mutate } = useSWR<MembersResponse>(
    passcode ? `/api/trip/${passcode}/members` : null,
    fetcher,
    SWR_OPTIONS,
  );

  return { members: data?.members ?? [], isLoading, error, mutate };
}
