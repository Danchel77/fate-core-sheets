import React from 'react';
import { SettingType } from '../../types/character';

interface SettingEmblemProps {
  setting: SettingType;
}

/**
 * Фирменный знак сеттинга для блока очков судьбы.
 * «Ведьмак» — словесный логотип Cinzel + голова волка;
 * универсальный — официальный логотип Fate Core System.
 */
export const SettingEmblem: React.FC<SettingEmblemProps> = ({ setting }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  if (setting === 'witcher') {
    return (
      <div className="flex w-full items-center justify-end gap-3 sm:gap-4">
        {/* Тонкая линия расширяет логотипную зону и связывает её с контентом слева. */}
        <span
          className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-[#2A3444] sm:block"
          aria-hidden="true"
        />

        <span className="hidden select-none text-right sm:block">
          <span className="block font-fantasy text-[8px] font-semibold uppercase tracking-[0.45em] text-slate-500">
            The
          </span>
          <span className="-mt-0.5 block font-fantasy text-[15px] font-bold uppercase tracking-[0.18em] text-slate-200 lg:text-base">
            Witcher
          </span>
        </span>

        <span className="hidden h-11 w-px shrink-0 bg-[#202734] sm:block" aria-hidden="true" />

        <img
          src={`${baseUrl}wolf-head.svg`}
          alt="Ведьмак"
          className="h-14 w-auto max-w-[110px] object-contain opacity-95 sm:h-16 lg:h-20"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-end gap-3 sm:gap-4">
      {/* Та же линия, что и у «Ведьмака»: логотипная зона не выглядит пустой. */}
      <span
        className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-[#2A3444] sm:block"
        aria-hidden="true"
      />

      <img
        src={`${baseUrl}fate-core-logo.svg`}
        alt="Fate Core System"
        className="h-11 w-auto max-w-[170px] object-contain invert sm:h-14 lg:h-16"
      />
    </div>
  );
};
