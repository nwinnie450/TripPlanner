'use client';

import type { Member } from '@/types';

interface PaidByFilterProps {
  members: Member[];
  selected: string | null;
  onSelect: (memberId: string | null) => void;
}

export default function PaidByFilter({
  members,
  selected,
  onSelect,
}: PaidByFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 snap-start rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
          selected === null
            ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
            : 'bg-white/80 text-slate-500 border border-slate-200 hover:border-purple-300 hover:bg-purple-50 active:bg-purple-50'
        }`}
      >
        Anyone
      </button>
      {members.map((m) => (
        <button
          key={m.memberId}
          onClick={() => onSelect(m.memberId)}
          className={`shrink-0 snap-start rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
            selected === m.memberId
              ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
              : 'bg-white/80 text-slate-500 border border-slate-200 hover:border-purple-300 hover:bg-purple-50 active:bg-purple-50'
          }`}
        >
          🙋 {m.name}
        </button>
      ))}
    </div>
  );
}
