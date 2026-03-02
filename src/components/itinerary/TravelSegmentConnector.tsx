'use client';

import { Car, Footprints, Train, Bike } from 'lucide-react';
import type { TravelSegment, TransportMode } from '@/types';

interface TravelSegmentConnectorProps {
  segment: TravelSegment;
  onModeChange: (mode: TransportMode) => void;
}

const MODES: TransportMode[] = ['DRIVING', 'WALKING', 'TRANSIT', 'BICYCLING'];

const MODE_CONFIG: Record<
  TransportMode,
  { icon: typeof Car; label: string }
> = {
  DRIVING: { icon: Car, label: 'Drive' },
  WALKING: { icon: Footprints, label: 'Walk' },
  TRANSIT: { icon: Train, label: 'Transit' },
  BICYCLING: { icon: Bike, label: 'Bike' },
};

export default function TravelSegmentConnector({
  segment,
  onModeChange,
}: TravelSegmentConnectorProps) {
  const config = MODE_CONFIG[segment.mode];
  const Icon = config.icon;

  function cycleMode() {
    const currentIndex = MODES.indexOf(segment.mode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length];
    onModeChange(nextMode);
  }

  if (segment.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-px w-6 bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-1">
      <div className="flex items-center gap-2">
        <div className="h-px w-6 bg-slate-200" />
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
          <button
            type="button"
            onClick={cycleMode}
            className="flex items-center justify-center text-[#8B5CF6] hover:text-[#7C3AED] active:scale-95"
            title={`Switch to ${MODE_CONFIG[MODES[(MODES.indexOf(segment.mode) + 1) % MODES.length]].label}`}
          >
            <Icon size={14} />
          </button>
          <span className="text-[11px] font-medium text-slate-500">
            {segment.distance}
            {segment.status === 'ok' && segment.duration && (
              <>
                {' '}
                <span className="text-slate-300">&middot;</span>{' '}
                {segment.duration}
              </>
            )}
            {segment.status === 'error' && (
              <span className="text-slate-400"> (est.)</span>
            )}
          </span>
        </div>
        <div className="h-px w-6 bg-slate-200" />
      </div>
    </div>
  );
}
