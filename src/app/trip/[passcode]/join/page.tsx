'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripContext } from '@/context/TripContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function JoinPage() {
  const { passcode, setCurrentMember } = useTripContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/trip/${passcode}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Failed to join trip.');
        return;
      }

      const member = await res.json();
      setCurrentMember(member);
      router.replace(`/trip/${passcode}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Join the Trip
        </h1>
        <p className="mb-6 text-[15px] text-slate-600">
          Enter your display name so others know who you are.
        </p>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Your Name *"
              placeholder="e.g., Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            {error && <ErrorMessage message={error} />}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Joining...' : 'Join Trip'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
