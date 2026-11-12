import React, { useEffect, useRef, useState } from 'react';
import { SETTING_PRESETS } from '../../config/presets';
import { SettingType } from '../../types/character';

interface SettingEmblemProps {
  setting: SettingType;
  onSelect: (setting: SettingType) => void;
  /**
   * `inline` — строка-подпись (старый вид); `hero` — крупный знак системы
   * в правом верхнем углу блока «Навыки», высотой 64–88px.
   */
  variant?: 'inline' | 'hero';
}

/**
 * Логотип показываем маской, залитой золотом: файлы в `public/` белые или
 * чёрные, а маска берёт только форму, поэтому цвет приходит из токенов.
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
 * Знак сеттинга — единственный способ сменить сеттинг на листе.
 * В крупном варианте это вертикальный блок 140×72 в правом верхнем углу
 * блока «Навыки»: знак системы и надпись «Witcher» / «Fate Core».
 * Нажатие открывает панель вариантов; <select> не используется.
 */
export const SettingEmblem: React.FC<SettingEmblemProps> = ({
  setting,
  onSelect,
  variant = 'inline',
}) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isWitcher = setting === 'witcher';
  const currentName = SETTING_PRESETS[setting].name;
  const isHero = variant === 'hero';

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
    <div
      ref={rootRef}
      className={
        isHero
          ? 'absolute right-3 top-[56px] z-20 flex w-[140px] flex-col items-stretch'
          : 'relative flex w-full flex-col items-center'
      }
    >
      <button
        type="button"
        data-kit="setting-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Сеттинг: ${currentName}. Сменить сеттинг`}
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          isHero
            ? 'group flex h-[68px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 text-gold-dim lg:h-[72px] transition-colors duration-150 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light'
            : 'group inline-flex cursor-pointer items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light'
        }
      >
        <span
          role="img"
          aria-label={isWitcher ? 'Ведьмак' : 'Fate Core System'}
          className={`block shrink-0 bg-gold-dim ${
            isHero ? 'h-9 w-9' : isWitcher ? 'size-5' : 'h-5 w-16'
          }`}
          style={logoMask(`${baseUrl}${isWitcher ? 'wolf-head.svg' : 'fate-core-logo.svg'}`)}
        />

        <span
          data-kit="setting-wordmark"
          className={`whitespace-nowrap font-fantasy leading-none tracking-wide [font-variant-caps:small-caps] ${
            isHero ? 'text-sm text-gold-light' : 'text-sm text-gold'
          }`}
        >
          {isWitcher ? (isHero ? 'Witcher' : 'The Witcher') : 'Fate Core'}
        </span>
      </button>

      {isOpen && (
        <div
          data-kit="setting-panel"
          role="listbox"
          aria-label="Сеттинг персонажа"
          className={`absolute top-full z-30 mt-2 border border-line bg-panel p-1 ${
            isHero ? 'right-0 w-[220px]' : 'w-full'
          }`}
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
