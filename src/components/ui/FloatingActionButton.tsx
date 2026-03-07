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
      className="fixed bottom-20 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] text-white shadow-fab transition-all active:scale-90 hover:shadow-xl hover:scale-105 animate-bounce"
      style={{ animationDuration: '3s', animationIterationCount: '3' }}
    >
      <span className="text-2xl">+</span>
    </Link>
  );
}
