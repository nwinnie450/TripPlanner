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
    <div className="min-h-screen bg-[#F8F5FF]">
      {/* Purple gradient hero with floating travel elements */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-14 pt-12 text-center">
        {/* Floating travel emojis */}
        <span className="absolute left-4 top-6 text-[28px] opacity-40">☁️</span>
        <span className="absolute right-8 top-4 text-[20px] opacity-30">☁️</span>
        <span className="absolute left-10 top-22 text-[16px] opacity-25">✈️</span>
        <span className="absolute right-4 top-24 text-[22px] opacity-35">🗺️</span>
        <span className="absolute bottom-16 left-6 text-[18px] opacity-30">🧳</span>
        <span className="absolute bottom-12 right-10 text-[14px] opacity-20">☁️</span>

        <div className="relative z-10">
          <div className="text-[56px]">🌍</div>
          <h1 className="font-[family-name:var(--font-display)] text-[34px] font-extrabold text-white">
            Join the adventure!
          </h1>
          <p className="mt-2 text-[15px] font-medium text-[#E9D5FF]">
            Pack your bags, we&apos;re going places
          </p>
        </div>
      </div>

      {/* Boarding pass dashed divider */}
      <div className="relative z-10 -mt-6 px-5">
        <div className="border-b-2 border-dashed border-[#D8B4FE]" />
      </div>

      {/* Form section - boarding pass card */}
      <div className="relative z-10 -mt-1 px-5 pb-8">
        <div className="rounded-[24px] bg-white px-6 pb-6 pt-7 shadow-[0_4px_24px_rgba(124,58,237,0.10)]">
          <p className="mb-5 text-center text-[13px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
            New Traveler
          </p>

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
              {isSubmitting ? 'Creating account...' : 'Start Exploring 🌍'}
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
              className="font-semibold text-[#7C3AED] hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
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
