import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Download,
  Sparkles,
  Trash2,
  Shield,
} from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { AspectsSection } from './AspectsSection';
import { SkillsPyramid } from './SkillsPyramid';
import { StuntsSection } from './StuntsSection';
import { StressSection } from './StressSection';
import { NotesSection } from './NotesSection';
import { AdvancementSection } from './AdvancementSection';
import { RulesTooltip } from './RulesTooltip';
import { ApiKeyModal } from '../common/ApiKeyModal';
import { exportCharacterToPdf } from '../../services/pdfExport';
import { SettingType } from '../../types/character';
import { getFatePointCircles } from '../../utils/fateMath';

const MAX_AVATAR_SOURCE_BYTES = 6 * 1024 * 1024;
const AVATAR_MAX_SIDE = 800;

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

    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      alert('Размер изображения не должен превышать 6 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const source = event.target?.result as string;
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_SIDE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) {
          updateChar({ ...activeCharacter, avatar: source });
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateChar({
          ...activeCharacter,
          avatar: canvas.toDataURL('image/jpeg', 0.86),
        });
      };

      image.onerror = () => {
        alert('Не удалось прочитать изображение.');
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateChar({ ...activeCharacter, avatar: null });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCharacterToPdf('printable-character-sheet', activeCharacter.name);
    } finally {
      setIsExporting(false);
    }
  };

  const baseUrl = import.meta.env.BASE_URL || '/';
  const circles = getFatePointCircles(activeCharacter.refresh);

  const renderLogo = (compact = false) => {
    if (activeCharacter.setting === 'witcher') {
      return (
        <img
          src={`${baseUrl}wolf-head.svg`}
          alt="Ведьмак"
          className={`${compact ? 'h-12' : 'h-20 sm:h-24'} w-auto max-w-[190px] object-contain opacity-95`}
        />
      );
    }

    return (
      <img
        src={`${baseUrl}fate-core-logo.svg`}
        alt="Fate Core System"
        className={`${compact ? 'h-10' : 'h-16 sm:h-20'} w-auto max-w-[220px] object-contain invert`}
      />
    );
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
      {/* Top action bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => selectChar(null)}
          className="group flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-0.5 group-hover:text-slate-200" />
          <span>К списку персонажей</span>
        </button>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#252D3A] bg-[#121721] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-[#1A202C] hover:text-white sm:flex-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            <span>Настроить Gemini</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-3.5 py-2 text-xs font-semibold text-[#0B0E14] transition hover:border-[#CAD8E8] hover:bg-[#CAD8E8] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Экспорт...' : 'Скачать PDF'}</span>
          </button>
        </div>
      </div>

      {/* Single sheet panel */}
      <div
        id="printable-character-sheet"
        className="rounded-2xl border border-[#202734] bg-[#10141C] p-5 shadow-sm sm:p-7"
      >
        {/* Passport */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="group relative shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[#252D3A] bg-[#0B0E14] transition group-hover:border-slate-600 sm:h-24 sm:w-24"
            >
              {activeCharacter.avatar ? (
                <img
                  src={activeCharacter.avatar}
                  alt={activeCharacter.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 transition group-hover:text-slate-400">
                  <Shield className="h-7 w-7 stroke-[1.5]" />
                  <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                    Портрет
                  </span>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                <Upload className="mb-0.5 h-3.5 w-3.5" />
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
                className="absolute -right-1.5 -top-1.5 rounded-full border border-[#2E3440] bg-[#1A202C] p-1 text-slate-400 shadow-sm transition hover:text-red-400"
                title="Удалить портрет"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <select
                value={activeCharacter.setting}
                onChange={(e) =>
                  updateChar({ ...activeCharacter, setting: e.target.value as SettingType })
                }
                className="cursor-pointer bg-transparent text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition hover:text-slate-200 focus:outline-none"
                title="Сменить сеттинг"
              >
                <option value="witcher" className="bg-[#121721] text-slate-200">
                  Ведьмак / Тёмное фэнтези
                </option>
                <option value="universal" className="bg-[#121721] text-slate-200">
                  Fate Core / Универсал
                </option>
              </select>
            </div>

            <input
              type="text"
              value={activeCharacter.name}
              onChange={(e) => updateChar({ ...activeCharacter, name: e.target.value })}
              placeholder="Имя персонажа..."
              className="w-full bg-transparent font-fantasy text-[22px] font-bold tracking-wide text-white placeholder-slate-600 focus:outline-none sm:text-3xl"
            />
          </div>

          <div className="hidden shrink-0 pt-1 sm:block">{renderLogo()}</div>
        </div>

        <textarea
          rows={1}
          value={activeCharacter.description}
          onChange={(e) => updateChar({ ...activeCharacter, description: e.target.value })}
          placeholder="Краткое описание, раса, принадлежность или титул..."
          className="mt-3 w-full resize-none bg-transparent text-xs leading-relaxed text-slate-400 placeholder-slate-600 [field-sizing:content] focus:outline-none sm:mt-2 sm:pl-[116px]"
        />

        {/* Fate points */}
        <div className="mt-4 flex items-center gap-4 border-t border-[#202734] pt-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              <RulesTooltip
                label="Очки судьбы"
                text="Очки судьбы — валюта игры. В начале сессии вы получаете их столько, сколько у вас Обновление. Тратьте, чтобы активировать аспекты, объявлять факты и использовать трюки; получайте, когда аспекты осложняют жизнь."
              />
              <span className="text-slate-600">·</span>
              <RulesTooltip
                label={`обновление: ${activeCharacter.refresh}`}
                text="Обновление — сколько очков судьбы вы получаете в начале каждой сессии. Обычно 3; каждый трюк сверх трёх бесплатных снижает его на 1, но не ниже 1."
              />
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              {Array.from({ length: circles.total }).map((_, index) => (
                <span
                  key={index}
                  className={`h-4 w-4 rounded-full border ${
                    index < circles.solid
                      ? 'border-slate-300'
                      : 'border-dashed border-slate-600'
                  }`}
                  aria-hidden="true"
                />
              ))}

            </div>
          </div>

          <div className="ml-auto sm:hidden">{renderLogo(true)}</div>
        </div>

        {/* Main sheet columns */}
        <div className="mt-7 grid items-start gap-8 border-t border-[#202734] pt-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-7">
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

          <div className="space-y-7">
            <SkillsPyramid character={activeCharacter} onChange={updateChar} />
            <StressSection character={activeCharacter} onChange={updateChar} />
          </div>
        </div>

        <div className="mt-7">
          <NotesSection character={activeCharacter} onChange={updateChar} />
        </div>

        <AdvancementSection character={activeCharacter} onChange={updateChar} />
      </div>

      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </div>
  );
};
