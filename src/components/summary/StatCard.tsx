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
      className="flex flex-col items-center rounded-[20px] px-3 py-5 text-center shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-3xl mb-1 drop-shadow-sm">{emoji}</span>
      <p
        className="mt-1 text-[20px] font-extrabold leading-tight"
        style={{ color: textColor }}
      >
        {value}
      </p>
      <p className="mt-1 text-[13px] font-medium text-slate-500">{label}</p>
      {sublabel && (
        <p className="mt-0.5 text-[11px] text-slate-400">{sublabel}</p>
      )}
    </div>
  );
}
