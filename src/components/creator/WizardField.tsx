import React from 'react';

export const WIZARD_INPUT_CLASS =
  'w-full rounded-lg border border-[#202734] bg-[#0B0E14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 transition focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/25';

export const WIZARD_TEXTAREA_CLASS = `${WIZARD_INPUT_CLASS} resize-y leading-relaxed`;

interface WizardFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export const WizardField: React.FC<WizardFieldProps> = ({ label, htmlFor, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-300">
      {label}
    </label>
    {children}
  </div>
);
