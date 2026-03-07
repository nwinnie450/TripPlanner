'use client';

import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import type { ExpenseCategory } from '@/types';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 snap-start rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
          selected === null
            ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
            : 'bg-white/80 text-slate-500 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
        }`}
      >
        All
      </button>
      {EXPENSE_CATEGORIES.map((cat) => {
        const config = CATEGORY_COLORS[cat as ExpenseCategory];
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 snap-start rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
              selected === cat
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
                : 'bg-white/80 text-slate-500 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            {config?.emoji} {cat}
          </button>
        );
      })}
    </div>
  );
}
