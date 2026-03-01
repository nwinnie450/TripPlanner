'use client';

interface ViewToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl bg-[#F4F4F5] p-1">
      <button
        type="button"
        onClick={() => onViewChange('list')}
        className={`rounded-[8px] px-4 py-1.5 text-[13px] transition-colors ${
          view === 'list' ? 'bg-white font-semibold text-ocean shadow' : 'text-slate-400'
        }`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => onViewChange('map')}
        className={`rounded-[8px] px-4 py-1.5 text-[13px] transition-colors ${
          view === 'map' ? 'bg-white font-semibold text-ocean shadow' : 'text-slate-400'
        }`}
      >
        Map
      </button>
    </div>
  );
}
