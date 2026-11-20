import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { AccountButton } from '../components/AccountButton';
import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
import { StressBlock } from '../components/StressBlock';
import { ExtrasBlock } from '../components/ExtrasBlock';
import { IconArrowLeft } from '../components/icons';
import { PortraitDialog } from '../components/PortraitDialog';
import { SheetExport } from '../components/SheetExport';
import { CharacterWizard, type WizardDraft } from '../components/CharacterWizard';
import { draftFromCharacter, patchFromDraft } from '../components/wizardDraft';
import { physicalStress, mentalStress } from '../data/characters';
import { openAuthDialog } from '../firebase/authStore';
import { shareCharacter, useCharacters } from '../data/store';
import type { Character, CharacterPatch, CharacterRecord, SettingId } from '../data/types';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

type Props = {
  character: Character;
  setting: SettingId;
  /** Запись нужна для экспорта; в предпросмотре нового героя её ещё нет. */
  record?: CharacterRecord;
  /** Правка листа уходит в хранилище сразу, без кнопки «Сохранить». */
  onPatch?: (patch: CharacterPatch) => void;
  /** Чужой лист: без правок и конструктора; в шапке — пометка владельца. */
  readOnly?: boolean;
  /** Пометка в шапке: на чужом листе «лист другого игрока» и «Добавить себе». */
  header?: ReactNode;
};

function shareUrl(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/s/${token}`;
}

/** Собранный веб-лист: единственный источник правды. */
export default function SheetScreen({
  character,
  setting,
  record,
  onPatch,
  readOnly = false,
  header,
}: Props) {
  const [portrait, setPortrait] = useState(character.portrait);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [editor, setEditor] = useState<WizardDraft | null>(null);
  const [revision, setRevision] = useState(0);
  const [shareBusy, setShareBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { mode } = useCharacters();

  useEffect(() => {
    setPortrait(character.portrait);
  }, [character.portrait]);

  /* Сообщение о ссылке живёт пару секунд и само гаснет. */
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

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

  /* Ссылка не открывает окно: она сразу ложится в буфер, а мы показываем плашку. */
  const copyShare = async (token: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setToast('Ссылка скопирована в буфер обмена');
    } catch {
      setToast('Не удалось скопировать ссылку');
    }
  };

  const openShare = () => {
    if (!record || shareBusy) return;
    /* Ссылку создаёт только владелец с аккаунтом: без входа сразу зовём войти. */
    if (mode !== 'cloud') {
      openAuthDialog();
      return;
    }
    if (record.share) {
      void copyShare(record.share);
      return;
    }
    setShareBusy(true);
    shareCharacter(record.id)
      .then((token) => copyShare(token))
      .catch((error) => {
        if (error instanceof Error && error.message === 'share-needs-auth') {
          openAuthDialog();
        } else {
          setToast('Не получилось создать ссылку');
        }
      })
      .finally(() => setShareBusy(false));
  };

  const pages = (
    <>
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
    </>
  );

  return (
    <div
      className={`table${readOnly ? ' table--readonly' : ''}`}
      data-theme={setting}
      style={{ '--sheet-texture': PAPER_TEXTURE } as CSSProperties}
    >
      <nav className={header ? 'sheet-nav sheet-nav--note' : 'sheet-nav'}>
        <a href="#/">
          <IconArrowLeft />
          <span className="sheet-nav__label">Мои персонажи</span>
          <span className="sheet-nav__label-short">Персонажи</span>
        </a>
        {header}
        <div className="sheet-nav__actions">
          {record && <SheetExport record={record} onShare={readOnly ? undefined : openShare} />}
          {!readOnly && onPatch && (
            <button type="button" className="sheet-nav__btn" onClick={openEditor}>
              Конструктор
            </button>
          )}
          <AccountButton variant="sheet" />
        </div>
      </nav>
      <div className="book-stage">
        <div className="book-cover">
          <main className="book" aria-label="Лист персонажа" key={revision}>
            {readOnly ? (
              <fieldset className="sheet-lock" disabled>
                {pages}
              </fieldset>
            ) : (
              pages
            )}
          </main>
        </div>
        <span className="book-ribbon" aria-hidden="true" />
      </div>
      {portraitOpen && !readOnly && (
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
      {toast && (
        <div className="sheet-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
