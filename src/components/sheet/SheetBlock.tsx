import React from 'react';
import { SectionRibbon } from '../common/SectionRibbon';
import { CornerFrame } from '../common/CornerFrame';

interface SheetBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Блок листа: золотая лента-заголовок и содержимое в угловых скобках.
 * Своей подложки у блока нет — фон остаётся `ink`, глубину дают только
 * тонкие разделители внутри секции.
 */
export const SheetBlock: React.FC<SheetBlockProps> = ({ title, children, className = '' }) => (
  <section data-kit="sheet-block" className={`flex min-w-0 flex-col ${className}`}>
    <SectionRibbon>{title}</SectionRibbon>
    <CornerFrame>
      <div className="flex flex-col gap-3">{children}</div>
    </CornerFrame>
  </section>
);
