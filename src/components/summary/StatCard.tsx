interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  sublabel?: string;
  bgColor?: string;
  textColor?: string;
}

export default function StatCard({
  emoji,
  label,
  value,
  sublabel,
  bgColor = '#F5F3FF',
  textColor = '#7C3AED',
}: StatCardProps) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl px-3 py-4 text-center"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-2xl">{emoji}</span>
      <p
        className="mt-1 text-[20px] font-bold leading-tight"
        style={{ color: textColor }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[13px] text-slate-500">{label}</p>
      {sublabel && (
        <p className="mt-0.5 text-[11px] text-slate-400">{sublabel}</p>
      )}
    </div>
  );
}
