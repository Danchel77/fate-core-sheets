import React from 'react';
import { SectionRibbon } from '../common/SectionRibbon';

interface SheetBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Блок листа: подложка `panel` с тонкой границей `line`, сверху вплотную
 * золотая лента-заголовок, под ней содержимое. Угловых скобок и второй рамки нет.
 */
export const SheetBlock: React.FC<SheetBlockProps> = ({ title, children, className = '' }) => (
  <section
    data-kit="sheet-block"
    className={`flex min-w-0 flex-col border border-line bg-panel ${className}`}
  >
    <SectionRibbon>{title}</SectionRibbon>
    <div className="flex flex-col gap-3 p-3">{children}</div>
  </section>
);
