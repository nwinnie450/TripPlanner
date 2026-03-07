'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMyTrips } from '@/hooks/useMyTrips';
import { useAuth } from '@/context/AuthContext';

const HIDE_ON = ['/login', '/signup'];
const HIDE_SUFFIXES = ['/join', '/add', '/edit'];

export default function AppBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { trips } = useMyTrips(!!user);

  // Hide on auth pages and form pages
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  if (HIDE_SUFFIXES.some((s) => pathname.endsWith(s))) return null;

  // Detect if inside a trip
  const tripMatch = pathname.match(/^\/trip\/([A-Z0-9]+)/i);
  const passcode = tripMatch?.[1] ?? trips[0]?.passcode ?? null;

  const base = passcode ? `/trip/${passcode}` : null;

  const tabs = [
    {
      label: 'Home',
      href: base ?? '/',
      active: pathname === '/' || pathname === '/create' || (!!base && pathname === base),
      activeIcon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
        </svg>
      ),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Itinerary',
      href: base ? `${base}/itinerary` : '/',
      active: pathname.includes('/itinerary'),
      disabled: !base,
      activeIcon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        </svg>
      ),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Expenses',
      href: base ? `${base}/expenses` : '/',
      active: pathname.includes('/expenses'),
      disabled: !base,
      activeIcon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="2" />
          <path d="M15 9H10.5A1.5 1.5 0 0 0 9 10.5 1.5 1.5 0 0 0 10.5 12H13.5A1.5 1.5 0 0 1 15 13.5 1.5 1.5 0 0 1 13.5 15H9" stroke="white" strokeWidth="2" />
        </svg>
      ),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5A3.5 3.5 0 0 0 6 8.5 3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5 3.5 3.5 0 0 1 14.5 19H6" />
        </svg>
      ),
    },
    {
      label: 'Settle',
      href: base ? `${base}/settlement` : '/',
      active: pathname.includes('/settlement'),
      disabled: !base,
      activeIcon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4" />
          <path d="M17 21V19A4 4 0 0 0 13 15H5A4 4 0 0 0 1 19V21Z" />
          <path d="M16 3.13A4 4 0 0 1 16 10.87" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21V19A4 4 0 0 0 20 15.13" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21V19A4 4 0 0 0 13 15H5A4 4 0 0 0 1 19V21" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21V19A4 4 0 0 0 20 15.13" />
          <path d="M16 3.13A4 4 0 0 1 16 10.87" />
        </svg>
      ),
    },
    {
      label: 'Profile',
      href: '/profile',
      active: pathname === '/profile',
      activeIcon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2Z" />
        </svg>
      ),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around rounded-t-3xl bg-white/95 backdrop-blur-md shadow-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => {
        const isDisabled = 'disabled' in tab && tab.disabled;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-1 pt-1 transition-colors ${
              tab.active ? 'text-ocean' : isDisabled ? 'text-slate-300' : 'text-slate-400'
            }`}
          >
            {tab.active && (
              <span className="absolute top-1.5 rounded-full bg-ocean/10 px-4 py-3.5" />
            )}
            <span className="relative z-10">{tab.active ? tab.activeIcon : tab.icon}</span>
            <span className="relative z-10 text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
