import React from 'react';
import { SettingType } from '../../types/character';

interface SettingEmblemProps {
  setting: SettingType;
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

/**
 * Знак сеттинга на листе: приглушённая линия, словесный знак и голова волка.
 * Держим его мелким и золотым, чтобы он не спорил с лентой-заголовком.
 */
export const SettingEmblem: React.FC<SettingEmblemProps> = ({ setting }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const isWitcher = setting === 'witcher';

  return (
    <div className="flex w-full items-center justify-end gap-3">
      <span className="h-px flex-1 bg-gold-dim" aria-hidden="true" />

      <span className="select-none text-right leading-none">
        <span className="block font-fantasy text-xs uppercase tracking-[0.4em] text-gold">
          {isWitcher ? 'The' : 'Fate'}
        </span>
        <span className="mt-1 block font-fantasy text-sm uppercase tracking-[0.18em] text-gold">
          {isWitcher ? 'Witcher' : 'Core'}
        </span>
      </span>

      <span className="h-8 w-px shrink-0 bg-gold-dim" aria-hidden="true" />

      <span
        role="img"
        aria-label={isWitcher ? 'Ведьмак' : 'Fate Core System'}
        className={`block shrink-0 bg-gold ${isWitcher ? 'size-12' : 'h-10 w-28'}`}
        style={logoMask(`${baseUrl}${isWitcher ? 'wolf-head.svg' : 'fate-core-logo.svg'}`)}
      />
    </div>
  );
};
