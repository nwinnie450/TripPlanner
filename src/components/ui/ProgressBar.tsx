interface ProgressBarProps {
  value: number;
  max: number;
}

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand-dark">
      <div
        className="h-full rounded-full bg-ocean transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
