import type { SettingId } from '../types';
import type { NameGroup, SettingConfig } from './types';
import { fateSetting } from './fate';
import { witcherSetting } from './witcher';

/**
 * Все сеттинги проекта одним списком.
 *
 * Чтобы добавить новый: положите рядом файл с `SettingConfig`, допишите его
 * сюда и расширьте `SettingId` в `src/data/types.ts`. Больше нигде списки
 * навыков и имён не хранятся.
 */
export const SETTINGS: Record<SettingId, SettingConfig> = {
  fate: fateSetting,
  witcher: witcherSetting,
};

export function settingConfig(id: SettingId): SettingConfig {
  return SETTINGS[id];
}

/** Группы имён, в которых есть хотя бы одно имя для выбранного пола. */
export function nameGroupsFor(
  id: SettingId,
  gender: 'male' | 'female' | 'any',
): NameGroup[] {
  const groups = settingConfig(id).nameGroups;
  if (gender === 'any') return groups;
  return groups.filter((group) => group.genders.includes(gender));
}

export type { NameGroup, SettingConfig };
