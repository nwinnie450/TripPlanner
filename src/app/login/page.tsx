'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Mail, EyeOff } from 'lucide-react';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const err = await login(email, password);
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
        <h1 className="font-[family-name:var(--font-display)] text-[32px] font-extrabold text-white">
          GroupTrip
        </h1>
        <p className="mt-1 text-[15px] text-[#E9D5FF]">
          Plan together, travel better
        </p>
      </div>

      {/* Form section */}
      <div className="px-6 pt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail size={18} />}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<EyeOff size={18} />}
          />
          {error && <p className="text-[13px] text-red">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E4E4E7]" />
          <span className="text-[13px] text-[#A1A1AA]">or</span>
          <div className="h-px flex-1 bg-[#E4E4E7]" />
        </div>

        <p className="text-center text-[13px] text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            href={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-ocean hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
