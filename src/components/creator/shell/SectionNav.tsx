import React from 'react';

interface SectionNavProps {
  items: { id: string; label: string }[];
  activeId: string;
}

export const SectionNav: React.FC<SectionNavProps> = ({ items, activeId }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav aria-label="Разделы конструктора" className="sticky top-[64px] z-30 -mx-5 mt-5 border-b border-[#1C212B] bg-[#0B0E14] px-5 sm:-mx-6 sm:px-6">
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            aria-current={activeId === item.id ? 'true' : undefined}
            className={`whitespace-nowrap px-3 py-2.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 ${
              activeId === item.id
                ? 'border-b-2 border-slate-300 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
