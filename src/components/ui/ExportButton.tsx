'use client';

import { Download } from 'lucide-react';

interface ExportButtonProps {
  getCSV: () => { filename: string; content: string };
  className?: string;
}

export default function ExportButton({ getCSV, className }: ExportButtonProps) {
  function handleExport() {
    const { filename, content } = getCSV();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className={
        className ??
        'flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white/10'
      }
      aria-label="Export CSV"
    >
      <Download size={14} />
      Export
    </button>
  );
}
