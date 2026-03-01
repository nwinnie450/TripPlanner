'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMyTrips } from '@/hooks/useMyTrips';
import { formatDate } from '@/lib/utils';
import { User, Bell, Globe, Settings, ChevronRight, LogOut } from 'lucide-react';
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
            <span className="font-display text-[24px] font-extrabold text-[#14B8A6]">{trips.length}</span>
            <span className="text-[12px] font-medium text-[#71717A]">Countries</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[20px] bg-[#F472B610] p-4">
            <span className="font-display text-[24px] font-extrabold text-[#F472B6]">S$0</span>
            <span className="text-[12px] font-medium text-[#71717A]">Spent</span>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="mb-3 font-display text-[18px] font-bold text-[#18181B]">Settings</h3>
          <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
            <SettingsRow icon={<User size={18} />} iconBg="#8B5CF610" iconColor="#8B5CF6" label="Edit Profile" />
            <SettingsRow icon={<Bell size={18} />} iconBg="#14B8A610" iconColor="#14B8A6" label="Notifications" border />
            <SettingsRow icon={<Globe size={18} />} iconBg="#F472B610" iconColor="#F472B6" label="Currency" border />
            <SettingsRow icon={<Settings size={18} />} iconBg="#F9731610" iconColor="#F97316" label="Preferences" border last />
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

function SettingsRow({
  icon,
  iconBg,
  iconColor,
  label,
  border,
  last,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  border?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 px-[18px] py-4 ${border && !last ? 'border-t border-[#F4F4F5]' : ''}`}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-medium text-[#18181B]">{label}</span>
      <ChevronRight size={18} className="text-[#A1A1AA]" />
    </div>
  );
}
