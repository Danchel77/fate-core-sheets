import React from 'react';
import { Flame, Brain, Lock } from 'lucide-react';
import { Character } from '../../types/character';
import { getSkillRating } from '../../utils/fateMath';

interface StressSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const StressSection: React.FC<StressSectionProps> = ({ character, onChange }) => {
  const physiqueRating = getSkillRating(character, 'physique');
  const willRating = getSkillRating(character, 'will');

  // Fate Core rules:
  // Base: 2 boxes (1, 2)
  // Rating 1-2: unlocks box 3
  // Rating 3+: unlocks box 4
  const maxPhysicalBoxes = physiqueRating >= 3 ? 4 : physiqueRating >= 1 ? 3 : 2;
  const maxMentalBoxes = willRating >= 3 ? 4 : willRating >= 1 ? 3 : 2;

  const toggleStress = (track: 'physical' | 'mental', index: number) => {
    const listKey = track === 'physical' ? 'physicalStress' : 'mentalStress';
    const currentList = [...character[listKey]];
    
    const existingIndex = currentList.findIndex(b => b.index === index);
    if (existingIndex >= 0) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        checked: !currentList[existingIndex].checked,
      };
    } else {
      currentList.push({
        index,
        value: index,
        checked: true,
      });
    }

    onChange({
      ...character,
      [listKey]: currentList,
    });
  };

  const handleConsequenceChange = (
    severity: 'mild' | 'moderate' | 'severe',
    aspectText: string
  ) => {
    onChange({
      ...character,
      consequences: {
        ...character.consequences,
        [severity]: {
          ...character.consequences[severity],
          aspect: aspectText,
        },
      },
    });
  };

  return (
    <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-xl space-y-5">
      {/* 1. Stress Tracks */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-[#1C212B] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-xs" />
            <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
              Стресс (Stress)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Сбрасывается после конфликта
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Physical Stress */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#1C212B]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400 font-fantasy flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Физ. стресс
              </span>
              <span className="text-[10px] text-slate-500">
                Сложение ({physiqueRating > 0 ? `+${physiqueRating}` : '0'})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((boxNum) => {
                const isUnlocked = boxNum <= maxPhysicalBoxes;
                const isChecked = character.physicalStress.some(b => b.index === boxNum && b.checked);

                if (!isUnlocked) {
                  return (
                    <div
                      key={boxNum}
                      className="h-10 rounded-lg border border-dashed border-[#1C212B] bg-[#0B0E14]/40 flex flex-col items-center justify-center text-slate-600 select-none cursor-not-allowed"
                      title={boxNum === 3 ? 'Требуется Сложение +1' : 'Требуется Сложение +3'}
                    >
                      <Lock className="w-3 h-3 mb-0.5 opacity-50" />
                      <span className="text-[10px] font-mono">[{boxNum}]</span>
                    </div>
                  );
                }

                return (
                  <button
                    type="button"
                    key={boxNum}
                    onClick={() => toggleStress('physical', boxNum)}
                    className={`h-10 rounded-lg border flex items-center justify-center font-mono font-bold text-sm transition cursor-pointer ${
                      isChecked
                        ? 'bg-red-950/80 border-red-600 text-red-400 line-through'
                        : 'bg-[#121721] border-[#2E3440] hover:border-red-500/50 text-slate-300 hover:text-white'
                    }`}
                    title={isChecked ? 'Отметить как свободный' : `Получить ${boxNum} физ. стресса`}
                  >
                    {boxNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mental Stress */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#1C212B]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400 font-fantasy flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Ментал. стресс
              </span>
              <span className="text-[10px] text-slate-500">
                Воля ({willRating > 0 ? `+${willRating}` : '0'})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((boxNum) => {
                const isUnlocked = boxNum <= maxMentalBoxes;
                const isChecked = character.mentalStress.some(b => b.index === boxNum && b.checked);

                if (!isUnlocked) {
                  return (
                    <div
                      key={boxNum}
                      className="h-10 rounded-lg border border-dashed border-[#1C212B] bg-[#0B0E14]/40 flex flex-col items-center justify-center text-slate-600 select-none cursor-not-allowed"
                      title={boxNum === 3 ? 'Требуется Воля +1' : 'Требуется Воля +3'}
                    >
                      <Lock className="w-3 h-3 mb-0.5 opacity-50" />
                      <span className="text-[10px] font-mono">[{boxNum}]</span>
                    </div>
                  );
                }

                return (
                  <button
                    type="button"
                    key={boxNum}
                    onClick={() => toggleStress('mental', boxNum)}
                    className={`h-10 rounded-lg border flex items-center justify-center font-mono font-bold text-sm transition cursor-pointer ${
                      isChecked
                        ? 'bg-sky-950/80 border-sky-600 text-sky-400 line-through'
                        : 'bg-[#121721] border-[#2E3440] hover:border-sky-500/50 text-slate-300 hover:text-white'
                    }`}
                    title={isChecked ? 'Отметить как свободный' : `Получить ${boxNum} ментал. стресса`}
                  >
                    {boxNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Consequences */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-[#1C212B] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-xs" />
            <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
              Последствия (Consequences)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Временные аспекты травм
          </span>
        </div>

        <div className="space-y-2">
          {/* Mild [2] */}
          <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus-within:border-slate-500 flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/50 text-emerald-400 font-mono text-xs font-bold">
                2
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Легкое
              </span>
            </div>
            <input
              type="text"
              value={character.consequences.mild.aspect}
              onChange={(e) => handleConsequenceChange('mild', e.target.value)}
              placeholder="Например, «Рассеченная бровь» или «Дрожащие руки»..."
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Moderate [4] */}
          <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus-within:border-slate-500 flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-700/50 text-amber-400 font-mono text-xs font-bold">
                4
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Среднее
              </span>
            </div>
            <input
              type="text"
              value={character.consequences.moderate.aspect}
              onChange={(e) => handleConsequenceChange('moderate', e.target.value)}
              placeholder="Например, «Глубокая колотая рана» или «Панический страх»..."
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Severe [6] */}
          <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus-within:border-slate-500 flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-700/50 text-red-400 font-mono text-xs font-bold">
                6
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Тяжелое
              </span>
            </div>
            <input
              type="text"
              value={character.consequences.severe.aspect}
              onChange={(e) => handleConsequenceChange('severe', e.target.value)}
              placeholder="Например, «Сломанные ребра» или «Сломленная гордость»..."
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Extras / Notes (Дополнения) */}
      <div>
        <div className="flex items-center justify-between mb-2 border-b border-[#1C212B] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-xs" />
            <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
              Дополнения и Заметки (Extras)
            </h2>
          </div>
        </div>
        <textarea
          rows={3}
          value={character.notes || ''}
          onChange={(e) => onChange({ ...character, notes: e.target.value })}
          placeholder="Снаряжение, серебряный меч, эликсиры, бомбы, репутация или особые свойства..."
          className="w-full p-3 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus:border-slate-500 text-xs text-slate-300 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
