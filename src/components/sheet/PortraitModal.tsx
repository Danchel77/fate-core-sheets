import React, { useEffect, useRef } from 'react';
import { Image as ImageIcon, Shield, Trash2, X } from 'lucide-react';

interface PortraitModalProps {
  isOpen: boolean;
  avatar: string | null;
  characterName: string;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
}

/**
 * Портрет — это кнопка в паспорте. Никаких дополнительных иконок на листе:
 * замена и удаление живут внутри этого диалога.
 */
export const PortraitModal: React.FC<PortraitModalProps> = ({
  isOpen,
  avatar,
  characterName,
  onClose,
  onReplace,
  onRemove,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portrait-modal-title"
        className="w-full max-w-sm rounded-t-2xl border border-[#2A3444] bg-[#10141C] p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="portrait-modal-title" className="font-fantasy text-lg font-bold text-slate-100">
              Портрет
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Квадратное изображение лучше всего смотрится на листе.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-500 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto mb-4 flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-[#252D3A] bg-[#0B0E14]">
          {avatar ? (
            <img src={avatar} alt={characterName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <Shield className="h-10 w-10 stroke-[1.25]" />
              <span className="text-[10px] uppercase tracking-[0.12em]">Нет портрета</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onReplace}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#B9C9DC] px-3 py-2.5 text-xs font-semibold text-[#0B0E14] transition hover:bg-[#CAD8E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10141C]"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {avatar ? 'Заменить изображение' : 'Загрузить изображение'}
          </button>

          {avatar && (
            <button
              type="button"
              onClick={onRemove}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-400/20 px-3 py-2.5 text-xs font-medium text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить портрет
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg px-3 py-2 text-[11px] text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
