'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { PASSCODE_LENGTH } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [chars, setChars] = useState<string[]>(
    Array(PASSCODE_LENGTH).fill(''),
  );
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 text-ocean"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.8 19.2L16 11L12 2L8 11L6.2 19.2" />
            <path d="M1 22L6.2 19.2L12 21L17.8 19.2L23 22" />
            <path d="M12 2V21" />
          </svg>
          <h1 className="text-[28px] font-bold text-ocean">GroupTrip</h1>
          <p className="text-[15px] text-slate-600">
            Plan together. Split fair.
          </p>
        </div>

        <Card className="w-full">
          <h2 className="mb-4 text-[16px] font-semibold text-slate-900">
            Join an Existing Trip
          </h2>
          <p className="mb-3 text-[13px] text-slate-600">
            Enter trip passcode
          </p>
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
                className="h-12 w-11 rounded-lg border border-sand-dark bg-white text-center font-mono text-lg font-bold text-slate-900 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean"
                aria-label={`Passcode character ${i + 1}`}
              />
            ))}
          </div>
          {error && <ErrorMessage message={error} />}
          <Button onClick={handleJoin} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Trip'}
          </Button>
        </Card>

        <div className="flex items-center gap-3 text-[13px] text-slate-400">
          <span className="h-px w-12 bg-sand-dark" />
          or
          <span className="h-px w-12 bg-sand-dark" />
        </div>

        <Card className="w-full">
          <h2 className="mb-3 text-[16px] font-semibold text-slate-900">
            Start a New Trip
          </h2>
          <Link href="/create">
            <Button variant="secondary">Create Trip &rarr;</Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
