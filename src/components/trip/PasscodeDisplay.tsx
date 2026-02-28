'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';

interface PasscodeDisplayProps {
  passcode: string;
}

export default function PasscodeDisplay({ passcode }: PasscodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(passcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <p className="mt-1 text-[13px] text-slate-600">
            Share this with your group
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex h-10 min-w-[44px] items-center justify-center rounded-lg bg-white px-3 text-[13px] font-medium text-ocean shadow-card"
          aria-label="Copy passcode"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </Card>
  );
}
