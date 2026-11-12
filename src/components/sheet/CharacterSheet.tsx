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
    <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-6">
      <div
        id="printable-character-sheet"
        className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        {/* Левая зона: плашка персонажа, очки судьбы, стресс, последствия. */}
        <div data-zone="left" className="flex min-w-0 flex-col gap-4">
          <header data-kit="sheet-header" className="min-w-0">
            <div
              data-kit="character-plate"
              className="flex min-w-0 flex-col items-center gap-2 border border-gold p-1.5"
            >
              <SettingEmblem
                setting={activeCharacter.setting}
                onSelect={(setting) => updateChar({ ...activeCharacter, setting })}
              />

              <button
                data-kit="sheet-portrait"
                type="button"
                onClick={() => setIsPortraitOpen(true)}
                aria-label="Изменить портрет"
                className="group relative block h-[208px] w-[240px] shrink-0 cursor-pointer overflow-hidden bg-ink-frame transition-colors duration-150 hover:bg-ink-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:h-[300px]"
              >
                {activeCharacter.avatar ? (
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name}
                    className="h-full w-full object-cover object-center"
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

              <div className="flex w-full min-w-0 flex-col gap-1 text-center">
                <input
                  data-kit="character-name"
                  type="text"
                  value={activeCharacter.name}
                  title={activeCharacter.name}
                  onChange={(event) =>
                    updateChar({ ...activeCharacter, name: event.target.value })
                  }
                  placeholder="Имя персонажа..."
                  className="w-full min-w-0 bg-transparent text-center font-fantasy text-2xl tracking-wide text-text placeholder:text-text-muted [font-variant-caps:small-caps] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />

                <textarea
                  data-kit="character-description"
                  rows={3}
                  value={activeCharacter.description}
                  title={activeCharacter.description}
                  onChange={(event) =>
                    updateChar({ ...activeCharacter, description: event.target.value })
                  }
                  placeholder="Краткое описание, раса, принадлежность или титул..."
                  className="max-h-[4.5rem] w-full resize-none overflow-y-auto bg-transparent text-center font-sans text-sm leading-snug text-text-muted placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
              </div>
            </div>
          </header>

          <SheetBlock title="Очки судьбы">
            <div data-kit="sheet-fate" className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <RulesTooltip
                  label="Восстановление"
                  title="Восстановление"
                  text="Сколько очков судьбы вы получаете в начале каждой сессии. База — 3; каждый трюк сверх трёх снижает это число на один."
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

              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: Math.min(5, circles.total) }).map((_, index) => (
                  <span
                    key={index}
                    data-kit="sheet-fate-token"
                    className={`size-3 shrink-0 rounded-full bg-transparent ${
                      index < circles.solid
                        ? 'border border-gold'
                        : 'border border-dashed border-gold-dim'
                    }`}
                  />
                ))}
              </div>
            </div>
          </SheetBlock>

          <SheetBlock title="Стресс">
            <StressSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>

          <SheetBlock title="Последствия">
            <ConsequencesSection character={activeCharacter} onChange={updateChar} />
          </SheetBlock>
        </div>

        {/* Правая зона: навыки на всю ширину, две подколонки, заметки внизу. */}
        <div data-zone="right" className="flex min-w-0 flex-col gap-4">
          <SheetBlock title="Навыки">
            <SkillsPyramid character={activeCharacter} onChange={updateChar} showHeader={false} />
          </SheetBlock>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SheetBlock title="Трюки">
              <StuntsSection
                character={activeCharacter}
                onChange={updateChar}
                onOpenApiKeySettings={() => setIsSettingsOpen(true)}
                showHeader={false}
              />
            </SheetBlock>

            <SheetBlock title="Аспекты">
              <AspectsSection
                character={activeCharacter}
                onChange={updateChar}
                onOpenApiKeySettings={() => setIsSettingsOpen(true)}
              />
            </SheetBlock>
          </div>

          <SheetBlock title="Заметки">
            <NotesSection character={activeCharacter} onChange={updateChar} field="notes" />
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
