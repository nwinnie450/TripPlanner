'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Member } from '@/types';

interface TripContextValue {
  passcode: string;
  currentMember: Member | null;
  setCurrentMember: (member: Member | null) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const rawPasscode = params.passcode;
  const passcode = typeof rawPasscode === 'string' ? rawPasscode : '';
  const { user } = useAuth();
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Resolve current member by matching userId from auth
  useEffect(() => {
    if (!passcode || !user) return;

    async function resolveMember() {
      try {
        const res = await fetch(`/api/trip/${passcode}/members`);
        if (!res.ok) return;
        const data = await res.json();
        const match = data.members?.find(
          (m: Member) => m.userId === user!.userId,
        );
        if (match) setCurrentMember(match);
      } catch {
        // ignore
      }
    }

    resolveMember();
  }, [passcode, user]);

  return (
    <TripContext.Provider value={{ passcode, currentMember, setCurrentMember }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
}
