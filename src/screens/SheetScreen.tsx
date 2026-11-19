import { useEffect, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
import { StressBlock } from '../components/StressBlock';
import { ExtrasBlock } from '../components/ExtrasBlock';
import { IconArrowLeft } from '../components/icons';
import { PortraitDialog } from '../components/PortraitDialog';
import { CharacterWizard, type WizardDraft } from '../components/CharacterWizard';
import { draftFromCharacter, patchFromDraft } from '../components/wizardDraft';
import { physicalStress, mentalStress } from '../data/characters';
import type { Character, CharacterPatch, SettingId } from '../data/types';

type Props = {
  character: Character;
  setting: SettingId;
  /** Правка листа уходит в хранилище сразу, без кнопки «Сохранить». */
  onPatch?: (patch: CharacterPatch) => void;
};

/** Собранный веб-лист: единственный источник правды. */
export default function SheetScreen({ character, setting, onPatch }: Props) {
  const [portrait, setPortrait] = useState(character.portrait);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [editor, setEditor] = useState<WizardDraft | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setPortrait(character.portrait);
  }, [character.portrait]);

  const changePortrait = (next: string) => {
    setPortrait(next);
    onPatch?.({ portrait: next });
  };

  const openEditor = () => setEditor(draftFromCharacter(character, setting));

  /* Окно правит имя, аспекты, навыки, трюки и портрет; закрытие сохраняет. */
  const closeEditor = () => {
    if (editor) onPatch?.(patchFromDraft(character, editor));
    setEditor(null);
    setRevision((value) => value + 1);
  };

  return (
    <div className="table">
      <nav className="sheet-nav">
        <a href="#/">
          <IconArrowLeft />
          <span className="sheet-nav__label">Мои персонажи</span>
          <span className="sheet-nav__label-short">Персонажи</span>
        </a>
        {onPatch && (
          <div className="sheet-nav__actions">
            <button type="button" className="sheet-nav__btn" onClick={openEditor}>
              Конструктор
            </button>
            <AccountButton variant="sheet" />
          </div>
        )}
      </nav>
      <main className="book" aria-label="Лист персонажа" key={revision}>
        <article className="page page--left">
          <CharacterBlock
            character={character}
            portrait={portrait}
            onPortraitClick={() => setPortraitOpen(true)}
            onPatch={onPatch}
          />
          <StressBlock
            physical={physicalStress(character)}
            mental={mentalStress(character)}
            consequences={character.consequences}
            marks={character.marks}
            onChange={onPatch}
          />
          <AspectBlock aspects={character.aspects} onChange={(aspects) => onPatch?.({ aspects })} />
        </article>

        <article className="page page--right">
          <SkillsEditor
            setting={setting}
            initial={character.ladder}
            initialLevel={character.level}
            onChange={({ ladder, level }) => onPatch?.({ ladder, level })}
          />
          <StuntBlock
            stunts={character.stunts}
            baseRefresh={character.refresh}
            onChange={(stunts) => onPatch?.({ stunts })}
          />
          <ExtrasBlock
            initial={character.extras}
            initialTitles={character.extraTitles}
            onChange={(extras, extraTitles) => onPatch?.({ extras, extraTitles })}
          />
        </article>
      </main>
      {portraitOpen && (
        <PortraitDialog
          src={portrait}
          alt={`Портрет: ${character.name || 'персонаж'}`}
          onClose={() => setPortraitOpen(false)}
          onChange={changePortrait}
        />
      )}
      {editor && (
        <CharacterWizard
          draft={editor}
          onChange={(patch) => setEditor((prev) => (prev ? { ...prev, ...patch } : prev))}
          onSkip={closeEditor}
          lockedSetting
        />
      )}
    </div>
  );
}
