import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectorProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
  disabled?: boolean;
  getLabel?: (option: T) => string;
  icon?: React.ReactNode;
}

export const Selector = <T extends string>({ 
  label, 
  value, 
  options, 
  onChange, 
  disabled,
  getLabel,
  icon
}: SelectorProps<T>) => {
  const selectId = useId();

  return (
    <div className="flex flex-col space-y-2.5">
      <label 
        htmlFor={selectId} 
        className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"
      >
        {icon}
        {label}
      </label>
      <div className="relative group">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          disabled={disabled}
          className="w-full appearance-none rounded-2xl border-0 bg-gray-50 px-4 py-3.5 pr-12 text-sm font-semibold text-gray-900 shadow-inner ring-1 ring-gray-200 transition-all hover:bg-gray-100 hover:ring-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:ring-gray-100 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700/80 dark:hover:ring-gray-600 dark:focus:bg-gray-800 dark:focus:ring-indigo-500/50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white py-2">
              {getLabel ? getLabel(opt) : opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition-colors group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};