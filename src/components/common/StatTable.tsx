import React from 'react';

export const StatTable: React.FC<{ stats: { label: string; value: number | string }[] }> = ({ stats }) => (
  <div className="w-full border-collapse">
    {stats.map((s, i) => (
      <div key={i} className="flex justify-between border-b border-gray py-2">
        <span className="text-sm">{s.label}</span>
        <span className="font-bold">{s.value}</span>
      </div>
    ))}
  </div>
);
