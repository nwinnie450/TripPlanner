'use client';

import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
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
      <input
        id={inputId}
        className={`h-12 w-full rounded-[10px] border border-sand-dark bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean ${error ? 'border-red' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[13px] text-red">{error}</p>}
    </div>
  );
}
