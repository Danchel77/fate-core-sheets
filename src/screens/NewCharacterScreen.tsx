import { useMemo, useState } from 'react';
import { createCharacter } from '../data/store';
import { CharacterWizard, type WizardDraft } from '../components/CharacterWizard';
import { EMPTY_DRAFT, sheetFromDraft } from '../components/wizardDraft';
import SheetScreen from './SheetScreen';

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

    const record = await createCharacter(draft.setting, sheetFromDraft(draft));
    window.location.hash = `#/hero/${record.id}`;
  };

  return (
    <div className="newchar">
      <div className="newchar__sheet" aria-hidden={open || undefined}>
        <SheetScreen character={character} setting={draft.setting} />
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
