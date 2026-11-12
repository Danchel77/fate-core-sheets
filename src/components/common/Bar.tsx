import React from 'react';

export const Bar: React.FC<{ value: number; max: number }> = ({ value, max }) => (
  <div className="w-full h-4 bg-gray">
    <div className="h-full bg-gold" style={{ width: `${(value / max) * 100}%` }} />
  </div>
);
