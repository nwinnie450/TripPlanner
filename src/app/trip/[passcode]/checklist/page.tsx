'use client';

import { useState, type FormEvent } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useMembers } from '@/hooks/useMembers';
import { useChecklist } from '@/hooks/useChecklist';
import ChecklistItemCard from '@/components/checklist/ChecklistItemCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

type Filter = 'all' | 'unpacked' | 'packed';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unpacked', label: 'Unpacked' },
  { value: 'packed', label: 'Packed' },
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

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-6">
        <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">
          Packing List
        </h1>
        <p className="text-[13px] text-white/80">
          {packedCount}/{items.length} packed
        </p>
      </div>

      <div className="flex-1 bg-white p-6 pb-40">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 snap-start rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                filter === f.value
                  ? 'bg-ocean text-white'
                  : 'bg-white text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-4 text-slate-300"
            >
              <path
                d="M38 12H10C8.895 12 8 12.895 8 14V38C8 39.105 8.895 40 10 40H38C39.105 40 40 39.105 40 38V14C40 12.895 39.105 12 38 12Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 12V8C16 7.47 16.21 6.961 16.586 6.586C16.961 6.21 17.47 6 18 6H30C30.53 6 31.039 6.21 31.414 6.586C31.789 6.961 32 7.47 32 8V12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M24 22V30M20 26H28"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[15px] font-medium text-slate-400">
              Nothing to pack yet!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E4E4E7] bg-white px-4 pb-6 pt-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add item..."
            maxLength={200}
            className="h-11 flex-1 rounded-xl bg-[#F4F4F5] px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean/30"
          />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="h-11 w-28 shrink-0 appearance-none rounded-xl bg-[#F4F4F5] px-3 text-[13px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-ocean/30"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] text-white transition-opacity disabled:opacity-50"
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
