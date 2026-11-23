import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { settingConfig } from '../data/settings';
import { SKILL_HINTS } from '../data/skills';
import type { SettingId } from '../data/types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { IconClose } from './icons';

type Props = {
  rank: number;
  setting: SettingId;
  skills: string[];
  /** Строка под заголовком: на листе — стоимость в очках. */
  note?: string;
  /** Заголовок окна. По умолчанию — «Навык на +N». */
  title?: string;
  onPick: (name: string) => void;
  onClose: () => void;
};

/** Окно выбора навыка: одно и то же в конструкторе и на листе персонажа. */
export function SkillPicker({ rank, setting, skills, note, title, onPick, onClose }: Props) {
  const settingHints = settingConfig(setting).skillHints;
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock();
  useDialogKeys({ panel: panelRef, onClose, capture: true });

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  return createPortal(
    <div
      className="spick-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="spick" role="dialog" aria-modal="true" aria-labelledby="spick-title">
        <div className="spick__head">
          <span className="spick__title" id="spick-title">
            {title ?? `Навык на +${rank}`}
          </span>
          <button
            ref={closeRef}
            type="button"
            className="spick__close"
            aria-label="Закрыть список навыков"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>

        <div className="spick__body">
          {note && <p className="spick__note">{note}</p>}
          {skills.length === 0 ? (
            <p className="spick__empty">Все навыки уже стоят в пирамиде.</p>
          ) : (
            <div className="spick__list">
              {skills.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="spick__item"
                  onClick={() => onPick(name)}
                >
                  <span className="spick__name">{name}</span>
                  {(() => {
                    const description = settingHints?.[name] ?? SKILL_HINTS[name];
                    return description ? <span className="spick__desc">{description}</span> : null;
                  })()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
