import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Trash2, Edit3, Shield, FileDown, Sparkles } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportPdf?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onDuplicate,
  onDelete,
  onExportPdf,
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

  const isWitcher = character.setting === 'witcher';
  const highConcept = character.aspects.high_concept?.trim();
  const trouble = character.aspects.trouble?.trim();

  // Checked stress count for indicator
  const physicalChecked = character.physicalStress.filter(b => b.checked).length;
  const mentalChecked = character.mentalStress.filter(b => b.checked).length;
  const hasInjuries = physicalChecked > 0 || mentalChecked > 0;

  return (
    <div 
      onClick={onSelect}
      className="group relative bg-[#171D27] hover:bg-[#1C2330] border border-[#252E3E] hover:border-[#38465E] rounded-xl p-4 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#10141C] border border-[#252E3E] shrink-0 flex items-center justify-center">
            {character.avatar ? (
              <img 
                src={character.avatar} 
                alt={character.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-slate-400 transition">
                <Shield className="w-8 h-8 stroke-[1.5]" />
              </div>
            )}
            
            {/* Setting pill */}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-medium text-slate-300 border border-white/10">
              {isWitcher ? 'Ведьмак' : 'Fate Core'}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-base text-slate-100 group-hover:text-white truncate transition">
              {character.name || 'Безымянный персонаж'}
            </h3>
            
            <p className="text-xs text-slate-300 truncate mt-0.5">
              {highConcept || <span className="text-slate-500 italic">Концепция не указана</span>}
            </p>

            {trouble && (
              <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                {trouble}
              </p>
            )}

            {/* Quick status line */}
            <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-[#10141C] border border-[#232B3A] text-slate-300">
                Жетоны: <strong className="text-slate-200">{character.currentFatePoints}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#10141C] border border-[#232B3A] text-slate-300">
                Освежение: <strong className="text-slate-200">{character.refresh}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Stress & Stunts indicator */}
        <div className="mt-3.5 pt-3 border-t border-[#222A38] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">Физ:</span>
              <span className="flex gap-1">
                {character.physicalStress.map((box) => (
                  <span
                    key={box.index}
                    title={`Ячейка [${box.value}] ${box.checked ? '(занята)' : '(свободна)'}`}
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[9px] font-bold transition ${
                      box.checked 
                        ? 'bg-red-500/80 border-red-400 text-white' 
                        : 'bg-[#10141C] border-[#2B3547] text-slate-300'
                    }`}
                  >
                    {box.value}
                  </span>
                ))}
              </span>
            </span>

            <span className="text-slate-600">•</span>

            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">Мент:</span>
              <span className="flex gap-1">
                {character.mentalStress.map((box) => (
                  <span
                    key={box.index}
                    title={`Ячейка [${box.value}] ${box.checked ? '(занята)' : '(свободна)'}`}
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[9px] font-bold transition ${
                      box.checked 
                        ? 'bg-blue-500/80 border-blue-400 text-white' 
                        : 'bg-[#10141C] border-[#2B3547] text-slate-300'
                    }`}
                  >
                    {box.value}
                  </span>
                ))}
              </span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            {character.stunts.length} {character.stunts.length === 1 ? 'трюк' : character.stunts.length < 5 ? 'трюка' : 'трюков'}
          </span>
        </div>
      </div>

      {/* Menu button */}
      <div 
        ref={menuRef} 
        className="absolute top-3.5 right-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#252E3E] transition"
          title="Действия с персонажем"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#141A23] border border-[#2B3648] shadow-xl py-1 z-30 text-xs">
            <button
              onClick={() => {
                setMenuOpen(false);
                onSelect();
              }}
              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-[#1E2634] flex items-center gap-2 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Открыть лист</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
              className="w-full px-3 py-2 text-left text-slate-200 hover:bg-[#1E2634] flex items-center gap-2 transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Дублировать</span>
            </button>
            {onExportPdf && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onExportPdf();
                }}
                className="w-full px-3 py-2 text-left text-slate-200 hover:bg-[#1E2634] flex items-center gap-2 transition"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Экспорт PDF</span>
              </button>
            )}
            <div className="my-1 border-t border-[#222A38]" />
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
