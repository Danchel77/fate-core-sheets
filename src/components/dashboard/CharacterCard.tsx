import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Trash2, Edit3, Shield, Flame, Zap, Award } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const settingInfo = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;
  const isWitcher = character.setting === 'witcher';

  return (
    <div 
      onClick={onSelect}
      className="group relative bg-[#161B22] hover:bg-[#1C222B] border border-[#2E3440] hover:border-amber-500/60 rounded-xl p-4 transition duration-200 cursor-pointer shadow-lg hover:shadow-amber-950/20 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-4 mb-3">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#0B0E14] border border-[#2E3440] group-hover:border-amber-500/40 shrink-0 flex items-center justify-center">
            {character.avatar ? (
              <img 
                src={character.avatar} 
                alt={character.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-amber-500/70 transition">
                <Shield className="w-8 h-8 stroke-[1.5]" />
                <span className="text-[9px] uppercase tracking-wider mt-1 font-fantasy">Fate</span>
              </div>
            )}
            
            {/* Setting badge overlay */}
            <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[9px] font-semibold tracking-wider uppercase backdrop-blur-md ${
              isWitcher 
                ? 'bg-amber-950/80 text-amber-300 border-t border-amber-600/30' 
                : 'bg-indigo-950/80 text-indigo-300 border-t border-indigo-600/30'
            }`}>
              {isWitcher ? 'Ведьмак' : 'Fate Core'}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-fantasy font-bold text-base text-slate-100 group-hover:text-amber-300 truncate transition">
              {character.name || 'Безымянный персонаж'}
            </h3>
            
            <p className="text-xs text-amber-500/90 italic truncate mt-0.5 font-serif">
              {character.aspects.high_concept || 'Концепция не задана'}
            </p>

            <p className="text-[11px] text-slate-400 truncate mt-1">
              {character.aspects.trouble ? `Проблема: ${character.aspects.trouble}` : 'Проблема не задана'}
            </p>

            {/* Quick stats: Refresh & Fate points */}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B0E14] border border-slate-800 text-[11px] text-amber-400 font-medium">
                <Award className="w-3 h-3" />
                Освежение: {character.refresh}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B0E14] border border-slate-800 text-[11px] text-slate-300 font-medium">
                Жетоны: {character.currentFatePoints}
              </span>
            </div>
          </div>
        </div>

        {/* Stress Tracks preview */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
          {/* Physical Stress */}
          <div className="bg-[#0B0E14]/60 rounded-md p-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                Физ. стресс
              </span>
              <span className="text-[10px] text-slate-500">{character.physicalStress.length} яч.</span>
            </div>
            <div className="flex gap-1">
              {character.physicalStress.map((box) => (
                <div 
                  key={box.index}
                  className={`flex-1 h-5 rounded flex items-center justify-center font-bold text-[10px] border transition ${
                    box.checked 
                      ? 'bg-red-950/80 border-red-600 text-red-400 line-through' 
                      : 'bg-[#161B22] border-slate-700 text-slate-300'
                  }`}
                >
                  {box.value}
                </div>
              ))}
            </div>
          </div>

          {/* Mental Stress */}
          <div className="bg-[#0B0E14]/60 rounded-md p-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" />
                Мент. стресс
              </span>
              <span className="text-[10px] text-slate-500">{character.mentalStress.length} яч.</span>
            </div>
            <div className="flex gap-1">
              {character.mentalStress.map((box) => (
                <div 
                  key={box.index}
                  className={`flex-1 h-5 rounded flex items-center justify-center font-bold text-[10px] border transition ${
                    box.checked 
                      ? 'bg-sky-950/80 border-sky-600 text-sky-400 line-through' 
                      : 'bg-[#161B22] border-slate-700 text-slate-300'
                  }`}
                >
                  {box.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kebab Menu */}
      <div 
        ref={menuRef}
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Действия"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-[#161B22] border border-[#2E3440] rounded-lg shadow-2xl py-1 z-30">
            <button
              onClick={() => {
                setMenuOpen(false);
                onSelect();
              }}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Открыть лист
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Дублировать
            </button>
            <div className="h-px bg-slate-800 my-1" />
            <button
              onClick={() => {
                setMenuOpen(false);
                if (confirm(`Удалить персонажа "${character.name}"?`)) {
                  onDelete();
                }
              }}
              className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
