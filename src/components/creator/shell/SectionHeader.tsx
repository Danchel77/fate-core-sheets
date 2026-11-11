import React from 'react';
import { HelpPopover } from './HelpPopover';

interface SectionHeaderProps {
  title: string;
  meta?: React.ReactNode;
  help?: { heading: string; intro: string; points?: string[]; example?: string };
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, meta, help, id }) => {
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        <h2 className="font-fantasy text-[22px] leading-tight text-slate-100">{title}</h2>
        {help && (
          <div className="relative mt-1">
            <button
              type="button"
              aria-expanded={helpOpen}
              aria-controls={id ? `${id}-help` : undefined}
              aria-label={`Помощь: ${title}`}
              onClick={() => setHelpOpen(!helpOpen)}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#202734] text-[11px] text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              ?
            </button>
            <HelpPopover help={help} open={helpOpen} onClose={() => setHelpOpen(false)} />
          </div>
        )}
      </div>
      {meta && <div className="text-[11px] tabular-nums text-slate-500">{meta}</div>}
    </div>
  );
};
