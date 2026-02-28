'use client';

import { EXPENSE_CATEGORIES } from '@/lib/constants';

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
        className={`shrink-0 snap-start rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
          selected === null
            ? 'bg-ocean text-white'
            : 'bg-white text-slate-600'
        }`}
      >
        All
      </button>
      {EXPENSE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 snap-start rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
            selected === cat
              ? 'bg-ocean text-white'
              : 'bg-white text-slate-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
