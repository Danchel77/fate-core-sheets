import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Sparkles, 
  Award, 
  Coins, 
  Trash2, 
  Plus, 
  Minus, 
  Shield 
} from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { AspectsSection } from './AspectsSection';
import { SkillsPyramid } from './SkillsPyramid';
import { StuntsSection } from './StuntsSection';
import { StressSection } from './StressSection';
import { ApiKeyModal } from '../common/ApiKeyModal';
import { exportCharacterToPdf } from '../../services/pdfExport';
import { SETTING_PRESETS } from '../../config/presets';
import { SettingType } from '../../types/character';

export const CharacterSheet: React.FC = () => {
  const { activeCharacter, updateChar, selectChar } = useCharacters();
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeCharacter) {
    return null;
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateChar({
        ...activeCharacter,
        avatar: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateChar({
      ...activeCharacter,
      avatar: null,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportCharacterToPdf('printable-character-sheet', activeCharacter.name);
    setIsExporting(false);
  };

  const currentSetting = SETTING_PRESETS[activeCharacter.setting] || SETTING_PRESETS.witcher;
  const baseUrl = import.meta.env.BASE_URL || '/';

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6">
      {/* Top action navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => selectChar(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm font-medium transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-0.5 transition" />
          <span>Вернуться к выбору персонажа</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Настроить Gemini</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isExporting ? 'Экспорт...' : 'Экспорт в PDF'}</span>
          </button>
        </div>
      </div>

      {/* The Printable / Renderable Container */}
      <div 
        id="printable-character-sheet"
        className="bg-[#0B0E14] border border-[#1C212B] rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6"
      >
        {/* Character Passport Header */}
        <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            {/* Avatar Portrait */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl overflow-hidden bg-[#0B0E14] border border-[#2E3440] group-hover:border-amber-500 cursor-pointer flex items-center justify-center transition shadow-lg relative"
              >
                {activeCharacter.avatar ? (
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-amber-500 transition">
                    <Shield className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-slate-500">Портрет</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition backdrop-blur-xs">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span>Сменить</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {activeCharacter.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-500 transition"
                  title="Удалить портрет"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1A202C] border border-[#2E3440] text-amber-400">
                  {currentSetting.name}
                </span>

                <select
                  value={activeCharacter.setting}
                  onChange={(e) => updateChar({ ...activeCharacter, setting: e.target.value as SettingType })}
                  className="bg-transparent text-[11px] text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="witcher" className="bg-[#121721] text-slate-200">Ведьмак</option>
                  <option value="universal" className="bg-[#121721] text-slate-200">Fate Core</option>
                </select>
              </div>

              <input
                type="text"
                value={activeCharacter.name}
                onChange={(e) => updateChar({ ...activeCharacter, name: e.target.value })}
                placeholder="Имя персонажа..."
                className="w-full bg-transparent font-fantasy font-bold text-2xl lg:text-3xl text-amber-300 placeholder-slate-600 focus:outline-none tracking-wide"
              />

              <input
                type="text"
                value={activeCharacter.description}
                onChange={(e) => updateChar({ ...activeCharacter, description: e.target.value })}
                placeholder="Краткое описание, раса, принадлежность или титул..."
                className="w-full bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none mt-1"
              />
            </div>
          </div>

          {/* Right side: System Medallion Logo & Resource Counters */}
          <div className="flex items-center gap-4 shrink-0 self-stretch sm:self-auto justify-end">
            {/* Setting Medallion Logo */}
            <div className="flex items-center justify-center p-2 rounded-2xl bg-[#0B0E14] border border-[#1C212B] w-16 h-16 shrink-0" title={currentSetting.name}>
              {activeCharacter.setting === 'witcher' ? (
                <img
                  src={`${baseUrl}witcher-medallion.svg`}
                  alt="Witcher Medallion"
                  className="w-12 h-12 object-contain filter drop-shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-fantasy font-black text-amber-400 text-lg leading-none">FATE</span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider">CORE</span>
                </div>
              )}
            </div>

            {/* Refresh (Освежение) */}
            <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Освежение
              </span>
              <span className="font-fantasy font-black text-xl text-amber-300 my-0.5">
                {activeCharacter.refresh}
              </span>
              <span className="text-[9px] text-slate-500">
                Базовое: 3
              </span>
            </div>

            {/* Fate Points (Жетоны судьбы) */}
            <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] flex flex-col items-center justify-center min-w-[96px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                Жетоны Fate
              </span>
              <div className="flex items-center gap-1.5 my-0.5">
                <button
                  type="button"
                  onClick={() => updateChar({ 
                    ...activeCharacter, 
                    currentFatePoints: Math.max(0, activeCharacter.currentFatePoints - 1) 
                  })}
                  className="w-5 h-5 rounded bg-[#121721] border border-[#2E3440] hover:border-amber-500 text-slate-300 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-fantasy font-bold text-xl text-white min-w-[20px] text-center">
                  {activeCharacter.currentFatePoints}
                </span>
                <button
                  type="button"
                  onClick={() => updateChar({ 
                    ...activeCharacter, 
                    currentFatePoints: activeCharacter.currentFatePoints + 1 
                  })}
                  className="w-5 h-5 rounded bg-[#121721] border border-[#2E3440] hover:border-amber-500 text-slate-300 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[9px] text-slate-500">
                В игре
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Fate Core Sheet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Aspects, Stunts */}
          <div className="space-y-6">
            <AspectsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsApiKeyOpen(true)}
            />

            <StuntsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsApiKeyOpen(true)}
            />
          </div>

          {/* Right Column: Skill Pyramid, Stress & Consequences */}
          <div className="space-y-6">
            <SkillsPyramid
              character={activeCharacter}
              onChange={updateChar}
            />

            <StressSection
              character={activeCharacter}
              onChange={updateChar}
            />
          </div>
        </div>
      </div>

      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </div>
  );
};
