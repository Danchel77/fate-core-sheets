import React from 'react';
import { Character } from '../../../types/character';

interface MobileActionBarProps {
  draft: Character;
  canSave: boolean;
  onSave: () => void;
  stuntCount: number;
  totalSkills: number;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ draft, canSave, onSave, stuntCount, totalSkills }) => (
  <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#1C212B] bg-[#0B0E14]/95 px-4 py-3 backdrop-blur lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <div className="text-[12px] text-slate-400">
        Навыки {totalSkills}/10 · Трюки {stuntCount}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className="rounded-md bg-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-900 transition hover:bg-white disabled:opacity-40"
      >
        Создать персонажа
      </button>
    </div>
  </div>
);
