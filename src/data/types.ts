/** Типы листа персонажа и сохранённой записи. Единственный источник правды для формы данных. */

export type SettingId = 'fate' | 'witcher';

export type Aspect = { label: string; text: string };
export type Stunt = { name: string; text: string };
export type LadderRow = { value: number; skills: string[] };

/** Отметки стресса: true — ячейка занята. Число ячеек считается из навыков, не хранится. */
export type StressMarks = { physical: boolean[]; mental: boolean[] };

export type Consequence = { value: number; kind: string; text: string };

export type Character = {
  name: string;
  description: string;
  portrait: string;
  /** Уровень героя: от него зависят доступные очки навыков. */
  level: number;
  /** Базовое обновление: трюки сверх трёх его уменьшают. */
  refresh: number;
  fatePoints: number;
  aspects: Aspect[];
  ladder: LadderRow[];
  stunts: Stunt[];
  extras: [string, string];
  extraTitles: [string, string];
  marks: StressMarks;
  consequences: Consequence[];
};

/** Сохранённый герой: то, что нужно карточке списка, плюс полный лист. */
export type CharacterRecord = {
  id: string;
  setting: SettingId;
  createdAt: string;
  updatedAt: string;
  sheet: Character;
};

/** Правка листа: блок отдаёт только изменившиеся поля. */
export type CharacterPatch = Partial<Character>;
