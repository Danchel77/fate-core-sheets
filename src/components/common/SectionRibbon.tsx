import React from 'react';

export const SectionRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    data-kit="ribbons"
    data-ribbon
    className="bg-gold py-2 text-center font-fantasy text-xl text-ink uppercase tracking-widest [clip-path:polygon(0_50%,14px_0,calc(100%_-_14px)_0,100%_50%,calc(100%_-_14px)_100%,14px_100%)]"
  >
    {children}
  </div>
);
