'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { TripProvider } from '@/context/TripContext';
import BottomNav from '@/components/ui/BottomNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NO_NAV_PATTERNS = ['/join', '/add', '/edit'];

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
  const [validated, setValidated] = useState(false);
  const validatedRef = useRef(false);

  const hideNav = NO_NAV_PATTERNS.some((p) => pathname.endsWith(p));

  useEffect(() => {
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
        setValidated(true);

        const storedMember = localStorage.getItem(
          `grouptrip_member_${passcode}`,
        );
        if (
          !storedMember &&
          !pathname.endsWith('/join')
        ) {
          router.replace(`/trip/${passcode}/join`);
        }
      } catch {
        router.replace('/');
      }
    }

    validate();
  }, [passcode, router, pathname]);

  if (!validated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TripProvider>
      <div className={hideNav ? '' : 'pb-20'}>
        {children}
      </div>
      {!hideNav && <BottomNav passcode={passcode} />}
    </TripProvider>
  );
}
