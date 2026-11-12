import React from 'react';

export const Bar: React.FC<{ value: number; max: number }> = ({ value, max }) => (
  <div data-kit="bar" className="w-full h-1 bg-ink border border-gold-dim">
    <div data-kit="bar-fill" className="h-full bg-gold-light" style={{ width: `${(value / max) * 100}%` }} />
  </div>
);
