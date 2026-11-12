import React from 'react';

export const StressBox: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <div data-kit="stress" data-stress-box className={`w-6 h-6 border border-gold ${filled ? 'bg-gold' : 'bg-ink'}`} />
);
