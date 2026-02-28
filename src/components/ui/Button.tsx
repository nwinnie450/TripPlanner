'use client';

import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ocean text-white hover:bg-ocean-dark active:bg-ocean-dark',
  secondary:
    'border-2 border-ocean text-ocean bg-transparent hover:bg-ocean-light active:bg-ocean-light',
  ghost: 'text-ocean bg-transparent hover:bg-ocean-light active:bg-ocean-light',
  destructive: 'bg-red text-white hover:opacity-90 active:opacity-90',
};

export default function Button({
  variant = 'primary',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex h-12 min-h-[44px] w-full items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
