import React from 'react';
import { Character } from '../../types/character';

type NotesField = 'notes' | 'notesExtra';

interface NotesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  field?: NotesField;
}

/**
 * Область заметок. На листе их две: первая — поле notes (лента «Заметки»),
 * вторая — notesExtra (лента «Дополнительно»).
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  character,
  onChange,
  field = 'notes',
}) => {
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <textarea
        data-kit="sheet-notes"
        rows={5}
        value={character[field] || ''}
        onChange={(event) => onChange({ ...character, [field]: event.target.value })}
        placeholder={field === 'notes' ? 'Заметки о персонаже...' : 'Дополнительные заметки...'}
        className="min-h-[160px] w-full flex-1 resize-y border border-line bg-ink-raised p-2 font-sans text-sm leading-relaxed text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus-visible:border-gold"
      />
    </section>
  );
};
