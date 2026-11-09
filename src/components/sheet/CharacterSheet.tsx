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
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top action bar: clean, subdued, aligned with dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => selectChar(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm font-medium transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:-translate-x-0.5 transition" />
          <span>Вернуться к выбору персонажа</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1C212B] bg-[#121721] hover:bg-[#1A202C] hover:border-slate-700 text-xs text-slate-300 hover:text-white font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Настроить Gemini</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#1C212B] bg-[#121721] hover:bg-[#1A202C] hover:border-slate-700 text-xs text-slate-200 hover:text-white font-medium transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Экспорт...' : 'Экспорт в PDF'}</span>
          </button>
        </div>
      </div>

      {/* The Printable / Renderable Container */}
      <div id="printable-character-sheet" className="space-y-6">
        {/* Character Passport Header */}
        <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            {/* Avatar Portrait */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-22 h-22 rounded-xl overflow-hidden bg-[#0B0E14] border border-[#1C212B] group-hover:border-slate-700 cursor-pointer flex items-center justify-center transition relative"
              >
                {activeCharacter.avatar ? (
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-slate-400 transition">
                    <Shield className="w-7 h-7 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 font-medium text-slate-500">Портрет</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition backdrop-blur-xs">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
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
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#1A202C] border border-[#2E3440] text-slate-400 hover:text-red-400 shadow-sm transition"
                  title="Удалить портрет"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {currentSetting.name}
                </span>

                <span className="text-slate-600">•</span>

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

          {/* Right side: Medallion & Resource Counters */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
            {/* Setting Medallion */}
            <div className="flex items-center justify-center p-2 rounded-xl bg-[#0B0E14] border border-[#1C212B] w-14 h-14 shrink-0" title={currentSetting.name}>
              {activeCharacter.setting === 'witcher' ? (
                <img
                  src={`${baseUrl}witcher-medallion.svg`}
                  alt="Witcher Medallion"
                  className="w-9 h-9 object-contain filter drop-shadow-sm opacity-90"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-fantasy font-black text-amber-400 text-sm leading-none">FATE</span>
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider">CORE</span>
                </div>
              )}
            </div>

            {/* Refresh */}
            <div className="px-3 py-2 rounded-xl bg-[#0B0E14] border border-[#1C212B] flex flex-col items-center justify-center min-w-[76px]">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400/80" />
                Освежение
              </span>
              <span className="font-mono font-bold text-lg text-slate-100 my-0.5">
                {activeCharacter.refresh}
              </span>
            </div>

            {/* Fate Points */}
            <div className="px-3 py-2 rounded-xl bg-[#0B0E14] border border-[#1C212B] flex flex-col items-center justify-center min-w-[92px]">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400/80" />
                Жетоны Fate
              </span>
              <div className="flex items-center gap-1.5 my-0.5">
                <button
                  type="button"
                  onClick={() => updateChar({ 
                    ...activeCharacter, 
                    currentFatePoints: Math.max(0, activeCharacter.currentFatePoints - 1) 
                  })}
                  className="w-5 h-5 rounded bg-[#121721] border border-[#1C212B] hover:border-slate-600 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-lg text-white min-w-[18px] text-center">
                  {activeCharacter.currentFatePoints}
                </span>
                <button
                  type="button"
                  onClick={() => updateChar({ 
                    ...activeCharacter, 
                    currentFatePoints: activeCharacter.currentFatePoints + 1 
                  })}
                  className="w-5 h-5 rounded bg-[#121721] border border-[#1C212B] hover:border-slate-600 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
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
