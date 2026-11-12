import React from 'react';
import { SectionRibbon } from '../common/SectionRibbon';

interface SheetBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Блок листа по DESIGN.md §3: заливки и рамки нет. Блок отделяется от соседей
 * лентой-заголовком и воздухом `gap`, а не подложкой.
 * `border-none` нужен явно: preflight Tailwind ставит всем `border-style: solid`,
 * и без класса вычисленный `borderStyle` не будет `none`.
 */
export const SheetBlock: React.FC<SheetBlockProps> = ({ title, children, className = '' }) => (
  <section data-kit="sheet-block" className={`flex min-w-0 flex-col border-none ${className}`}>
    <SectionRibbon>{title}</SectionRibbon>
    <div className="flex min-w-0 flex-col gap-2 pt-2">{children}</div>
  </section>
);
