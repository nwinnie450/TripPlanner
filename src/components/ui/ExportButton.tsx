'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

export interface ExportOption {
  label: string;
  filename: string;
  content: string;
  mimeType?: string;
}

interface ExportButtonProps {
  options: ExportOption[];
  className?: string;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportButton({ options, className }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (options.length === 1) {
    const opt = options[0];
    return (
      <button
        onClick={() => triggerDownload(opt.filename, opt.content, opt.mimeType ?? 'text/csv;charset=utf-8;')}
        className={className ?? 'flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/10'}
        aria-label="Export"
      >
        <Download size={14} />
        Export
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={className ?? 'flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/10'}
        aria-label="Export"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[120px] rounded-xl bg-white shadow-lg border border-slate-100 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.filename}
              onClick={() => {
                triggerDownload(opt.filename, opt.content, opt.mimeType ?? 'application/octet-stream');
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <Download size={13} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
