import { useMemo, useState } from 'react';
import type { Character } from '../data/types';
import { createEmptyCharacter, ladderFromPicks } from '../data/characters';
import { CharacterWizard, type WizardDraft } from '../components/CharacterWizard';
import SheetScreen from './SheetScreen';

const EMPTY_DRAFT: WizardDraft = {
  setting: 'witcher',
  name: '',
  concept: '',
  trouble: '',
  aspects: ['', '', ''],
  skills: [],
  portrait: '',
};

/** Черновик превращается в лист: то, что игрок уже вписал, видно под окном. */
function sheetFromDraft(draft: WizardDraft): Character {
  return {
    ...createEmptyCharacter(),
    name: draft.name,
    portrait: draft.portrait,
    ladder: ladderFromPicks(draft.skills),
    aspects: [
      { label: 'Концепция', text: draft.concept },
      { label: 'Проблема', text: draft.trouble },
      { label: 'Первое приключение', text: draft.aspects[0] ?? '' },
      { label: 'Переплетение судеб', text: draft.aspects[1] ?? '' },
      { label: 'Переплетение судеб', text: draft.aspects[2] ?? '' },
    ],
  };
}

/**
 * Новый герой: сразу открывается пустой лист, поверх него — конструктор.
 * Опытный игрок закрывает окно и работает с листом напрямую.
 */
export default function NewCharacterScreen() {
  const [draft, setDraft] = useState<WizardDraft>(EMPTY_DRAFT);
  const [open, setOpen] = useState(true);
  const [revision, setRevision] = useState(0);
  const character = useMemo(() => sheetFromDraft(draft), [draft]);

  /* Закрытие перерисовывает лист с нуля, чтобы вписанное попало во все блоки. */
  const close = () => {
    setOpen(false);
    setRevision((value) => value + 1);
  };

  return (
    <div className="newchar">
      <div className="newchar__sheet" aria-hidden={open || undefined}>
        <SheetScreen key={revision} character={character} />
      </div>
      {open && (
        <CharacterWizard
          draft={draft}
          onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          onSkip={close}
        />
      )}
    </div>
  );
}
