'use client';

import { useState, type FormEvent } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useMembers } from '@/hooks/useMembers';
import { useChecklist } from '@/hooks/useChecklist';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ChecklistItemCard from '@/components/checklist/ChecklistItemCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

type Filter = 'all' | 'unpacked' | 'packed';

const FILTERS: { value: Filter; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'unpacked', label: 'Unpacked', emoji: '📦' },
  { value: 'packed', label: 'Packed', emoji: '✅' },
];

export default function ChecklistPage() {
  const { passcode, currentMember } = useTripContext();
  const { members } = useMembers(passcode);
  const { items, isLoading, error, mutate } = useChecklist(passcode);

  const [filter, setFilter] = useState<Filter>('all');
  const [text, setText] = useState('');
  const [assignee, setAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const packedCount = items.filter((i) => i.packed).length;

  const filtered = items.filter((item) => {
    if (filter === 'packed') return item.packed;
    if (filter === 'unpacked') return !item.packed;
    return true;
  });

  function getMemberName(memberId?: string) {
    if (!memberId) return undefined;
    return members.find((m) => m.memberId === memberId)?.name;
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await fetch(`/api/trip/${passcode}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          assignee: assignee || undefined,
          createdBy: currentMember?.memberId ?? '',
        }),
      });
      setText('');
      setAssignee('');
      mutate();
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load checklist." />;

  const progressPercent = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#EC4899] px-6 pb-8 pt-6">
        <span className="pointer-events-none absolute -right-2 -top-2 text-[64px] opacity-20 rotate-12 select-none">
          🧳
        </span>
        <span className="pointer-events-none absolute right-16 top-8 text-[40px] opacity-15 -rotate-6 select-none">
          👕
        </span>
        <span className="pointer-events-none absolute left-2 bottom-2 text-[48px] opacity-15 rotate-6 select-none">
          🎒
        </span>
        <span className="pointer-events-none absolute right-8 bottom-0 text-[36px] opacity-15 select-none">
          🧴
        </span>
        <Link
          href={`/trip/${passcode}`}
          className="relative z-10 mb-2 inline-flex items-center gap-0.5 text-[13px] font-medium text-white/70"
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>
        <h1 className="relative z-10 text-3xl font-extrabold text-white drop-shadow-md font-[family-name:var(--font-display)]">
          Packing List
        </h1>
        <div className="relative z-10 mt-3 rounded-[16px] bg-white/20 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-white">
              {packedCount} of {items.length} packed
            </p>
            <p className="text-[13px] font-bold text-white">{progressPercent}%</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white p-6 pb-40">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 snap-start rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                filter === f.value
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md'
                  : 'bg-white text-slate-600 shadow-sm'
              }`}
            >
              <span className="mr-1">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[48px]">🏖️</span>
            </div>
            <p className="text-[18px] font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {filter === 'packed' ? 'Nothing packed yet!' : filter === 'unpacked' ? 'All packed!' : 'Nothing to pack yet!'}
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
              {filter === 'all'
                ? 'Add items below to start your packing list'
                : filter === 'packed'
                  ? 'Check off items to see them here'
                  : 'You\'re all set for the trip!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((item) => (
              <ChecklistItemCard
                key={item.checklistItemId}
                item={item}
                memberName={getMemberName(item.assignee)}
                passcode={passcode}
                onUpdate={() => mutate()}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 border-t border-[#E4E4E7] bg-white/95 backdrop-blur-md px-4 pb-3 pt-3 shadow-lg">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add item... 🧳"
            maxLength={200}
            className="h-12 flex-1 rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="h-12 w-28 shrink-0 appearance-none rounded-[16px] bg-[#F4F4F5] px-3 text-[13px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          >
            <option value="">Anyone</option>
            {members.map((m) => (
              <option key={m.memberId} value={m.memberId}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            aria-label="Add item"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
