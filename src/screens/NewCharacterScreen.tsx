import { useMemo, useState } from 'react';
import type { Character, Stunt } from '../data/types';
import { createEmptyCharacter, ladderFromPicks } from '../data/characters';
import { createCharacter } from '../data/store';
import { CharacterWizard, type WizardDraft } from '../components/CharacterWizard';
import SheetScreen from './SheetScreen';

const EMPTY_DRAFT: WizardDraft = {
  setting: 'witcher',
  name: '',
  concept: '',
  trouble: '',
  aspects: ['', '', ''],
  skills: [],
  stunts: [],
  portrait: '',
};

/** Пустые карточки трюков в лист не попадают: добавленная, но не заполненная строка — не трюк. */
function filledStunts(draft: WizardDraft): Stunt[] {
  return draft.stunts
    .map((stunt) => ({ name: stunt.name.trim(), text: stunt.text.trim() }))
    .filter((stunt) => stunt.name.length > 0 || stunt.text.length > 0);
}

/** Черновик превращается в лист: то, что игрок уже вписал, видно под окном. */
function sheetFromDraft(draft: WizardDraft): Character {
  return {
    ...createEmptyCharacter(),
    name: draft.name,
    portrait: draft.portrait,
    ladder: ladderFromPicks(draft.skills),
    stunts: filledStunts(draft),
    aspects: [
      { label: 'Концепция', text: draft.concept },
      { label: 'Проблема', text: draft.trouble },
      { label: 'Первое приключение', text: draft.aspects[0] ?? '' },
      { label: 'Переплетение судеб', text: draft.aspects[1] ?? '' },
      { label: 'Переплетение судеб', text: draft.aspects[2] ?? '' },
    ],
  };
}

/** Совсем пустой черновик не сохраняем: случайно открытое окно не оставляет пустых карточек. */
function isBlankDraft(draft: WizardDraft): boolean {
  return (
    !draft.name.trim() &&
    !draft.concept.trim() &&
    !draft.trouble.trim() &&
    draft.aspects.every((text) => !text.trim()) &&
    draft.skills.length === 0 &&
    filledStunts(draft).length === 0 &&
    !draft.portrait
  );
}

/**
 * Новый герой: сразу открывается пустой лист, поверх него — конструктор.
 * Любое закрытие окна сохраняет героя и открывает его лист.
 */
export default function NewCharacterScreen() {
  const [draft, setDraft] = useState<WizardDraft>(EMPTY_DRAFT);
  const [open] = useState(true);
  const [saving, setSaving] = useState(false);
  const character = useMemo(() => sheetFromDraft(draft), [draft]);

  const finish = async () => {
    if (saving) return;
    setSaving(true);

    if (isBlankDraft(draft)) {
      window.location.hash = '#/';
      return;
    }

    const record = await createCharacter(draft.setting, sheetFromDraft(draft));
    window.location.hash = `#/hero/${record.id}`;
  };

  return (
    <div className="newchar">
      <div className="newchar__sheet" aria-hidden={open || undefined}>
        <SheetScreen character={character} />
      </div>
      {open && (
        <CharacterWizard
          draft={draft}
          onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          onSkip={() => void finish()}
        />
      )}
    </div>
  );
}
