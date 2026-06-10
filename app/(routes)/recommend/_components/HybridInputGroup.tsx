import React from "react";

interface HybridInputGroupProps {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  placeholder: string;
}

export function HybridInputGroup({
  label,
  value,
  options,
  onChange,
  placeholder,
}: HybridInputGroupProps) {
  return (
    <div className="space-y-4">
      <div className="text-[12px] font-bold uppercase tracking-widest text-[#7e7e7e]">
        {label}
      </div>
      
      {/* Text Input */}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : val);
        }}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-200 text-stone-750 py-3 px-4 rounded-sm outline-none focus:ring-1 focus:ring-[#e60000] focus:border-[#e60000] transition-all font-medium text-sm placeholder:text-stone-400"
      />

      {/* Suggestion Tags */}
      <div>
        <div className="text-[10px] font-bold text-[#bebebe] mb-2 uppercase tracking-wider">추천 키워드</div>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(isSelected ? null : option);
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "border-[#e60000] bg-[#e60000] text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-[#e60000] hover:text-[#e60000]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
