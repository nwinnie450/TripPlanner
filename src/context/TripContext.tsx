'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useParams } from 'next/navigation';
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
  const [currentMember, setCurrentMemberState] = useState<Member | null>(null);

  useEffect(() => {
    if (!passcode) return;
    const stored = localStorage.getItem(`grouptrip_member_${passcode}`);
    if (stored) {
      try {
        setCurrentMemberState(JSON.parse(stored));
      } catch {
        // invalid stored data
      }
    }
  }, [passcode]);

  function setCurrentMember(member: Member | null) {
    setCurrentMemberState(member);
    if (member && passcode) {
      localStorage.setItem(
        `grouptrip_member_${passcode}`,
        JSON.stringify(member),
      );
    } else if (passcode) {
      localStorage.removeItem(`grouptrip_member_${passcode}`);
    }
  }

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
