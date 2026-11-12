import React from 'react';

// Лента-заголовок секции: тонкая светлая полоса с косыми концами.
// Полупрозрачная золотая подложка (gold/20) вместо тяжёлого бруска,
// высота ≤28px — это проверяют foundation F2/F22 и сценарий листа.
export const SectionRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    data-kit="ribbons"
    data-ribbon
    className="relative w-full bg-gold/20 py-1 text-center font-fantasy text-sm leading-tight text-gold-light [font-variant-caps:small-caps] tracking-wide [clip-path:polygon(0_50%,14px_0,calc(100%_-_14px)_0,100%_50%,calc(100%_-_14px)_100%,14px_100%)]"
  >
    {children}
  </div>
);
