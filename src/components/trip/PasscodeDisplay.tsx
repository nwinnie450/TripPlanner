'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';

interface PasscodeDisplayProps {
  passcode: string;
}

export default function PasscodeDisplay({ passcode }: PasscodeDisplayProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  function getTripUrl() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/trip/${passcode}`;
    }
    return `/trip/${passcode}`;
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(passcode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  async function handleShare() {
    const message = `Join my trip on GroupTrip!\n\nTrip code: ${passcode}\nOr use this link: ${getTripUrl()}`;
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="relative rounded-[20px] border-2 border-dashed border-ocean/30 bg-gradient-to-br from-ocean-light via-white to-ocean-light p-4 shadow-card">
      <div className="absolute -left-[11px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-50" />
      <div className="absolute -right-[11px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-50" />
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            🎫 Boarding Pass
          </p>
          <p className="font-mono text-2xl font-bold tracking-[0.3em] text-ocean">{passcode}</p>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex h-10 min-w-[44px] items-center justify-center rounded-xl bg-white px-3 text-[13px] font-medium text-ocean shadow-md transition-shadow hover:shadow-lg"
          aria-label="Copy passcode"
        >
          {copiedCode ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="my-3 border-t border-dashed border-ocean/20" />
      <p className="mb-2 text-center text-[12px] text-slate-500">
        Share this code to invite your travel buddies!
      </p>
      <button
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2.5 text-[14px] font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
        aria-label="Share trip invite message"
      >
        {copiedMsg ? 'Copied!' : '✈️ Share Invite'}
      </button>
    </div>
  );
}
