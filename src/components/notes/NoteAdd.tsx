import type { KeyboardEvent } from 'react';
import type { BlockId } from '../../data/groups';

const LABELS: Record<BlockId, string> = {
  character: 'Персонаж',
  aspects: 'Аспекты',
  skills: 'Навыки',
  stunts: 'Трюки',
  stress: 'Стресс и последствия',
  extras: 'Дополнения',
};

type Props = {
  blockId: BlockId;
  onOpen: () => void;
};

/** Знак «оставить заметку» в правом конце плашки — только на чужом листе в группе. */
export function NoteAdd({ blockId, onOpen }: Props) {
  /* Внутри fieldset disabled кнопки отключаются, поэтому знак —
     span с ролью кнопки: заметки доступны и на чужом листе. */
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };
  return (
    <span
      role="button"
      tabIndex={0}
      className="na"
      onClick={onOpen}
      onKeyDown={onKeyDown}
      aria-label={`Оставить заметку к блоку «${LABELS[blockId]}»`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 2.6h7.1L20 9.5v11.9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.6a1 1 0 0 1 1-1Z"
          fill="currentColor"
        />
        <path d="M13.1 2.6 20 9.5h-6.9Z" fill="var(--bg-parchment)" />
        <path
          d="M8.5 13.6h7M8.5 17.1h4.6"
          fill="none"
          stroke="var(--bg-parchment)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
