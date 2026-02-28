'use client';

import Link from 'next/link';

interface FloatingActionButtonProps {
  href: string;
  label?: string;
}

export default function FloatingActionButton({
  href,
  label = 'Add',
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sunset text-white shadow-fab transition-transform active:scale-95"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
