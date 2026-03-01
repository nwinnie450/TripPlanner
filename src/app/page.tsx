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
    <div className="flex min-h-screen flex-col bg-sand">
      {/* Purple gradient header */}
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-12">
        {/* Greeting row */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[15px] font-medium text-white/90">
            Hi, {user?.name ?? 'there'} {'👋'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30">
            <svg
              width="18"
              height="18"
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
          </div>
        </div>

        {/* Explore title */}
        <h1 className="mb-4 font-display text-[26px] font-extrabold text-white">Explore</h1>

        {/* Decorative search bar */}
        <div className="flex items-center gap-3 rounded-full bg-white/20 px-4 py-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[14px] text-white/50">Search destinations...</span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-6">
        {/* My Trips section */}
        {tripsLoading ? (
          <div className="mb-6">
            <h2 className="mb-3 text-[16px] font-semibold text-slate-900">My Trips</h2>
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-[#F4F4F5]" />
            </div>
          </div>
        ) : trips.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 text-[16px] font-semibold text-slate-900">My Trips</h2>
            <div className="space-y-3">
              {trips.map((trip) => (
                <Link key={trip.passcode} href={`/trip/${trip.passcode}`} className="block">
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
                      <span className="text-[18px]">✈️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-[15px] font-semibold text-slate-900">{trip.tripName}</h3>
                      <p className="text-[12px] text-slate-400">
                        {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)} &middot; {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Join Trip card */}
        <div className="rounded-3xl border border-[#8B5CF630] bg-gradient-to-br from-[#8B5CF620] to-[#F472B620] p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">Join a Trip</h2>
              <p className="text-[13px] text-slate-500">Enter the passcode shared by your group</p>
            </div>
          </div>

          <div className="mb-4 flex justify-center gap-2">
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
                className="h-12 w-11 rounded-lg border border-[#8B5CF6]/20 bg-white text-center font-mono text-lg font-bold text-slate-900 focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                aria-label={`Passcode character ${i + 1}`}
              />
            ))}
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : 'Join Trip'}
          </button>
        </div>

        {/* Create Trip card */}
        <Link href="/create" className="mt-4 block">
          <div className="rounded-3xl border border-[#8B5CF630] bg-gradient-to-br from-[#8B5CF620] to-[#F472B620] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">Create a Trip</h2>
                <p className="text-[13px] text-slate-500">Start planning a new group adventure</p>
              </div>
              <svg
                className="ml-auto"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A1A1AA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
