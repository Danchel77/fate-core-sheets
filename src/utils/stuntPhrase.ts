import { ACTION_LABELS } from '../config/skillActions';
import type { ActionType, CharacterStunt, StuntTemplate } from '../types/fate';

export interface StuntPhraseInput {
  name?: string;
  template?: StuntTemplate;
  skillId?: string;
  action?: ActionType;
  situation?: string;
  swapFromSkillId?: string;
  swapToSkillId?: string;
  trigger?: string;
  effect?: string;
  frequency?: string;
}

/**
 * Проверяет, заполнены ли обязательные поля для сохранения трюка:
 * - name не пустое;
 * - bonus: skillId, action, situation;
 * - swap: swapFromSkillId, swapToSkillId, situation;
 * - special: trigger, effect.
 */
export function isStuntDraftComplete(
  draft: Partial<CharacterStunt> | StuntPhraseInput
): boolean {
  if (!draft.name?.trim()) return false;
  if (!draft.template) return false;

  switch (draft.template) {
    case 'bonus':
      return Boolean(
        draft.skillId?.trim() &&
        draft.action &&
        draft.situation?.trim()
      );
    case 'swap':
      return Boolean(
        draft.swapFromSkillId?.trim() &&
        draft.swapToSkillId?.trim() &&
        draft.situation?.trim()
      );
    case 'special':
      return Boolean(
        draft.trigger?.trim() &&
        draft.effect?.trim()
      );
    default:
      return false;
  }
}

/**
 * Генерирует готовую формулировку трюка для листа персонажа:
 * - bonus: +2 к действию «{ACTION_LABELS[action]}» навыком «{skillName}»: {situation}.
 * - swap: Могу использовать «{fromName}» вместо «{toName}»: {situation}.
 * - special: {Частота}, когда {trigger}, могу {effect}.
 *
 * Если обязательные поля для шаблона не заполнены, возвращает пустую строку.
 */
export function buildStuntDescription(
  stunt: Partial<CharacterStunt> | StuntPhraseInput,
  skillNames: Record<string, string>
): string {
  if (!stunt.template) return '';

  if (stunt.template === 'bonus') {
    if (!stunt.action || !stunt.skillId?.trim() || !stunt.situation?.trim()) {
      return '';
    }
    const actionLabel = ACTION_LABELS[stunt.action];
    const skillName = skillNames[stunt.skillId] || stunt.skillId;
    const cleanSituation = stunt.situation
      .trim()
      .replace(/^(?:когда|если)\s+/i, '')
      .replace(/\.+$/, '');
    if (!actionLabel || !skillName || !cleanSituation) return '';
    return `+2 к действию «${actionLabel}» навыком «${skillName}»: ${cleanSituation}.`.trim();
  }

  if (stunt.template === 'swap') {
    if (!stunt.swapFromSkillId?.trim() || !stunt.swapToSkillId?.trim() || !stunt.situation?.trim()) {
      return '';
    }
    const fromName = skillNames[stunt.swapFromSkillId] || stunt.swapFromSkillId;
    const toName = skillNames[stunt.swapToSkillId] || stunt.swapToSkillId;
    const cleanSituation = stunt.situation
      .trim()
      .replace(/^(?:когда|если)\s+/i, '')
      .replace(/\.+$/, '');
    if (!fromName || !toName || !cleanSituation) return '';
    return `Могу использовать «${fromName}» вместо «${toName}»: ${cleanSituation}.`.trim();
  }

  if (stunt.template === 'special') {
    if (!stunt.trigger?.trim() || !stunt.effect?.trim()) {
      return '';
    }
    const rawFreq = stunt.frequency?.trim() || 'Раз за сцену';
    const frequency = rawFreq.charAt(0).toUpperCase() + rawFreq.slice(1);
    const cleanTrigger = stunt.trigger.trim().replace(/^когда\s+/i, '').replace(/,+$/, '');
    const cleanEffect = stunt.effect.trim().replace(/^могу\s+/i, '').replace(/\.+$/, '');
    if (!cleanTrigger || !cleanEffect) return '';
    return `${frequency}, когда ${cleanTrigger}, могу ${cleanEffect}.`.trim();
  }

  return '';
}
