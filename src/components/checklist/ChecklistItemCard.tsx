'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/types';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  memberName?: string;
  passcode: string;
  onUpdate: () => void;
}

export default function ChecklistItemCard({
  item,
  memberName,
  passcode,
  onUpdate,
}: ChecklistItemCardProps) {
  const [loading, setLoading] = useState(false);

  async function togglePacked() {
    setLoading(true);
    try {
      await fetch(
        `/api/trip/${passcode}/checklist/${item.checklistItemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packed: !item.packed }),
        },
      );
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(
        `/api/trip/${passcode}/checklist/${item.checklistItemId}`,
        { method: 'DELETE' },
      );
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E4E4E7] p-3.5 transition-colors">
      <button
        type="button"
        onClick={togglePacked}
        disabled={loading}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          item.packed
            ? 'border-teal-500 bg-teal-500'
            : 'border-slate-300 bg-white'
        }`}
        aria-label={item.packed ? 'Mark as unpacked' : 'Mark as packed'}
      >
        {item.packed && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-white"
          >
            <path
              d="M3 7L6 10L11 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[15px] font-medium ${
            item.packed ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {item.text}
        </p>
        {memberName && (
          <span className="mt-0.5 inline-block rounded-full bg-[#F4F4F5] px-2 py-0.5 text-[12px] font-medium text-slate-500">
            {memberName}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red/10 hover:text-red"
        aria-label="Delete item"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M2 4H14M5.333 4V2.667C5.333 2.313 5.474 1.973 5.724 1.724C5.974 1.474 6.313 1.333 6.667 1.333H9.333C9.687 1.333 10.027 1.474 10.276 1.724C10.526 1.973 10.667 2.313 10.667 2.667V4M6.667 7.333V11.333M9.333 7.333V11.333M3.333 4L4 13.333C4 13.687 4.14 14.027 4.39 14.276C4.64 14.526 4.98 14.667 5.333 14.667H10.667C11.02 14.667 11.36 14.526 11.61 14.276C11.86 14.027 12 13.687 12 13.333L12.667 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
