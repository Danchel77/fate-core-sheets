import React from 'react';
import { Character } from '../../types/character';

interface NotesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ character, onChange }) => {
  return (
    <section className="border-t border-[#1C212B] pt-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Дополнения и заметки
        </h2>
      </div>

      <textarea
        rows={4}
        value={character.notes || ''}
        onChange={(e) => onChange({ ...character, notes: e.target.value })}
        placeholder="Снаряжение, история, долги — что важно не забыть"
        className="w-full resize-y rounded-lg border border-[#202734] bg-[#0B0E14]/50 p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-600 transition focus:border-slate-600 focus:outline-none"
      />
    </section>
  );
};
