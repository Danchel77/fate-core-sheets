import React from 'react';

export const Tabs: React.FC<{ tabs: string[]; active: string; onChange: (t: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex border-b border-gold">
    {tabs.map(t => (
      <button 
        key={t} 
        onClick={() => onChange(t)} 
        className={`px-4 py-2 ${active === t ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}
      >
        {t}
      </button>
    ))}
  </div>
);
