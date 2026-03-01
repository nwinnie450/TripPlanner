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
    <Card highlighted>
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Passcode
          </p>
          <p className="font-mono text-2xl font-bold tracking-[0.3em] text-ocean">
            {passcode}
          </p>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex h-10 min-w-[44px] items-center justify-center rounded-lg bg-white px-3 text-[13px] font-medium text-ocean shadow-card"
          aria-label="Copy passcode"
        >
          {copiedCode ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <button
        onClick={handleShare}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ocean px-4 py-2.5 text-[14px] font-medium text-white"
        aria-label="Share trip invite message"
      >
        {copiedMsg ? 'Copied!' : 'Share'}
      </button>
    </Card>
  );
}
