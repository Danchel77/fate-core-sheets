import React from 'react';
import { Character } from '../../types/character';

interface NotesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ character, onChange }) => {
  return (
    <section className="border-t border-[#202734] pt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Дополнения и заметки
        </h2>
      </div>

      <textarea
        rows={4}
        value={character.notes || ''}
        onChange={(event) => onChange({ ...character, notes: event.target.value })}
        placeholder="Снаряжение, история, долги…"
        className="min-h-[120px] w-full resize-y rounded-lg border border-[#202734] bg-[#0B0E14]/50 p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-500 transition focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
      />
    </section>
  );
};
