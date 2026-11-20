import { createEmptyCharacter, ladderFromPicks } from '../data/characters';
import type { Character, CharacterPatch, SettingId, Stunt } from '../data/types';
import type { WizardDraft } from './CharacterWizard';

/** Пустой черновик нового героя. */
export const EMPTY_DRAFT: WizardDraft = {
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
export function filledStunts(draft: WizardDraft): Stunt[] {
  return draft.stunts
    .map((stunt) => ({ name: stunt.name.trim(), text: stunt.text.trim() }))
    .filter((stunt) => stunt.name.length > 0 || stunt.text.length > 0);
}

/** Черновик нового героя превращается в лист: то, что игрок уже вписал, видно под окном. */
export function sheetFromDraft(draft: WizardDraft): Character {
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

/** Готовый герой раскладывается обратно в черновик: окно открывается с первого шага. */
export function draftFromCharacter(character: Character, setting: SettingId): WizardDraft {
  return {
    setting,
    name: character.name,
    concept: character.aspects[0]?.text ?? '',
    trouble: character.aspects[1]?.text ?? '',
    aspects: [
      character.aspects[2]?.text ?? '',
      character.aspects[3]?.text ?? '',
      character.aspects[4]?.text ?? '',
    ],
    skills: character.ladder.flatMap((row) =>
      row.skills.map((name) => ({ name, value: row.value })),
    ),
    stunts: character.stunts.map((stunt) => ({ ...stunt })),
    portrait: character.portrait,
  };
}

/**
 * Правки черновика возвращаются в лист. Окно трогает только то, что собирает:
 * имя, портрет, аспекты, пирамиду и трюки. Описание, дополнения, стресс,
 * последствия и жетоны остаются как были.
 */
export function patchFromDraft(character: Character, draft: WizardDraft): CharacterPatch {
  const texts = [
    draft.concept,
    draft.trouble,
    draft.aspects[0] ?? '',
    draft.aspects[1] ?? '',
    draft.aspects[2] ?? '',
  ];

  return {
    name: draft.name,
    portrait: draft.portrait,
    stunts: filledStunts(draft),
    ladder: ladderFromPicks(draft.skills),
    aspects: character.aspects.map((aspect, index) => ({
      ...aspect,
      text: texts[index] ?? aspect.text,
    })),
  };
}
