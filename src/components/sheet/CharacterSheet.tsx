import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, Pencil, Shield, Sparkles } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { AspectsSection } from './AspectsSection';
import { ConsequencesSection } from './ConsequencesSection';
import { NotesSection } from './NotesSection';
import { PortraitModal } from './PortraitModal';
import { RefreshControl } from './RefreshControl';
import { SkillsPyramid } from './SkillsPyramid';
import { StressSection } from './StressSection';
import { StuntsSection } from './StuntsSection';
import { ApiKeyModal } from '../common/ApiKeyModal';
import { exportCharacterToPdf } from '../../services/pdfExport';
import { SettingType } from '../../types/character';
import { countRealStunts, getFatePointCircles } from '../../utils/fateMath';

const MAX_AVATAR_SOURCE_BYTES = 6 * 1024 * 1024;
const AVATAR_MAX_SIDE = 800;

export const CharacterSheet: React.FC = () => {
  const { activeCharacter, updateChar, selectChar } = useCharacters();
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isPortraitOpen, setIsPortraitOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeCharacter) {
    return null;
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      alert('Размер изображения не должен превышать 6 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const source = loadEvent.target?.result as string;
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_SIDE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) {
          updateChar({ ...activeCharacter, avatar: source });
          setIsPortraitOpen(false);
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateChar({
          ...activeCharacter,
          avatar: canvas.toDataURL('image/jpeg', 0.86),
        });
        setIsPortraitOpen(false);
      };

      image.onerror = () => {
        alert('Не удалось прочитать изображение.');
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveAvatar = () => {
    updateChar({ ...activeCharacter, avatar: null });
    setIsPortraitOpen(false);
  };

  const handleReplaceAvatar = () => {
    setIsPortraitOpen(false);
    fileInputRef.current?.click();
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
  const realStunts = countRealStunts(activeCharacter.stunts);

  const renderLogo = () => {
    if (activeCharacter.setting === 'witcher') {
      return (
        <img
          src={`${baseUrl}wolf-head.svg`}
          alt="Ведьмак"
          className="h-12 w-auto max-w-[150px] object-contain opacity-95 sm:h-16 lg:h-20"
        />
      );
    }

    return (
      <img
        src={`${baseUrl}fate-core-logo.svg`}
        alt="Fate Core System"
        className="h-11 w-auto max-w-[170px] object-contain invert sm:h-14 lg:h-[72px]"
      />
    );
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => selectChar(null)}
          className="group flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-0.5 group-hover:text-slate-200" />
          <span>К списку персонажей</span>
        </button>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsApiKeyOpen(true)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#252D3A] bg-[#121721] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-[#1A202C] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 sm:flex-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            <span>Настроить Gemini</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-3.5 py-2 text-xs font-semibold text-[#0B0E14] transition hover:border-[#CAD8E8] hover:bg-[#CAD8E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Экспорт...' : 'Скачать PDF'}</span>
          </button>
        </div>
      </div>

      <div
        id="printable-character-sheet"
        className="rounded-2xl border border-[#202734] bg-[#10141C] p-5 shadow-sm sm:p-7"
      >
        {/* Passport: portrait | identity | fate + logo */}
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-x-4 gap-y-3 sm:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)_auto] lg:gap-6">
          <button
            type="button"
            onClick={() => setIsPortraitOpen(true)}
            aria-label="Изменить портрет"
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#252D3A] bg-[#0B0E14] transition hover:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
          >
            {activeCharacter.avatar ? (
              <img
                src={activeCharacter.avatar}
                alt={activeCharacter.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center text-slate-600 transition group-hover:text-slate-400">
                <Shield className="h-6 w-6 stroke-[1.5] sm:h-7 sm:w-7" />
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em]">
                  Портрет
                </span>
              </span>
            )}

            <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <Pencil className="mb-0.5 h-3.5 w-3.5" />
              <span>Изменить</span>
            </span>
          </button>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <select
                value={activeCharacter.setting}
                onChange={(event) =>
                  updateChar({ ...activeCharacter, setting: event.target.value as SettingType })
                }
                className="cursor-pointer bg-transparent text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
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
              onChange={(event) => updateChar({ ...activeCharacter, name: event.target.value })}
              placeholder="Имя персонажа..."
              className="w-full bg-transparent font-fantasy text-[22px] font-bold tracking-wide text-white placeholder-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 sm:text-3xl"
            />

            <textarea
              rows={1}
              value={activeCharacter.description}
              onChange={(event) =>
                updateChar({ ...activeCharacter, description: event.target.value })
              }
              placeholder="Краткое описание, раса, принадлежность или титул..."
              className="mt-2 w-full resize-none bg-transparent text-xs leading-relaxed text-slate-400 placeholder-slate-500 [field-sizing:content] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
            />
          </div>

          <div className="col-span-2 flex items-center gap-4 border-t border-[#202734] pt-3 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="min-w-0">
              <h2 className="font-fantasy text-[13px] font-semibold tracking-wide text-slate-100">
                Очки судьбы
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-slate-500">
                <span>Восстановление:</span>
                <RefreshControl
                  baseRefresh={activeCharacter.baseRefresh ?? 3}
                  refresh={activeCharacter.refresh}
                  stuntCount={realStunts}
                  freeStunts={activeCharacter.freeStunts ?? 3}
                  onChangeBase={(value) =>
                    updateChar({ ...activeCharacter, baseRefresh: value })
                  }
                />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: circles.total }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-3.5 w-3.5 rounded-full border ${
                      index < circles.solid
                        ? 'border-slate-300'
                        : 'border-dashed border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="ml-auto shrink-0">{renderLogo()}</div>
          </div>
        </div>

        <div className="mt-7 grid items-start gap-8 border-t border-[#202734] pt-6 lg:grid-cols-2">
          <div className="space-y-7">
            <AspectsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsApiKeyOpen(true)}
            />
            <ConsequencesSection character={activeCharacter} onChange={updateChar} />
          </div>

          <div className="space-y-7 lg:border-l lg:border-[#202734] lg:pl-8">
            <SkillsPyramid character={activeCharacter} onChange={updateChar} />
            <StressSection character={activeCharacter} onChange={updateChar} />
          </div>
        </div>

        <div className="mt-7">
          <StuntsSection
            character={activeCharacter}
            onChange={updateChar}
            onOpenApiKeySettings={() => setIsApiKeyOpen(true)}
          />
        </div>

        <div className="mt-7">
          <NotesSection character={activeCharacter} onChange={updateChar} />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <PortraitModal
        isOpen={isPortraitOpen}
        avatar={activeCharacter.avatar}
        characterName={activeCharacter.name}
        onClose={() => setIsPortraitOpen(false)}
        onReplace={handleReplaceAvatar}
        onRemove={handleRemoveAvatar}
      />

      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </div>
  );
};
