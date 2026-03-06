'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  getShareData: () => { title: string; text: string };
  className?: string;
}

export default function ShareButton({ getShareData, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const { title, text } = getShareData();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className={
        className ??
        'flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/10'
      }
      aria-label="Share"
    >
      <Share2 size={14} />
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
