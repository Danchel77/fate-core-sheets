import React from 'react';
import { Check, Circle } from 'lucide-react';

interface ChecklistRowProps {
  label: string;
  done: boolean;
  optional?: boolean;
  onClick: () => void;
}

export const ChecklistRow: React.FC<ChecklistRowProps> = ({ label, done, optional, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2 py-1.5 text-left transition hover:text-slate-200"
  >
    {done ? (
      <Check className="h-3.5 w-3.5 text-emerald-400" />
    ) : (
      <Circle className="h-3.5 w-3.5 text-slate-600" />
    )}
    <span className={`text-[13px] ${done ? 'text-slate-300' : 'text-slate-400'}`}>
      {label}
    </span>
    {optional && !done && (
      <span className="ml-auto text-[11px] text-slate-500">необязательно</span>
    )}
  </button>
);
