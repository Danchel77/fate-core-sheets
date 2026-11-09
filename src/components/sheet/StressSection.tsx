import React from 'react';
import { Flame, Zap, ShieldAlert, HeartPulse, CheckSquare, Square } from 'lucide-react';
import { Character } from '../../types/character';
import { StressBox } from '../../types/fate';

interface StressSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const StressSection: React.FC<StressSectionProps> = ({ character, onChange }) => {
  const togglePhysicalStress = (boxIndex: number) => {
    const updated = character.physicalStress.map(b => 
      b.index === boxIndex ? { ...b, checked: !b.checked } : b
    );
    onChange({
      ...character,
      physicalStress: updated,
    });
  };

  const toggleMentalStress = (boxIndex: number) => {
    const updated = character.mentalStress.map(b => 
      b.index === boxIndex ? { ...b, checked: !b.checked } : b
    );
    onChange({
      ...character,
      mentalStress: updated,
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
    <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="font-fantasy font-bold text-lg text-amber-400 tracking-wide flex items-center gap-2">
          Стресс и Последствия
        </h2>
        <p className="text-xs text-slate-400">
          Стресс сбрасывается в конце конфликта. Последствия — это временные аспекты ранений.
        </p>
      </div>

      {/* Stress Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Stress */}
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-red-950/60 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="font-fantasy font-bold text-xs text-slate-200">
                  Физический стресс
                </span>
                <span className="text-[10px] text-slate-500 block">Зависит от «Сложения»</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            {character.physicalStress.map((box) => (
              <button
                type="button"
                key={box.index}
                onClick={() => togglePhysicalStress(box.index)}
                className={`flex-1 h-12 rounded-xl border flex flex-col items-center justify-center transition group ${
                  box.checked
                    ? 'bg-red-950/90 border-red-600 text-red-400 shadow-lg shadow-red-950/50'
                    : 'bg-[#161B22] border-slate-700/80 hover:border-red-500/50 text-slate-300'
                }`}
              >
                <span className={`text-base font-bold font-fantasy ${box.checked ? 'line-through text-red-400' : ''}`}>
                  [{box.value}]
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 group-hover:text-red-400">
                  {box.checked ? 'Занято' : 'Свободно'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mental Stress */}
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-sky-950/60 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-fantasy font-bold text-xs text-slate-200">
                  Ментальный стресс
                </span>
                <span className="text-[10px] text-slate-500 block">Зависит от «Воли»</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            {character.mentalStress.map((box) => (
              <button
                type="button"
                key={box.index}
                onClick={() => toggleMentalStress(box.index)}
                className={`flex-1 h-12 rounded-xl border flex flex-col items-center justify-center transition group ${
                  box.checked
                    ? 'bg-sky-950/90 border-sky-500 text-sky-300 shadow-lg shadow-sky-950/50'
                    : 'bg-[#161B22] border-slate-700/80 hover:border-sky-500/50 text-slate-300'
                }`}
              >
                <span className={`text-base font-bold font-fantasy ${box.checked ? 'line-through text-sky-400' : ''}`}>
                  [{box.value}]
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 group-hover:text-sky-400">
                  {box.checked ? 'Занято' : 'Свободно'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Consequences Section */}
      <div className="space-y-3 pt-2">
        <h3 className="font-fantasy font-bold text-xs text-slate-300 tracking-wider uppercase">
          Последствия (Consequences)
        </h3>

        {/* Mild -2 */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 focus-within:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-300 font-fantasy">
              Легкое последствие (-2)
            </span>
            <span className="text-[10px] text-slate-500">
              Поглощает 2 урона. Проходит после сцены отдыха.
            </span>
          </div>
          <input
            type="text"
            value={character.consequences.mild.aspect}
            onChange={(e) => handleConsequenceChange('mild', e.target.value)}
            placeholder="например, «Рассеченная бровь» или «Звенящая голова»"
            className="w-full bg-transparent text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Moderate -4 */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 focus-within:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-amber-400 font-fantasy">
              Среднее последствие (-4)
            </span>
            <span className="text-[10px] text-slate-500">
              Поглощает 4 урона. Проходит после целой игровой сессии.
            </span>
          </div>
          <input
            type="text"
            value={character.consequences.moderate.aspect}
            onChange={(e) => handleConsequenceChange('moderate', e.target.value)}
            placeholder="например, «Сломанные ребра» или «Панический страх серебра»"
            className="w-full bg-transparent text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Severe -6 */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 focus-within:border-red-500/50 transition">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-red-400 font-fantasy">
              Тяжелое последствие (-6)
            </span>
            <span className="text-[10px] text-slate-500">
              Поглощает 6 урона. Требует целого сценария на излечение.
            </span>
          </div>
          <input
            type="text"
            value={character.consequences.severe.aspect}
            onChange={(e) => handleConsequenceChange('severe', e.target.value)}
            placeholder="например, «Разорванное плечо» или «Подорванная вера в себя»"
            className="w-full bg-transparent text-xs text-red-200 placeholder-slate-600 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
