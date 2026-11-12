import React from 'react';

export const Tabs: React.FC<{ tabs: string[]; active: string; onChange: (t: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap border-b border-gold" role="tablist">
    {tabs.map((tab) => {
      const isActive = active === tab;

      return (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={isActive}
          data-kit="filter-tab"
          data-active={String(isActive)}
          onClick={() => onChange(tab)}
          className={`-mb-px rounded-none border-b-2 px-3 py-2 font-fantasy text-sm uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold sm:px-5 ${
            isActive
              ? 'border-gold bg-wine text-text'
              : 'border-transparent text-text-muted hover:bg-wine/40 hover:text-text'
          }`}
        >
          {tab}
        </button>
      );
    })}
  </div>
);
