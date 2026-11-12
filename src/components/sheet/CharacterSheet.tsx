import React, { useRef, useState } from 'react';
import { Pencil, Shield } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { AspectsSection } from './AspectsSection';
import { ConsequencesSection } from './ConsequencesSection';
import { NotesSection } from './NotesSection';
import { PortraitModal } from './PortraitModal';
import { RefreshControl } from './RefreshControl';
import { RulesTooltip } from './RulesTooltip';
import { SettingEmblem } from './SettingEmblem';
import { SheetBlock } from './SheetBlock';
import { SkillsPyramid } from './SkillsPyramid';
import { StressSection } from './StressSection';
import { StuntsSection } from './StuntsSection';
import { SettingsModal } from '../common/SettingsModal';
import { CornerFrame } from '../common/CornerFrame';
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

  const circles = getFatePointCircles(activeCharacter.refresh);
  const realStunts = countRealStunts(activeCharacter.stunts);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 lg:px-6">
      <div
        id="printable-character-sheet"
        className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr_400px] lg:items-start"
      >
        {/* Левая зона: портрет, имя, сеттинг, очки судьбы, последствия, стресс. */}
        <div data-zone="left" className="flex min-w-0 flex-col gap-6">
          <header data-kit="sheet-header" className="flex flex-col gap-3">
            <CornerFrame>
              <button
                data-kit="sheet-portrait"
                type="button"
                onClick={() => setIsPortraitOpen(true)}
                aria-label="Изменить портрет"
                className="group relative block h-[220px] w-full max-w-full shrink-0 cursor-pointer overflow-hidden bg-ink-frame transition-colors duration-150 hover:bg-ink-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:h-[400px] lg:w-[300px]"
              >
                {activeCharacter.avatar ? (
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 text-text-muted transition-colors duration-150 group-hover:text-gold">
                    <Shield className="size-5" strokeWidth={1.5} />
                    <span className="font-sans text-xs uppercase tracking-wider">Портрет</span>
                  </span>
                )}

                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/75 font-sans text-xs uppercase tracking-wider text-text opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Pencil className="size-4" strokeWidth={1.5} />
                  <span>Изменить</span>
                </span>
              </button>
            </CornerFrame>

            <div className="flex flex-col gap-3 px-4">
              <input
                type="text"
                value={activeCharacter.name}
                onChange={(event) => updateChar({ ...activeCharacter, name: event.target.value })}
                placeholder="Имя персонажа..."
                className="w-full bg-transparent font-fantasy text-3xl tracking-wide text-text placeholder:text-text-muted [font-variant-caps:small-caps] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />

              <select
                value={activeCharacter.setting}
                onChange={(event) =>
                  updateChar({ ...activeCharacter, setting: event.target.value as SettingType })
                }
                className="w-full cursor-pointer bg-transparent font-sans text-xs uppercase tracking-wider text-text-muted transition-colors duration-150 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                title="Сменить сеттинг"
              >
                <option value="witcher" className="bg-ink-raised text-text">
                  Ведьмак / Тёмное фэнтези
                </option>
                <option value="universal" className="bg-ink-raised text-text">
                  Fate Core / Универсал
                </option>
              </select>

              <textarea
                rows={1}
                value={activeCharacter.description}
                onChange={(event) =>
                  updateChar({ ...activeCharacter, description: event.target.value })
                }
                placeholder="Краткое описание, раса, принадлежность или титул..."
                className="w-full resize-none bg-transparent font-sans text-sm leading-relaxed text-text-muted placeholder:text-text-muted [field-sizing:content] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
          </header>

          <SheetBlock title="Очки судьбы">
            <div data-kit="sheet-fate" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <RulesTooltip
                  label="Освежение"
                  title="Освежение"
                  text="Сколько очков судьбы вы получаете в начале каждой сессии. Базовое значение — 3; каждый трюк сверх трёх снижает его на 1."
                  className="font-sans text-xs uppercase tracking-wider text-text-muted"
                />

                <RefreshControl
                  baseRefresh={activeCharacter.baseRefresh ?? 3}
                  refresh={activeCharacter.refresh}
                  stuntCount={realStunts}
                  freeStunts={activeCharacter.freeStunts ?? 3}
                  onChangeBase={(value) => updateChar({ ...activeCharacter, baseRefresh: value })}
                />
              </div>

              <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: Math.min(5, circles.total) }).map((_, index) => (
                  <span
                    key={index}
                    data-kit="sheet-fate-token"
                    className={`size-4 border border-gold ${
                      index < circles.solid ? 'bg-gold' : 'bg-ink'
                    }`}
                  />
                ))}
              </div>

              <SettingEmblem setting={activeCharacter.setting} />
            </div>
          </SheetBlock>

          <SheetBlock title="Последствия">
            <ConsequencesSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>

          <SheetBlock title="Стресс">
            <StressSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>
        </div>

        {/* Центральная зона: навыки и трюки. */}
        <div data-zone="center" className="flex min-w-0 flex-col gap-6">
          <SheetBlock title="Навыки">
            <SkillsPyramid character={activeCharacter} onChange={updateChar} showHeader={false} />
          </SheetBlock>

          <SheetBlock title="Трюки">
            <StuntsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsSettingsOpen(true)}
              showHeader={false}
            />
          </SheetBlock>
        </div>

        {/* Правая зона: аспекты и две заметки. */}
        <div data-zone="right" className="flex min-w-0 flex-col gap-6">
          <SheetBlock title="Аспекты">
            <AspectsSection
              character={activeCharacter}
              onChange={updateChar}
              onOpenApiKeySettings={() => setIsSettingsOpen(true)}
            />
          </SheetBlock>

          <SheetBlock title="Заметки">
            <NotesSection character={activeCharacter} onChange={updateChar} field="notes" />
          </SheetBlock>

          <SheetBlock title="Дополнительно">
            <NotesSection character={activeCharacter} onChange={updateChar} field="notesExtra" />
          </SheetBlock>
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
