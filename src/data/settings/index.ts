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
export type { NameGroup, SettingConfig };
