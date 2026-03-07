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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-white pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-12 pt-14">
        {/* Floating travel emojis */}
        <span className="pointer-events-none absolute left-4 top-6 text-[28px] opacity-20">✈️</span>
        <span className="pointer-events-none absolute right-10 top-4 text-[20px] opacity-15">☁️</span>
        <span className="pointer-events-none absolute left-1/3 top-3 text-[14px] opacity-10">☁️</span>
        <span className="pointer-events-none absolute bottom-4 left-8 text-[22px] opacity-15">🌍</span>
        <span className="pointer-events-none absolute bottom-8 right-6 text-[18px] opacity-20">🏖️</span>
        <span className="pointer-events-none absolute right-1/4 top-10 text-[16px] opacity-10">⛅</span>
        <span className="pointer-events-none absolute bottom-3 left-1/2 text-[14px] opacity-15">🗺️</span>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-white/80">
              Hi, {user?.name ?? 'there'} 👋
            </p>
            <h1 className="mt-1 font-display text-[30px] font-extrabold leading-tight text-white">
              Where to next?
            </h1>
            <p className="mt-1 text-[13px] text-white/60">
              Your adventures start here
            </p>
          </div>
          <Link href="/profile" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors active:bg-white/30">
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
            <h2 className="mb-3 text-[15px] font-semibold text-[#7C3AED]/60">My Trips</h2>
            <div className="h-20 animate-pulse rounded-[20px] bg-purple-50" />
          </div>
        ) : trips.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 text-[15px] font-semibold text-[#7C3AED]/60">My Trips</h2>
            <div className="flex flex-col gap-3">
              {trips.map((trip) => (
                <Link key={trip.passcode} href={`/trip/${trip.passcode}`} className="block">
                  <div className="flex items-center gap-3 rounded-[20px] border border-purple-100/60 bg-white p-4 shadow-[0_2px_12px_rgba(124,58,237,0.08)] active:bg-purple-50/50 transition-all">
                    <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#7C3AED] to-[#A78BFA]" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[18px]">
                      ✈️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-slate-900">{trip.tripName}</h3>
                      <p className="text-[12px] text-slate-400">
                        {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)} &middot; {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-3 py-1 text-[11px] font-bold text-white">
                      Go
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-[20px] border border-dashed border-purple-200 bg-white p-8 text-center shadow-[0_2px_12px_rgba(124,58,237,0.06)]">
            <p className="text-[40px]">🧳</p>
            <p className="mt-2 text-[16px] font-semibold text-slate-700">No trips yet!</p>
            <p className="mt-1 text-[13px] text-slate-400">Time to plan your first adventure</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4">
          {/* Create Trip */}
          <Link href="/create" className="block">
            <div className="flex items-center gap-4 rounded-[20px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] p-5 shadow-[0_4px_20px_rgba(124,58,237,0.25)] active:opacity-90 transition-opacity">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-[24px]">
                🗺️
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-white">Create a Trip</h2>
                <p className="mt-0.5 text-[13px] text-white/70">Plan a new adventure</p>
              </div>
            </div>
          </Link>

          {/* Join Trip */}
          <div className="rounded-[20px] border border-purple-100/60 bg-white p-5 shadow-[0_2px_12px_rgba(124,58,237,0.08)]">
            <div className="mb-4 border-b-2 border-dashed border-purple-100 pb-4">
              <h2 className="text-[17px] font-bold text-slate-900">Got an invite? 🎟️</h2>
              <p className="mt-0.5 text-[13px] text-slate-400">Enter the passcode to join the fun</p>
            </div>

            <div className="flex justify-center gap-2">
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
                  className="h-12 w-11 rounded-xl border-2 border-purple-100 bg-purple-50/50 text-center font-mono text-lg font-bold text-slate-900 transition-colors focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                  aria-label={`Passcode character ${i + 1}`}
                />
              ))}
            </div>

            {error && <div className="mt-3"><ErrorMessage message={error} /></div>}

            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-opacity hover:opacity-90 active:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : "Let's Go! 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
