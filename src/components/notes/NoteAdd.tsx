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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 14h6" />
      </svg>
    </span>
  );
}
