import React from 'react';

export const SectionRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-kit="ribbons" data-ribbon className="bg-gold text-ink font-fantasy px-4 py-2 uppercase tracking-widest">
    {children}
  </div>
);
