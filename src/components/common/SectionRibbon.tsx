import React from 'react';

// Лента-заголовок секции: компактная золотая плашка с вырезами по бокам.
// Высота держится в пределах 34px — это проверяет сценарий foundation (F22).
export const SectionRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    data-kit="ribbons"
    data-ribbon
    className="relative w-full bg-gold py-1 text-center font-fantasy text-base leading-tight text-ink [font-variant-caps:small-caps] tracking-wide [clip-path:polygon(0_50%,14px_0,calc(100%_-_14px)_0,100%_50%,calc(100%_-_14px)_100%,14px_100%)]"
  >
    {children}
  </div>
);
