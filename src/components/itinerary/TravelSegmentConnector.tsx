'use client';

import { Car, Footprints, Train, Bike, Plane } from 'lucide-react';
import type { TravelSegment, TransportMode } from '@/types';

interface TravelSegmentConnectorProps {
  segment: TravelSegment;
  onModeChange: (mode: TransportMode) => void;
}

const MODES: TransportMode[] = ['DRIVING', 'WALKING', 'TRANSIT', 'BICYCLING', 'FLIGHT'];

const MODE_CONFIG: Record<TransportMode, { icon: typeof Car; label: string; emoji: string }> = {
  DRIVING: { icon: Car, label: 'Drive', emoji: '🚗' },
  WALKING: { icon: Footprints, label: 'Walk', emoji: '🚶' },
  TRANSIT: { icon: Train, label: 'Transit', emoji: '🚌' },
  BICYCLING: { icon: Bike, label: 'Bike', emoji: '🚲' },
  FLIGHT: { icon: Plane, label: 'Fly', emoji: '✈️' },
};

export default function TravelSegmentConnector({
  segment,
  onModeChange,
}: TravelSegmentConnectorProps) {
  const config = MODE_CONFIG[segment.mode];

  function cycleMode() {
    const currentIndex = MODES.indexOf(segment.mode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length];
    onModeChange(nextMode);
  }

  if (segment.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2">
          <div className="h-px w-4 border-t border-dashed border-slate-300" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-violet-50" />
          <div className="h-px w-4 border-t border-dashed border-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex items-center gap-1.5">
        {/* Dotted line leading in */}
        <div className="flex items-center gap-[3px]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/50" />
        </div>

        {/* Mode badge */}
        <button
          type="button"
          onClick={cycleMode}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 shadow-sm transition-all hover:bg-violet-100 hover:shadow active:scale-95"
          title={`Switch to ${MODE_CONFIG[MODES[(MODES.indexOf(segment.mode) + 1) % MODES.length]].label}`}
        >
          <span className="text-[16px]">{config.emoji}</span>
          <span className="text-[11px] font-semibold text-[#7C3AED]">
            {segment.distance}
            {segment.status === 'ok' && segment.duration && (
              <>
                {' '}
                <span className="text-[#8B5CF6]/60">|</span> {segment.duration}
              </>
            )}
            {segment.status === 'error' && <span className="text-slate-400"> (est.)</span>}
          </span>
        </button>

        {/* Dotted line leading out */}
        <div className="flex items-center gap-[3px]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/30" />
        </div>
      </div>
    </div>
  );
}
