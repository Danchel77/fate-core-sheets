import React from 'react';

interface ReviewBlockProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

export const ReviewBlock = ({ title, onEdit, children }: ReviewBlockProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </h3>
      <button
        onClick={onEdit}
        className="text-[10px] text-slate-500 hover:text-slate-200 focus:outline-none"
      >
        Изменить
      </button>
    </div>
    {children}
  </div>
);
