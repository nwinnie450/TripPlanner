'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TripProvider } from '@/context/TripContext';
import GoogleMapsProvider from '@/components/providers/GoogleMapsProvider';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const rawPasscode = params.passcode;
  const passcode = typeof rawPasscode === 'string' ? rawPasscode : '';
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [validated, setValidated] = useState(false);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!passcode) {
      router.replace('/');
      return;
    }

    if (validatedRef.current) return;

    async function validate() {
      try {
        const res = await fetch('/api/trip/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode }),
        });
        if (!res.ok) {
          router.replace('/');
          return;
        }
        validatedRef.current = true;

        // Check if user is already a member of this trip
        const membersRes = await fetch(`/api/trip/${passcode}/members`);
        if (membersRes.ok) {
          const data = await membersRes.json();
          const isMember = data.members?.some(
            (m: { userId?: string }) => m.userId === user?.userId,
          );

          if (!isMember && !pathname.endsWith('/join')) {
            router.replace(`/trip/${passcode}/join`);
            return;
          }
        }

        setValidated(true);
      } catch {
        router.replace('/');
      }
    }

    validate();
  }, [passcode, router, pathname, user, authLoading]);

  if (!validated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TripProvider>
      <GoogleMapsProvider>
        <div className="pb-20">
          {children}
        </div>
      </GoogleMapsProvider>
    </TripProvider>
  );
}
