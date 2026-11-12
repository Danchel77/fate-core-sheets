import React, { useEffect, useRef, useState } from 'react';
import { SETTING_PRESETS } from '../../config/presets';
import { SettingType } from '../../types/character';

interface SettingEmblemProps {
  setting: SettingType;
  onSelect: (setting: SettingType) => void;
}

/**
 * Логотип показываем маской, залитой золотом: файлы в `public/` белые или
 * чёрные, а маска берёт только форму, поэтому цвет приходит из токена `gold`.
 * Своих hex здесь нет.
 */
const logoMask = (url: string): React.CSSProperties => ({
  maskImage: `url("${url}")`,
  WebkitMaskImage: `url("${url}")`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
});

const SETTING_ORDER: SettingType[] = ['witcher', 'universal'];

/**
 * Знак сеттинга над портретом — и единственный способ сменить сеттинг на листе.
 * Нажатие открывает панель вариантов; текст держим приглушённым золотом,
 * чтобы эмблема не спорила с лентами-заголовками.
 */
export const SettingEmblem: React.FC<SettingEmblemProps> = ({ setting, onSelect }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isWitcher = setting === 'witcher';
  const currentName = SETTING_PRESETS[setting].name;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative flex w-full flex-col items-center">
      <button
        type="button"
        data-kit="setting-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Сеттинг: ${currentName}. Сменить сеттинг`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex cursor-pointer flex-col items-center gap-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gold-dim" aria-hidden="true" />
          <span
            role="img"
            aria-label={isWitcher ? 'Ведьмак' : 'Fate Core System'}
            className={`block shrink-0 bg-gold ${isWitcher ? 'size-10' : 'h-8 w-24'}`}
            style={logoMask(`${baseUrl}${isWitcher ? 'wolf-head.svg' : 'fate-core-logo.svg'}`)}
          />
          <span className="h-px w-10 bg-gold-dim" aria-hidden="true" />
        </span>

        <span className="select-none text-center leading-none">
          <span className="block font-fantasy text-xs uppercase tracking-[0.4em] text-gold-light">
            {isWitcher ? 'The' : 'Fate'}
          </span>
          <span className="mt-1 block font-fantasy text-sm uppercase tracking-[0.18em] text-gold-light">
            {isWitcher ? 'Witcher' : 'Core'}
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          data-kit="setting-panel"
          role="listbox"
          aria-label="Сеттинг персонажа"
          className="absolute top-full z-20 mt-2 w-full border border-line bg-panel p-1"
        >
          {SETTING_ORDER.map((key) => {
            const isActive = key === setting;
            return (
              <button
                key={key}
                type="button"
                role="option"
                data-kit="setting-option"
                data-active={isActive}
                aria-selected={isActive}
                onClick={() => {
                  onSelect(key);
                  setIsOpen(false);
                }}
                className={`block w-full cursor-pointer px-3 py-2 text-left font-sans text-xs leading-snug transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light ${
                  isActive ? 'text-gold-light' : 'text-text hover:bg-wine'
                }`}
              >
                {SETTING_PRESETS[key].name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
