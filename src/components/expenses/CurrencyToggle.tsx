'use client';

interface CurrencyToggleProps {
  currencies: string[];
  selected: string;
  onChange: (currency: string) => void;
}

export default function CurrencyToggle({ currencies, selected, onChange }: CurrencyToggleProps) {
  if (currencies.length <= 1) return null;

  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap gap-2">
        {currencies.map((code) => {
          const isSelected = selected === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              className={`inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
