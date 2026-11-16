/** Типы листа персонажа. Единственный источник правды для формы данных. */

export type Aspect = { label: string; text: string };
export type Stunt = { name: string; text: string };
export type LadderRow = { value: number; skills: string[] };

export type Character = {
  name: string;
  description: string;
  portrait: string;
  refresh: number;
  fatePoints: number;
  aspects: Aspect[];
  ladder: LadderRow[];
  stunts: Stunt[];
  extras: [string, string];
  physicalStress: number;
  mentalStress: number;
  consequences: { value: number; kind: string; text?: string }[];
};
