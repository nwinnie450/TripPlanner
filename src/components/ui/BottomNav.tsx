'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  passcode: string;
}

interface Tab {
  label: string;
  path: string;
  absolute?: boolean;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    label: 'Dashboard',
    path: '',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Itinerary',
    path: '/itinerary',
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
    path: '/expenses',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5A3.5 3.5 0 0 0 6 8.5 3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5 3.5 3.5 0 0 1 14.5 19H6" />
      </svg>
    ),
  },
  {
    label: 'Settle',
    path: '/settlement',
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
    path: '/profile',
    absolute: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ passcode }: BottomNavProps) {
  const pathname = usePathname();
  const basePath = `/trip/${passcode}`;

  function isActive(tab: Tab) {
    if (tab.absolute) return pathname === tab.path;
    const fullPath = basePath + tab.path;
    if (tab.path === '') return pathname === basePath;
    return pathname.startsWith(fullPath);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around bg-white shadow-nav">
      {tabs.map((tab) => {
        const active = isActive(tab);
        const href = tab.absolute ? tab.path : basePath + tab.path;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 pt-1 ${
              active ? 'text-ocean' : 'text-slate-400'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/4 right-1/4 h-[3px] rounded-full bg-ocean" />
            )}
            {tab.icon}
            <span className="text-[11px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
