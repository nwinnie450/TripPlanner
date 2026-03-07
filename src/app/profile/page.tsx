'use client';

import { useState, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMyTrips } from '@/hooks/useMyTrips';
import { formatDate, getDaysBetween } from '@/lib/utils';
import { formatCurrency } from '@/lib/constants';
import { ChevronRight, ChevronDown, User, LogOut } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, logout, updateName, isLoading: authLoading } = useAuth();
  const { trips, isLoading: tripsLoading } = useMyTrips(!!user);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);


  const stats = useMemo(() => {
    const uniqueCurrencies = [...new Set(trips.map((t) => t.currency))];
    const totalSpent = trips.reduce((sum, t) => sum + t.totalSpent, 0);
    const mostUsedCurrency = uniqueCurrencies.length > 0
      ? uniqueCurrencies.reduce((best, cur) => {
          const count = trips.filter((t) => t.currency === cur).length;
          const bestCount = trips.filter((t) => t.currency === best).length;
          return count > bestCount ? cur : best;
        })
      : 'USD';

    const today = new Date().toISOString().split('T')[0];
    const upcoming = trips
      .filter((t) => t.endDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const nextTrip = upcoming[0] ?? null;

    let daysUntil = 0;
    if (nextTrip) {
      const start = new Date(nextTrip.startDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return { uniqueCurrencies, totalSpent, mostUsedCurrency, nextTrip, daysUntil };
  }, [trips]);

  if (authLoading) return <LoadingSpinner />;
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleNameSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Name is required'); return; }
    if (trimmed.length > 50) { setNameError('Name too long'); return; }

    setNameSaving(true);
    setNameError('');
    const err = await updateName(trimmed);
    setNameSaving(false);
    if (err) { setNameError(err); return; }
    setEditingName(false);
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Gradient header with avatar */}
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-7 pt-4">
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

        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white font-display text-[32px] font-extrabold text-[#8B5CF6]">
            {initials}
          </div>
          <h2 className="mt-4 font-display text-[24px] font-extrabold text-white">{user.name}</h2>
          <p className="text-[14px] text-white/80">{user.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-6">
        {/* Stats row */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[20px] bg-[#8B5CF610] p-4">
            <span className="font-display text-[24px] font-extrabold text-[#8B5CF6]">{trips.length}</span>
            <span className="text-[12px] font-medium text-[#71717A]">Trips</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[20px] bg-[#14B8A610] p-4">
            <span className="font-display text-[24px] font-extrabold text-[#14B8A6]">{stats.uniqueCurrencies.length}</span>
            <span className="text-[12px] font-medium text-[#71717A]">Currencies</span>
            {stats.uniqueCurrencies.length > 0 && (
              <span className="text-[10px] text-[#A1A1AA]">{stats.uniqueCurrencies.join(', ')}</span>
            )}
          </div>
          {trips.length > 0 && (
            <div className="flex flex-1 flex-col items-center gap-1 rounded-[20px] bg-[#F472B610] p-4">
              <span className="font-display text-[24px] font-extrabold text-[#F472B6]">
                {formatCurrency(stats.totalSpent, stats.mostUsedCurrency)}
              </span>
              <span className="text-[12px] font-medium text-[#71717A]">Total Spent</span>
            </div>
          )}
        </div>

        {/* Next Trip countdown */}
        {stats.nextTrip && (
          <Link href={`/trip/${stats.nextTrip.passcode}`} className="block">
            <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] p-5">
              <div className="relative z-10">
                <p className="text-[12px] font-medium text-white/70">
                  {stats.daysUntil > 0 ? 'Upcoming Trip' : 'Ongoing Trip'}
                </p>
                <h3 className="mt-1 text-[18px] font-bold text-white">{stats.nextTrip.tripName}</h3>
                <p className="mt-0.5 text-[13px] text-white/80">
                  {formatDate(stats.nextTrip.startDate)} &ndash; {formatDate(stats.nextTrip.endDate)}
                  {' '}&middot; {stats.nextTrip.memberCount} {stats.nextTrip.memberCount === 1 ? 'member' : 'members'}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
                  <span className="text-[14px]">✈️</span>
                  <span className="text-[14px] font-bold text-white">
                    {stats.daysUntil > 0
                      ? `${stats.daysUntil} day${stats.daysUntil === 1 ? '' : 's'} to go`
                      : stats.daysUntil === 0
                        ? "It's today!"
                        : `${getDaysBetween(stats.nextTrip.startDate, stats.nextTrip.endDate)} day trip`}
                  </span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 text-[80px] opacity-10">✈️</div>
            </div>
          </Link>
        )}

        {/* Settings */}
        <div>
          <h3 className="mb-3 font-display text-[18px] font-bold text-[#18181B]">Account</h3>
          <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
            {/* Edit Name */}
            <div>
              <button
                onClick={() => {
                  setEditingName(!editingName);
                  setNewName(user.name);
                  setNameError('');
                }}
                className="flex w-full items-center gap-3.5 px-[18px] py-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#8B5CF610] text-[#8B5CF6]">
                  <User size={18} />
                </div>
                <span className="flex-1 text-left text-[15px] font-medium text-[#18181B]">Edit Name</span>
                <ChevronDown size={18} className={`text-[#A1A1AA] transition-transform ${editingName ? 'rotate-180' : ''}`} />
              </button>
              {editingName && (
                <form onSubmit={handleNameSave} className="border-t border-[#F4F4F5] px-[18px] pb-4 pt-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                    placeholder="Your name"
                    maxLength={50}
                    className="h-11 w-full rounded-xl bg-[#F4F4F5] px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
                  />
                  {nameError && <p className="mt-1.5 text-[12px] text-red-500">{nameError}</p>}
                  <button
                    type="submit"
                    disabled={nameSaving}
                    className="mt-3 h-10 w-full rounded-xl bg-gradient-to-b from-[#7C3AED] to-[#8B5CF6] text-[14px] font-semibold text-white disabled:opacity-50"
                  >
                    {nameSaving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* My Trips */}
        {(tripsLoading || trips.length > 0) && (
          <div>
            <h3 className="mb-3 font-display text-[18px] font-bold text-[#18181B]">My Trips</h3>
            {tripsLoading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-[#F4F4F5]" />
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <Link key={trip.passcode} href={`/trip/${trip.passcode}`} className="block">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
                        <span className="text-[18px]">✈️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-[15px] font-semibold text-slate-900">{trip.tripName}</h4>
                        <p className="text-[12px] text-slate-400">
                          {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)} &middot; {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-[#A1A1AA]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log out */}
        <button
          onClick={logout}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl border border-[#FCA5A520] bg-[#FEF2F2]"
        >
          <LogOut size={18} className="text-[#EF4444]" />
          <span className="text-[15px] font-semibold text-[#EF4444]">Log Out</span>
        </button>

        {/* Version */}
        <p className="text-center text-[12px] font-medium text-[#D4D4D8]">GroupTrip v1.0.0</p>
      </div>
    </div>
  );
}
