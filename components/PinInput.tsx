
import React from 'react';

interface PinInputProps {
  options: number[];
  selectedValue: number | null;
  onSelect: (val: number) => void;
  disabled: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ options, selectedValue, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className={`
            w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-300 font-bold text-lg md:text-xl
            ${selectedValue === opt 
              ? 'bg-emerald-500 text-slate-900 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105' 
              : 'bg-slate-900/50 text-emerald-500 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-slate-800/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default PinInput;
