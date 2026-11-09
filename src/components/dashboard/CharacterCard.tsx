import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Copy, Trash2, Edit3, Shield, FileDown } from 'lucide-react';
import { Character } from '../../types/character';

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

  const highConcept = character.aspects.high_concept?.trim();
  const trouble = character.aspects.trouble?.trim();

  return (
    <div 
      onClick={onSelect}
      className="group relative bg-[#171D27] hover:bg-[#1C2330] border border-[#252E3E] hover:border-[#38465E] rounded-xl p-3.5 sm:p-4 min-h-[104px] sm:min-h-[112px] transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex items-center"
    >
      <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
        {/* Avatar */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#10141C] border border-[#252E3E] shrink-0 flex items-center justify-center">
          {character.avatar ? (
            <img 
              src={character.avatar} 
              alt={character.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-slate-500 group-hover:text-slate-400 transition">
              <Shield className="w-8 h-8 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Details: Spreads freely over the available width */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="pr-6">
            <h3 className="font-semibold text-base sm:text-lg text-slate-100 group-hover:text-white truncate transition">
              {character.name || 'Безымянный персонаж'}
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-300 truncate mt-1">
            {highConcept || <span className="text-slate-500 italic">Концепция не указана</span>}
          </p>

          {trouble && (
            <p className="text-xs text-slate-400 truncate mt-1 italic">
              {trouble}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Kebab Menu (moved to the top right corner) */}
      <div 
        ref={menuRef} 
        className="absolute top-2.5 right-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#252E3E] transition"
          title="Действия с персонажем"
        >
          <MoreHorizontal className="w-4 h-4" />
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
