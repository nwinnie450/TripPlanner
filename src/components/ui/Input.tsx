'use client';

import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-slate-600"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`h-12 w-full rounded-2xl border border-transparent bg-[#F8F7FA] ${icon ? 'pl-10' : 'px-4'} pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-ocean/40 focus:outline-none focus:ring-2 focus:ring-ocean/20 focus:bg-white ${error ? 'ring-2 ring-red border-red/30' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[13px] text-red">{error}</p>}
    </div>
  );
}
