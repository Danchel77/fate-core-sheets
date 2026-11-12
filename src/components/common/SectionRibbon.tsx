import React from 'react';

// Лента-заголовок секции: тёмная плашка panel с косыми концами.
// Никакой цветной подложки и золотого текста: фон #141414, текст #e8e8e8,
// снизу волосяная линия gold-dim. Высота ≤28px — это проверяют
// foundation F2/F22 и сценарий листа.
export const SectionRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    data-kit="ribbons"
    data-ribbon
    className="relative w-full border-b border-gold-dim bg-panel py-1 text-center font-fantasy text-sm leading-tight text-text [font-variant-caps:small-caps] tracking-wide [clip-path:polygon(0_50%,14px_0,calc(100%_-_14px)_0,100%_50%,calc(100%_-_14px)_100%,14px_100%)]"
  >
    {children}
  </div>
);
