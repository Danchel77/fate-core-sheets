const BASE = import.meta.env.BASE_URL;

export type Aspect = { label: string; text: string };
export type Stunt = { name: string; text: string };
export type LadderRow = { value: number; skills: string[] };

export type Character = {
  name: string;
  concept: string;
  description: string;
  portrait: string;
  refresh: number;
  fatePoints: number;
  aspects: Aspect[];
  ladder: LadderRow[];
  stunts: Stunt[];
  extras: string;
  physicalStress: number;
  mentalStress: number;
  consequences: { value: number; kind: string; text?: string }[];
};

/** Демо-персонаж для сборки веб-листа (не сохраняется в хранилище). */
export const demoCharacter: Character = {
  name: 'Геральт из Ривии',
  concept: 'Ведьмак, который не берёт денег с бедных',
  description:
    'Седой ведьмак школы Волка. Два меча: сталь — для людей, серебро — для чудовищ. Умеет читать следы, варить зелья и молчать, когда лучше не говорить.',
  portrait: `${BASE}assets/portraits/geralt.jpg`,
  refresh: 3,
  fatePoints: 3,
  aspects: [
    { label: 'Концепция', text: 'Ведьмак, который не берёт денег с бедных' },
    { label: 'Проблема', text: '«Меня все ненавидят»' },
    { label: 'Первое приключение', text: 'Как я снял проклятие со стрыги' },
    { label: 'Переплетение судеб', text: 'Лютик — бард, которого я вытащил из петли' },
    { label: 'Переплетение судеб', text: 'Йеннифэр — та, с кем нас связала судьба' },
  ],
  ladder: [
    { value: 4, skills: ['Драка'] },
    { value: 3, skills: ['Внимательность', 'Магия'] },
    { value: 2, skills: ['Скрытность', 'Воля', 'Монстрология'] },
    { value: 1, skills: ['Атлетика', 'Верховая езда', 'Знания', 'Телосложение'] },
  ],
  stunts: [
    {
      name: 'Ведьмачьи чувства',
      text: '+2 к Внимательности, когда он выслеживает чудовище по следам.',
    },
    {
      name: 'Знак Игни',
      text: 'Атака Магией по зоне: поджигает всё в одном секторе.',
    },
    {
      name: 'Два меча',
      text: '+2 к Драке, когда противник — чудовище, а не человек.',
    },
  ],
  extras: 'Серебряный меч, ведьмачий набор для зелий, пара алхимических бомб.',
  physicalStress: 2,
  mentalStress: 2,
  consequences: [
    { value: 2, kind: 'лёгкое', text: 'Ссадина на плече' },
    { value: 2, kind: 'лёгкое' },
    { value: 4, kind: 'среднее' },
    { value: 6, kind: 'серьёзное' },
  ],
};

/** Стресс-тест вёрстки: пять навыков на +1 (первая значимая веха). */
export const overflowCharacter: Character = {
  ...demoCharacter,
  ladder: [
    { value: 4, skills: ['Драка'] },
    { value: 3, skills: ['Внимательность', 'Магия'] },
    { value: 2, skills: ['Скрытность', 'Воля', 'Монстрология', 'Ремесло'] },
    { value: 1, skills: ['Атлетика', 'Верховая езда', 'Знания', 'Телосложение', 'Эмпатия'] },
  ],
};

/** Продвинутый герой: планка поднята, ступень +5 доступна. */
export const advancedCharacter: Character = {
  ...demoCharacter,
  ladder: [
    { value: 5, skills: ['Драка'] },
    { value: 4, skills: ['Внимательность'] },
    { value: 3, skills: ['Магия', 'Воля'] },
    { value: 2, skills: ['Скрытность', 'Монстрология', 'Ремесло'] },
    { value: 1, skills: ['Атлетика', 'Верховая езда', 'Знания', 'Эмпатия'] },
  ],
};
