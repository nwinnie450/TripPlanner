import type { ExpenseCategory } from '@/types';
import { CATEGORY_COLORS } from '@/lib/constants';

interface CategoryBadgeProps {
  category: ExpenseCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {category}
    </span>
  );
}
