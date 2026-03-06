'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMyTrips } from '@/hooks/useMyTrips';
import { formatDate } from '@/lib/utils';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { PASSCODE_LENGTH } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { trips, isLoading: tripsLoading } = useMyTrips(!!user);
  const [chars, setChars] = useState<string[]>(Array(PASSCODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!upper) return;
    const char = upper[upper.length - 1];
    const next = [...chars];
    next[index] = char;
    setChars(next);
    setError('');

    if (index < PASSCODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (chars[index]) {
        const next = [...chars];
        next[index] = '';
        setChars(next);
      } else if (index > 0) {
        const next = [...chars];
        next[index - 1] = '';
        setChars(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, PASSCODE_LENGTH);
    if (!pasted) return;
    const next = [...chars];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setChars(next);
    const focusIdx = Math.min(pasted.length, PASSCODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleJoin() {
    const passcode = chars.join('');
    if (passcode.length !== PASSCODE_LENGTH) {
      setError('Please enter the full 6-character passcode.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/trip/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Invalid passcode. Please try again.');
        return;
      }

      router.push(`/trip/${passcode}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-8 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] text-white/70">
              Hi, {user?.name ?? 'there'}
            </p>
            <h1 className="mt-0.5 font-display text-[24px] font-extrabold text-white">
              GroupTrip
            </h1>
          </div>
          <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6">
        {/* My Trips */}
        {tripsLoading ? (
          <div className="mb-6">
            <h2 className="mb-3 text-[15px] font-semibold text-slate-500">My Trips</h2>
            <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : trips.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 text-[15px] font-semibold text-slate-500">My Trips</h2>
            <div className="flex flex-col gap-2">
              {trips.map((trip) => (
                <Link key={trip.passcode} href={`/trip/${trip.passcode}`} className="block">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-[16px]">
                      ✈️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-slate-900">{trip.tripName}</h3>
                      <p className="text-[12px] text-slate-400">
                        {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)} &middot; {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-[14px] text-slate-400">No trips yet</p>
            <p className="mt-1 text-[12px] text-slate-300">Create or join a trip to get started</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Create Trip */}
          <Link href="/create" className="block">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] p-4 shadow-sm active:opacity-90 transition-opacity">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Create a Trip</h2>
                <p className="text-[12px] text-white/70">Start planning a new group adventure</p>
              </div>
            </div>
          </Link>

          {/* Join Trip */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-[15px] font-semibold text-slate-900">Join a Trip</h2>
            <p className="mt-0.5 text-[12px] text-slate-400">Enter the passcode shared by your group</p>

            <div className="mt-4 flex justify-center gap-2">
              {chars.map((char, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  maxLength={2}
                  value={char}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="h-12 w-11 rounded-lg border border-slate-200 bg-slate-50 text-center font-mono text-lg font-bold text-slate-900 focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                  aria-label={`Passcode character ${i + 1}`}
                />
              ))}
            </div>

            {error && <div className="mt-3"><ErrorMessage message={error} /></div>}

            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="mt-4 w-full rounded-xl bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
