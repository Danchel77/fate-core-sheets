import React from 'react';

interface SheetBlockProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Единая рамка для самостоятельного блока листа.
 * Общей рамки вокруг всего листа нет — каждый смысловой блок живёт отдельно.
 */
export const SheetBlock: React.FC<SheetBlockProps> = ({ children, className = '' }) => (
  <div
    className={`rounded-xl border border-[#202734] bg-[#10141C] p-4 shadow-sm sm:p-5 ${className}`}
  >
    {children}
  </div>
);
