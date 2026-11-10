import React, { useRef, useState } from 'react';
import { Pencil, Shield } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { AspectsSection } from './AspectsSection';
import { ConsequencesSection } from './ConsequencesSection';
import { NotesSection } from './NotesSection';
import { PortraitModal } from './PortraitModal';
import { RefreshControl } from './RefreshControl';
import { RulesTooltip } from './RulesTooltip';
import { SheetBlock } from './SheetBlock';
import { SkillsPyramid } from './SkillsPyramid';
import { StressSection } from './StressSection';
import { StuntsSection } from './StuntsSection';
import { SettingsModal } from '../common/SettingsModal';
import { SettingType } from '../../types/character';
import { countRealStunts, getFatePointCircles } from '../../utils/fateMath';

const MAX_AVATAR_SOURCE_BYTES = 6 * 1024 * 1024;
const AVATAR_MAX_SIDE = 800;

export const CharacterSheet: React.FC = () => {
  const { activeCharacter, updateChar } = useCharacters();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPortraitOpen, setIsPortraitOpen] = useState(false);
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

  const baseUrl = import.meta.env.BASE_URL || '/';
  const circles = getFatePointCircles(activeCharacter.refresh);
  const realStunts = countRealStunts(activeCharacter.stunts);

  const renderLogo = () => {
    if (activeCharacter.setting === 'witcher') {
      return (
        <img
          src={`${baseUrl}wolf-head.svg`}
          alt="Ведьмак"
          className="h-16 w-auto max-w-[150px] object-contain opacity-95 sm:h-20 lg:h-24"
        />
      );
    }

    return (
      <img
        src={`${baseUrl}fate-core-logo.svg`}
        alt="Fate Core System"
        className="h-12 w-auto max-w-[170px] object-contain invert sm:h-16 lg:h-20"
      />
    );
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
      <div id="printable-character-sheet" className="space-y-4">
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <SheetBlock>
            <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-x-4 gap-y-3 sm:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)]">
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
            </div>
          </SheetBlock>

          <SheetBlock className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <RulesTooltip
                label="Очки судьбы"
                title="Очки судьбы"
                text="Тратятся на активацию аспектов, трюков и других правил. В начале сессии вы получаете столько очков, каково ваше восстановление."
                className="font-fantasy text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-100"
              />

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] tracking-[0.02em] text-slate-500">
                <RulesTooltip
                  label="Восстановление"
                  title="Восстановление"
                  text="Сколько очков судьбы вы получаете в начале каждой сессии. Базовое значение — 3; каждый трюк сверх трёх снижает его на 1."
                />
                <span className="text-slate-600">:</span>
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

              <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-hidden="true">
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

            <div className="shrink-0">{renderLogo()}</div>
          </SheetBlock>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <SheetBlock className="lg:col-start-1 lg:row-start-1">
            <AspectsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsSettingsOpen(true)}
            />
          </SheetBlock>
          <SheetBlock className="lg:col-start-1 lg:row-start-2">
            <ConsequencesSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>
          <SheetBlock className="lg:col-start-2 lg:row-start-1">
            <SkillsPyramid character={activeCharacter} onChange={updateChar} />
          </SheetBlock>
          <SheetBlock className="lg:col-start-2 lg:row-start-2">
            <StressSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>
        </div>

        <SheetBlock>
          <StuntsSection
            character={activeCharacter}
            onChange={updateChar}
            onOpenApiKeySettings={() => setIsSettingsOpen(true)}
          />
        </SheetBlock>

        <SheetBlock>
          <NotesSection character={activeCharacter} onChange={updateChar} />
        </SheetBlock>
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
