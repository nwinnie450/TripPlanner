'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTripContext } from '@/context/TripContext';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function JoinPage() {
  const { passcode, setCurrentMember } = useTripContext();
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    if (!user || !passcode) return;

    async function autoJoin() {
      try {
        const res = await fetch(`/api/trip/${passcode}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user!.name,
            userId: user!.userId,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.message ?? 'Failed to join trip.');
          setJoining(false);
          return;
        }

        const member = await res.json();
        setCurrentMember(member);
        router.replace(`/trip/${passcode}`);
      } catch {
        setError('Something went wrong. Please try again.');
        setJoining(false);
      }
    }

    autoJoin();
  }, [user, passcode, setCurrentMember, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-[20px] bg-white p-6 shadow-lg text-center">
            <span className="text-[48px] mb-2 block">😕</span>
            <ErrorMessage message={error} />
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2 text-[14px] font-medium text-white shadow-md transition-all hover:shadow-lg"
            >
              Go to My Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="relative w-full max-w-sm overflow-hidden">
        {/* Floating emojis background */}
        <span className="pointer-events-none absolute -right-4 -top-4 text-[64px] opacity-10 rotate-12 select-none">
          ✈️
        </span>
        <span className="pointer-events-none absolute -left-2 bottom-4 text-[48px] opacity-10 -rotate-6 select-none">
          🌍
        </span>
        <span className="pointer-events-none absolute right-8 bottom-0 text-[36px] opacity-10 select-none">
          🎫
        </span>

        <Card className="relative z-10 w-full rounded-[20px] border-0 bg-white p-8 text-center shadow-xl">
          {joining ? (
            <>
              <div className="mb-4">
                <span className="text-[56px] block mb-2">🎫</span>
                <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-r from-[#F5F3FF] to-[#FDF2F8] px-4 py-1">
                  <p className="text-[12px] font-bold tracking-widest text-[#7C3AED] uppercase">
                    Boarding Pass
                  </p>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 font-[family-name:var(--font-display)]">
                Welcome Aboard!
              </h1>
              <div className="my-4 border-t-2 border-dashed border-slate-200" />
              <div className="mb-4 rounded-[16px] bg-gradient-to-r from-[#F5F3FF] to-[#FDF2F8] p-4">
                <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Passenger</p>
                <p className="text-[18px] font-bold text-slate-900 mt-1">
                  {user?.name}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Trip Code</p>
                  <p className="text-[14px] font-bold font-mono text-[#7C3AED]">{passcode}</p>
                </div>
              </div>
              <LoadingSpinner />
              <p className="mt-3 text-[14px] font-medium text-slate-500">
                Preparing your journey...
              </p>
            </>
          ) : (
            <>
              <span className="text-[48px] block mb-3">🚫</span>
              <p className="text-[15px] text-slate-600">
                Unable to join this trip.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2 text-[14px] font-medium text-white shadow-md transition-all hover:shadow-lg"
              >
                Go to My Trips
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
