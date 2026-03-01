'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Mail, EyeOff, User } from 'lucide-react';

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const err = await signup(email, password, name);
      if (err) {
        setError(err);
      } else {
        router.push(redirect);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Purple gradient hero */}
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#A78BFA] to-[#C4B5FD] py-10 px-6 text-center">
        <div className="text-[48px]">✈️</div>
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-extrabold text-white">
          Create Account
        </h1>
        <p className="mt-1 text-[15px] text-[#E9D5FF]">
          Start planning your next adventure
        </p>
      </div>

      {/* Form section */}
      <div className="px-6 pt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User size={18} />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail size={18} />}
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              icon={<EyeOff size={18} />}
            />
            <p className="mt-1 text-xs text-[#A1A1AA]">Min. 8 characters</p>
          </div>
          {error && <p className="text-[13px] text-red">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E4E4E7]" />
          <span className="text-[13px] text-[#A1A1AA]">or</span>
          <div className="h-px flex-1 bg-[#E4E4E7]" />
        </div>

        <p className="text-center text-[13px] text-slate-600">
          Already have an account?{' '}
          <Link
            href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-ocean hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
