import React, { useEffect, useRef, useState } from 'react';
import { Copy, MoreHorizontal, Pencil, Shield, Trash2 } from 'lucide-react';
import { Character } from '../../types/character';
import { CornerFrame } from '../common/CornerFrame';
import { FieldLabel } from '../common/FieldLabel';

const SETTING_LABEL: Record<Character['setting'], string> = {
  witcher: 'Ведьмак',
  universal: 'Fate Core',
};

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect, onDuplicate, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarBroken, setIsAvatarBroken] = useState(!character.avatar);
  const menuRef = useRef<HTMLDivElement>(null);

  // Сброс состояния картинки при смене персонажа/аватара.
  useEffect(() => {
    setIsAvatarBroken(!character.avatar);
  }, [character.avatar]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const aspectCount = Object.values(character.aspects ?? {}).filter((value) => value.trim().length > 0).length;
  const stuntCount = character.stunts?.length ?? 0;
  const highConcept = character.aspects?.high_concept?.trim();

  const handleOpen = () => {
    setIsMenuOpen(false);
    onSelect();
  };
  const handleDuplicate = () => {
    setIsMenuOpen(false);
    onDuplicate();
  };
  const handleDelete = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  return (
    <div data-kit="character-card" className="h-full border border-line">
      <CornerFrame>
        <div onClick={onSelect} className="group flex cursor-pointer flex-col gap-4">
          <div className="flex items-start gap-4">
            <div
              data-avatar
              className="size-16 shrink-0 overflow-hidden border border-line bg-ink-raised"
            >
              {!isAvatarBroken && character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  onError={() => setIsAvatarBroken(true)}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Shield className="size-5 stroke-[1.5] text-gold" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3
                title={character.name}
                className="break-words font-fantasy text-lg leading-snug tracking-wide text-text [font-variant-caps:small-caps] group-hover:text-gold-light"
              >
                {character.name}
              </h3>
              {highConcept ? (
                <p title={highConcept} className="line-clamp-2 text-xs leading-relaxed text-text-muted">
                  {highConcept}
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-text-muted">High concept не задан</p>
              )}
            </div>

            <div ref={menuRef} className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-label={`Действия: ${character.name}`}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`rounded-none border p-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                  isMenuOpen
                    ? 'border-gold bg-wine text-gold'
                    : 'border-transparent text-text-muted hover:border-gold-dim hover:text-gold'
                }`}
              >
                <MoreHorizontal className="size-5 stroke-[1.5]" />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 w-44 border border-gold-dim bg-ink"
                >
                  <div className="border-b border-gold-dim bg-gold px-3 py-1.5 font-fantasy text-xs uppercase tracking-wider text-ink">
                    Действия
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOpen}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text transition-colors duration-150 hover:bg-wine"
                  >
                    <Pencil className="size-4 stroke-[1.5] text-gold" />
                    Открыть
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDuplicate}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text transition-colors duration-150 hover:bg-wine"
                  >
                    <Copy className="size-4 stroke-[1.5] text-gold" />
                    Дублировать
                  </button>
                  <div className="border-t border-line" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text transition-colors duration-150 hover:bg-wine"
                  >
                    <Trash2 className="size-4 stroke-[1.5] text-danger" />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-line pt-3">
            <div className="min-w-0">
              <FieldLabel>Сеттинг</FieldLabel>
              <p className="mt-1 font-fantasy text-sm leading-tight text-text">{SETTING_LABEL[character.setting]}</p>
            </div>
            <div className="min-w-0">
              <FieldLabel>Аспекты</FieldLabel>
              <p className="mt-1 font-fantasy text-sm tabular-nums leading-tight text-text">{aspectCount} из 5</p>
            </div>
            <div className="min-w-0">
              <FieldLabel>Трюки</FieldLabel>
              <p className="mt-1 font-fantasy text-sm tabular-nums leading-tight text-text">{stuntCount}</p>
            </div>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
};
