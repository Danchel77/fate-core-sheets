import type { KeyboardEvent } from 'react';
import type { BlockId } from '../../data/groups';
import type { NotePeek } from './NotesContext';

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
  peek: NotePeek | null;
  onOpen: () => void;
};

/** Закладка заметок: выходит из-под верхнего края плашки блока. */
export function NoteMark({ blockId, peek, onOpen }: Props) {
  const label = LABELS[blockId];
  /* Пустой блок не носит закладку: добавлять заметку — отдельной иконкой. */
  if (!peek) return null;
  const letter = peek.author.trim().slice(0, 1).toUpperCase();
  /* Внутри fieldset disabled кнопки отключаются, поэтому закладка —
     span с ролью кнопки: заметки остаются доступны на чужом листе. */
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
      className="nm"
      onClick={onOpen}
      onKeyDown={onKeyDown}
      aria-label={`Заметки к блоку «${label}»: ${peek.count}`}
    >
      <span className="nm__clip" aria-hidden="true">
        <span className="nm__tab">
          <span className="nm__letter">{letter}</span>
          {peek.count > 1 && <b className="nm__count">{peek.count}</b>}
        </span>
      </span>
      <span className="nm__tip" role="tooltip">
        <b>Заметка · {peek.author}</b>
        <span>{peek.text}</span>
        {peek.count > 1 && <i>ещё {peek.count - 1}</i>}
      </span>
    </span>
  );
}
