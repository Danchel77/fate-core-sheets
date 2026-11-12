import React from 'react';
import { Character } from '../../types/character';

type NotesField = 'notes' | 'notesExtra';

interface NotesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  field?: NotesField;
}

// Линованная подложка: линии через 24px цветом токена `line`.
// Цвет приходит через currentColor (класс text-line), своих hex в стилях нет.
const RULED_BACKGROUND: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 24px)',
  backgroundSize: '100% 24px',
  backgroundPosition: '0 8px',
};

/**
 * Область заметок. На листе их две: `notes` (лента «Заметки») и
 * `notesExtra` (лента «Дополнительно»). Высота каждой — 176px (160–200).
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  character,
  onChange,
  field = 'notes',
}) => {
  return (
    <section className="flex flex-col">
      <div className="relative h-[176px] w-full">
        <div
          aria-hidden="true"
          style={RULED_BACKGROUND}
          className="pointer-events-none absolute inset-0 border border-line bg-ink-raised text-line"
        />
        <textarea
          data-kit="sheet-notes"
          rows={5}
          value={character[field] || ''}
          onChange={(event) => onChange({ ...character, [field]: event.target.value })}
          aria-label={field === 'notes' ? 'Заметки' : 'Дополнительные заметки'}
          placeholder={field === 'notes' ? 'Заметки о персонаже...' : 'Дополнительные заметки...'}
          className="relative h-full w-full resize-none overflow-y-auto bg-transparent p-2 font-sans text-sm leading-6 text-text placeholder:text-text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        />
      </div>
    </section>
  );
};
