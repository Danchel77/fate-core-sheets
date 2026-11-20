import type { ReactNode } from 'react';
import type { BlockId } from '../data/groups';
import { NoteAdd } from './notes/NoteAdd';
import { NoteMark } from './notes/NoteMark';
import { useNotes } from './notes/NotesContext';

const BASE = import.meta.env.BASE_URL;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;

const BLOCK_BY_TITLE: Record<string, BlockId> = {
  Персонаж: 'character',
  Аспекты: 'aspects',
  Навыки: 'skills',
  Трюки: 'stunts',
  'Стресс и последствия': 'stress',
  Дополнения: 'extras',
};

type Props = {
  title: string;
  /** Небольшая группа справа в плашке (меню ступеней). */
  aside?: ReactNode;
};

/** Заголовок блока листа: плашка с текстурой и ромбами на концах. */
export function BlockHeader({ title, aside }: Props) {
  const notes = useNotes();
  const blockId = BLOCK_BY_TITLE[title];
  return (
    <div className="bh">
      <span
        className="bh__texture"
        aria-hidden="true"
        style={{ backgroundImage: `url(${TEXTURE})` }}
      />
      <i className="bh__lozenge bh__lozenge--l" aria-hidden="true" />
      <i className="bh__lozenge bh__lozenge--r" aria-hidden="true" />
      <span className="bh__title">{title}</span>
      {aside && <span className="bh__aside">{aside}</span>}
      {notes && blockId && (
        <>
          <NoteMark
            blockId={blockId}
            peek={notes.peek(blockId)}
            onOpen={() => notes.open(blockId)}
          />
          <NoteAdd blockId={blockId} onOpen={() => notes.open(blockId)} />
        </>
      )}
    </div>
  );
}
