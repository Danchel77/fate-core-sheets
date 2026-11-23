import type { SettingId } from '../types';

export type NameGender = 'male' | 'female';

/** Группа имён одного типа персонажа внутри сеттинга. */
export type NameGroup = {
  id: string;
  label: string;
  /** Какие полы бывают у этого типа: у ведьмаков — только мужской. */
  genders: NameGender[];
  names: { male: string[]; female: string[] };
  /** Добавлять ли к имени «из королевства». */
  kingdom?: boolean;
};

/**
 * Конфигурация сеттинга: всё, что отличает один мир от другого.
 * Добавить новый сеттинг — значит добавить такой файл и строку в `index.ts`.
 */
export type SettingConfig = {
  id: SettingId;
  title: string;
  skills: string[];
  /** Подсказки, которые отличаются от общего списка (например, «Скрытность» в «Ведьмаке»). */
  skillHints?: Record<string, string>;
  nameGroups: NameGroup[];
  kingdoms: string[];
};
