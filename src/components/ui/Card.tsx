import { type HTMLAttributes } from 'react';

type CardVariant = 'default' | 'highlighted' | 'gradient';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-900/[0.04]',
  highlighted: 'bg-ocean-light border border-ocean/10',
  gradient:
    'bg-gradient-to-br from-ocean-light via-white to-pink-light border border-ocean/10',
};

export default function Card({
  highlighted = false,
  variant,
  className = '',
  children,
  ...props
}: CardProps) {
  const resolvedVariant = variant ?? (highlighted ? 'highlighted' : 'default');

  return (
    <div
      className={`rounded-[20px] p-4 shadow-card ${variantStyles[resolvedVariant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
