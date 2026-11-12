import React from 'react';
import { Character } from '../../types/character';

type NotesField = 'notes' | 'notesExtra';

interface NotesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  field?: NotesField;
}

/**
 * Область заметок. На листе их две, обе подписаны «Заметки»:
 * первая — поле notes, вторая — notesExtra.
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
  character,
  onChange,
  field = 'notes',
}) => {
  return (
    <section className="flex h-full flex-col">
      <textarea
        rows={5}
        value={character[field] || ''}
        onChange={(event) => onChange({ ...character, [field]: event.target.value })}
        className="min-h-[140px] w-full flex-1 resize-y rounded-lg border border-[#202734] bg-[#0B0E14]/50 p-3 text-xs leading-relaxed text-slate-200 transition focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
      />
    </section>
  );
};
