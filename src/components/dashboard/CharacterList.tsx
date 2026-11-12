import React, { useMemo, useState } from 'react';
import { Plus, Sparkles, UserPlus } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { SettingType } from '../../types/character';
import { SAMPLE_CHARACTERS } from '../../config/sampleCharacters';
import { saveLocalCharacters } from '../../services/storage';
import { CharacterCard } from './CharacterCard';
import { CharacterWizard } from '../creator/CharacterWizard';
import { SectionRibbon } from '../common/SectionRibbon';
import { Tabs } from '../common/Tabs';
import { Button } from '../common/Button';

type FilterKey = 'all' | SettingType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'witcher', label: 'Ведьмак' },
  { key: 'universal', label: 'Fate Core' },
];

const LABEL_BY_KEY: Record<FilterKey, string> = {
  all: 'Все',
  witcher: 'Ведьмак',
  universal: 'Fate Core',
};

const KEY_BY_LABEL: Record<string, FilterKey> = {
  Все: 'all',
  Ведьмак: 'witcher',
  'Fate Core': 'universal',
};

export const CharacterList: React.FC = () => {
  const { characters, loading, selectChar, deleteChar, duplicateChar } = useCharacters();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [isCreating, setIsCreating] = useState(false);

  const filteredCharacters = useMemo(
    () => (filter === 'all' ? characters : characters.filter((character) => character.setting === filter)),
    [characters, filter],
  );

  const witcherCount = useMemo(
    () => characters.filter((character) => character.setting === 'witcher').length,
    [characters],
  );
  const universalCount = characters.length - witcherCount;

  const handleLoadSamples = () => {
    saveLocalCharacters(SAMPLE_CHARACTERS);
    window.location.reload();
  };

  return (
    <div data-kit="character-list" className="mx-auto max-w-[1440px] px-6 py-8">
      <SectionRibbon>Мои персонажи ({characters.length})</SectionRibbon>

      <div className="flex items-center justify-between gap-4 border-b border-line py-2">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          Всего <span className="tabular-nums text-text">{characters.length}</span>
          <span className="px-2 text-gold">·</span>
          Ведьмак <span className="tabular-nums text-text">{witcherCount}</span>
          <span className="px-2 text-gold">·</span>
          Fate Core <span className="tabular-nums text-text">{universalCount}</span>
        </p>
        <p className="hidden whitespace-nowrap font-sans text-xs uppercase tracking-wider text-text-muted sm:block">
          Показано: <span className="tabular-nums text-text">{filteredCharacters.length}</span> из{' '}
          <span className="tabular-nums text-text">{characters.length}</span>
        </p>
      </div>

      <div className="mt-4">
        <Tabs
          tabs={FILTERS.map((item) => item.label)}
          active={LABEL_BY_KEY[filter]}
          onChange={(label) => {
            const nextFilter = KEY_BY_LABEL[label];
            if (nextFilter) setFilter(nextFilter);
          }}
        />
      </div>

      {loading && (
        <p className="mt-6 border border-line px-4 py-6 text-center font-sans text-xs uppercase tracking-wider text-text-muted">
          Загрузка персонажей…
        </p>
      )}

      {!loading && characters.length === 0 && (
        <div className="mt-6 border border-line px-6 py-10 text-center">
          <UserPlus className="mx-auto size-8 stroke-[1.5] text-gold" />
          <p className="mt-4 font-fantasy text-xl uppercase tracking-wide text-text">Персонажей пока нет</p>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-text-muted">
            Создайте первого героя или загрузите готовые примеры, чтобы увидеть каталог.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2">
              <Plus className="size-4 stroke-[1.5]" />
              Создать персонажа
            </Button>
            <Button variant="secondary" onClick={handleLoadSamples} className="inline-flex items-center gap-2">
              <Sparkles className="size-4 stroke-[1.5]" />
              Загрузить примеры
            </Button>
          </div>
        </div>
      )}

      {!loading && characters.length > 0 && (
        <>
          {filteredCharacters.length === 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-3">
              <p className="font-sans text-sm text-text-muted">В этом сеттинге персонажей нет.</p>
              <Button variant="secondary" onClick={() => setFilter('all')}>
                Показать всех
              </Button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={() => selectChar(character.id)}
                onDuplicate={() => duplicateChar(character.id)}
                onDelete={() => deleteChar(character.id)}
              />
            ))}

            <div className="border border-line bg-panel p-4">
              <button
                type="button"
                data-kit="character-new"
                onClick={() => setIsCreating(true)}
                className="group flex w-full items-center justify-center gap-3 px-4 py-8 transition-colors duration-150 hover:bg-ink-raised focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              >
                <Plus className="size-5 shrink-0 stroke-[1.5] text-gold transition-colors duration-150 group-hover:text-gold-light" />
                <span className="flex flex-col items-start gap-1">
                  <span className="font-fantasy text-base uppercase tracking-wider text-text">Создать персонажа</span>
                  <span className="font-sans text-xs tracking-wider text-text-muted">Новый лист персонажа</span>
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {isCreating && <CharacterWizard onClose={() => setIsCreating(false)} />}
    </div>
  );
};
