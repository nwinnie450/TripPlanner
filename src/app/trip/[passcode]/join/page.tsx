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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <ErrorMessage message={error} />
          <Link
            href="/"
            className="mt-4 block text-center text-[14px] font-medium text-ocean"
          >
            Go to My Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        {joining ? (
          <>
            <LoadingSpinner />
            <p className="mt-4 text-[15px] font-semibold text-slate-900">
              Joining trip as {user?.name}...
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] text-slate-600">
              Unable to join this trip.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-[14px] font-medium text-ocean"
            >
              Go to My Trips
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
