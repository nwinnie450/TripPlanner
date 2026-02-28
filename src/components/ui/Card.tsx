import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

export default function Card({
  highlighted = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[14px] p-4 shadow-card ${
        highlighted ? 'bg-ocean-light' : 'bg-white'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
