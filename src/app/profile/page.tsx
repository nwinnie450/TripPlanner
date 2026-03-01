'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMyTrips } from '@/hooks/useMyTrips';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { trips, isLoading: tripsLoading } = useMyTrips(!!user);

  if (authLoading) return <LoadingSpinner />;

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Purple gradient header */}
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-5 pb-8 pt-4">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <h1 className="font-display text-[20px] font-bold text-white">Profile</h1>
        </div>

        {/* Avatar + user info */}
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 text-[28px] font-bold text-white">
            {initials}
          </div>
          <h2 className="mt-3 text-[20px] font-bold text-white">{user.name}</h2>
          <p className="text-[14px] text-white/70">{user.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        {/* Account section */}
        <div className="mb-6">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Account</h3>
          <div className="rounded-2xl bg-[#F4F4F5] p-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <span className="text-[14px] text-slate-500">Name</span>
              <span className="text-[14px] font-medium text-slate-900">{user.name}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-[14px] text-slate-500">Email</span>
              <span className="text-[14px] font-medium text-slate-900">{user.email}</span>
            </div>
          </div>
        </div>

        {/* My Trips section */}
        <div className="mb-6">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">My Trips</h3>
          {tripsLoading ? (
            <div className="h-16 animate-pulse rounded-2xl bg-[#F4F4F5]" />
          ) : trips.length > 0 ? (
            <div className="space-y-3">
              {trips.map((trip) => (
                <Link key={trip.passcode} href={`/trip/${trip.passcode}`} className="block">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F4F4F5] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
                      <span className="text-[18px]">✈️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-[15px] font-semibold text-slate-900">{trip.tripName}</h4>
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
          ) : (
            <p className="text-[14px] text-slate-400">No trips yet. Create or join one!</p>
          )}
        </div>

        {/* Log out button */}
        <button
          onClick={logout}
          className="w-full rounded-xl border border-red/20 bg-red/5 py-3 text-[15px] font-semibold text-red"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
