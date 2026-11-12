import React from 'react';

export const StressBox: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <div data-kit="stress" data-stress-box className={`size-7 border border-gold ${filled ? 'bg-gold' : 'bg-ink'}`} />
);
