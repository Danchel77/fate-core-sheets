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
import { SectionRibbon } from '../common/SectionRibbon';
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
        className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]"
      >
        {/* Мастер-колонка: имя в ленте, портрет без паспарту, описание,
            затем восстановление, стресс и последствия. */}
        <div data-zone="left" className="flex min-w-0 flex-col gap-4">
          <header data-kit="sheet-header" className="min-w-0">
            <div data-kit="character-identity" className="flex min-w-0 flex-col gap-3">
              <SectionRibbon>
                <input
                  data-kit="character-name"
                  type="text"
                  value={activeCharacter.name}
                  title={activeCharacter.name}
                  onChange={(event) => updateChar({ ...activeCharacter, name: event.target.value })}
                  placeholder="Имя персонажа..."
                  className="w-full min-w-0 cursor-text border-none bg-transparent p-0 text-center font-fantasy text-base leading-tight tracking-wide text-text placeholder:text-text-muted [font-variant-caps:small-caps] focus:outline-none focus-visible:underline focus-visible:decoration-gold focus-visible:underline-offset-2"
                />
              </SectionRibbon>

              {/* Рамка — только у изображения: ни паспарту, ни подложки. */}
              <div data-kit="portrait-frame" className="w-[300px] p-0">
                <button
                  data-kit="sheet-portrait"
                  type="button"
                  onClick={() => setIsPortraitOpen(true)}
                  aria-label="Изменить портрет"
                  className="group relative block h-[360px] w-[300px] shrink-0 cursor-pointer overflow-hidden bg-ink-frame p-0 transition-colors duration-150 hover:bg-ink-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {activeCharacter.avatar ? (
                    <img
                      data-kit="portrait-image"
                      src={activeCharacter.avatar}
                      alt={activeCharacter.name}
                      className="block h-[360px] w-[300px] border border-gold object-cover object-center"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-gold text-text-muted transition-colors duration-150 group-hover:text-gold"
                    >
                      <Shield className="size-5" strokeWidth={1.5} />
                      <span className="font-sans text-xs uppercase tracking-wider">Портрет</span>
                    </span>
                  )}

                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/75 font-sans text-xs uppercase tracking-wider text-text opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Pencil className="size-4" strokeWidth={1.5} />
                    <span>Изменить</span>
                  </span>
                </button>
              </div>

              <textarea
                data-kit="character-description"
                rows={3}
                value={activeCharacter.description}
                title={activeCharacter.description}
                onChange={(event) =>
                  updateChar({ ...activeCharacter, description: event.target.value })
                }
                placeholder="Краткое описание, раса, принадлежность или титул..."
                className="h-[54px] w-full resize-none overflow-y-auto bg-transparent p-0 text-left font-sans text-[13px] leading-snug text-text-muted placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
          </header>

          <SheetBlock title="Восстановление">
            <div data-kit="sheet-fate" className="flex min-w-0 flex-wrap items-center">
              <RulesTooltip
                label="Как считается"
                title="Восстановление"
                text="Сколько очков судьбы вы получаете в начале каждой сессии. База — 3; каждый трюк сверх трёх снижает это число на один."
                className="mr-2 shrink-0 font-sans text-xs text-text-muted"
              />

              {/* Подпись и число стоят вплотную, жетоны — сразу справа от числа. */}
              <span data-kit="fate-label" className="font-sans text-xs leading-none text-text">
                Восстановление
              </span>
              <span className="ml-2 inline-flex [&_[data-kit=sheet-refresh]]:leading-none">
                <RefreshControl
                  baseRefresh={activeCharacter.baseRefresh ?? 3}
                  refresh={activeCharacter.refresh}
                  stuntCount={realStunts}
                  freeStunts={activeCharacter.freeStunts ?? 3}
                  onChangeBase={(value) => updateChar({ ...activeCharacter, baseRefresh: value })}
                />
              </span>

              <div className="ml-2 flex items-center gap-1" aria-hidden="true">
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

        {/* Детальная область: навыки во всю ширину, ниже пары равных колонок. */}
        <div data-zone="right" className="flex min-w-0 flex-col gap-4">
          <SheetBlock title="Навыки" className="relative">
            <SettingEmblem
              setting={activeCharacter.setting}
              onSelect={(setting) => updateChar({ ...activeCharacter, setting })}
              variant="hero"
            />
            <SkillsPyramid character={activeCharacter} onChange={updateChar} />
          </SheetBlock>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
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

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <SheetBlock title="Заметки">
              <NotesSection character={activeCharacter} onChange={updateChar} field="notes" />
            </SheetBlock>

            <SheetBlock title="Дополнительно">
              <NotesSection character={activeCharacter} onChange={updateChar} field="notesExtra" />
            </SheetBlock>
          </div>
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
