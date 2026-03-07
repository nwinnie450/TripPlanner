import type { ExpenseCategory } from '@/types';
import { CATEGORY_COLORS } from '@/lib/constants';

interface CategoryBadgeProps {
  category: ExpenseCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm"
      style={{ backgroundColor: colors.bg, color: colors.text, border: `1.5px solid ${colors.text}22` }}
    >
      <span className="text-[13px]">{colors.emoji}</span> {category}
    </span>
  );
}
