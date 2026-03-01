'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDE_ON = ['/login', '/signup'];
const HIDE_SUFFIXES = ['/join', '/add', '/edit'];

export default function AppBottomNav() {
  const pathname = usePathname();

  // Hide on auth pages and form pages
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  if (HIDE_SUFFIXES.some((s) => pathname.endsWith(s))) return null;

  // Detect if inside a trip
  const tripMatch = pathname.match(/^\/trip\/([A-Z0-9]+)/i);
  const passcode = tripMatch?.[1];

  if (passcode) {
    return <TripNav pathname={pathname} passcode={passcode} />;
  }

  return <GlobalNav pathname={pathname} />;
}

function GlobalNav({ pathname }: { pathname: string }) {
  const tabs = [
    {
      label: 'Home',
      href: '/',
      active: pathname === '/' || pathname === '/create',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Profile',
      href: '/profile',
      active: pathname === '/profile',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return <NavBar tabs={tabs} />;
}

function TripNav({ pathname, passcode }: { pathname: string; passcode: string }) {
  const base = `/trip/${passcode}`;

  const tabs = [
    {
      label: 'Dashboard',
      href: base,
      active: pathname === base,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Itinerary',
      href: `${base}/itinerary`,
      active: pathname.startsWith(`${base}/itinerary`),
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
      href: `${base}/expenses`,
      active: pathname.startsWith(`${base}/expenses`),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5A3.5 3.5 0 0 0 6 8.5 3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5 3.5 3.5 0 0 1 14.5 19H6" />
        </svg>
      ),
    },
    {
      label: 'Settle',
      href: `${base}/settlement`,
      active: pathname.startsWith(`${base}/settlement`),
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
      active: false,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return <NavBar tabs={tabs} />;
}

function NavBar({ tabs }: { tabs: { label: string; href: string; active: boolean; icon: React.ReactNode }[] }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around bg-white shadow-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 pt-1 ${
            tab.active ? 'text-ocean' : 'text-slate-400'
          }`}
        >
          {tab.active && (
            <span className="absolute top-0 left-1/4 right-1/4 h-[3px] rounded-full bg-ocean" />
          )}
          {tab.icon}
          <span className="text-[11px] font-medium">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
