'use client';

interface ViewToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-white/20 p-1 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onViewChange('list')}
        className={`rounded-full px-5 py-2 text-[13px] font-bold transition-all ${
          view === 'list' ? 'bg-white text-[#7C3AED] shadow-md' : 'text-white/80 hover:text-white'
        }`}
      >
        📋 List
      </button>
      <button
        type="button"
        onClick={() => onViewChange('map')}
        className={`rounded-full px-5 py-2 text-[13px] font-bold transition-all ${
          view === 'map' ? 'bg-white text-[#7C3AED] shadow-md' : 'text-white/80 hover:text-white'
        }`}
      >
        🗺️ Map
      </button>
    </div>
  );
}
