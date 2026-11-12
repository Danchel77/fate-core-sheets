import React from 'react';

export const StatTable: React.FC<{ stats: { label: string; value: number | string }[] }> = ({ stats }) => (
  <div className="w-full border-collapse">
    {stats.map((s, i) => (
      <div key={i} data-kit="stat-row" className="flex items-center justify-between border-b border-line py-1.5">
        <span className="font-fantasy text-text">{s.label}</span>
        <span className="tabular-nums text-gold-light">{s.value}</span>
      </div>
    ))}
  </div>
);
