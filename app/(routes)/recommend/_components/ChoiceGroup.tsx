import React from "react";

export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[12px] font-bold uppercase tracking-widest text-[#7e7e7e]">{label}</div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => onChange(isSelected ? null : option)}
              className={`min-h-11 rounded-[2px] border px-3 py-2 text-sm font-bold transition-colors sm:min-h-0 sm:px-4 ${
                isSelected
                  ? "border-[#e60000] bg-[#e60000] text-white"
                  : "border-stone-200 bg-white text-[#25282b] hover:border-[#e60000]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
