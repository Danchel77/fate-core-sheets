import { demoCharacter } from './demoCharacter';
import type { Character, LadderRow, Stunt } from './types';

const BASE = import.meta.env.BASE_URL;

export type SettingId = 'fate' | 'witcher';

/** Запись списка: то, что нужно карточке, плюс полный лист героя. */
export type CharacterRecord = {
  id: string;
  name: string;
  concept: string;
  level: number;
  setting: SettingId;
  createdAt: string;
  portrait?: string;
  sheet: Character;
};

/** Навыки для демонстрационных героев: свой набор под сеттинг. */
const SKILLS: Record<SettingId, string[]> = {
  fate: [
    'Драка',
    'Стрельба',
    'Воля',
    'Внимательность',
    'Провокация',
    'Эмпатия',
    'Обман',
    'Атлетика',
    'Знания',
    'Ремесло',
    'Ресурсы',
    'Контакты',
  ],
  witcher: [
    'Драка',
    'Магия',
    'Внимательность',
    'Скрытность',
    'Воля',
    'Атлетика',
    'Выживание',
    'Монстрология',
    'Знания',
    'Эмпатия',
    'Верховая езда',
    'Ресурсы',
  ],
};

/** Пирамида навыков под уровень героя: одна вершина, дальше по нарастающей. */
function buildLadder(level: number, setting: SettingId): LadderRow[] {
  const pool = SKILLS[setting];
  const rows: LadderRow[] = [];
  let cursor = 0;
  for (let value = level; value >= 1; value -= 1) {
    const count = level - value + 1;
    rows.push({ value, skills: pool.slice(cursor, cursor + count) });
    cursor += count;
  }
  return rows;
}

type Demo = {
  id: string;
  name: string;
  concept: string;
  description: string;
  level: number;
  setting: SettingId;
  createdAt: string;
  portrait?: string;
  problem: string;
  adventure: string;
  tieOne: string;
  tieTwo: string;
  stunts: [string, string][];
  extras: [string, string];
};

const DEMO: Demo[] = [
  {
    id: 'mira',
    name: 'Мира Тихая',
    concept: 'Картограф, которая никогда не возвращается тем же путём',
    description:
      'Картограф из вольного города. Рисует дороги, которых нет на чужих картах, и знает цену каждой ошибке.',
    level: 2,
    setting: 'fate',
    createdAt: '2026-11-15',
    problem: '«Я не могу вернуться назад»',
    adventure: 'Карта, нарисованная по памяти',
    tieOne: 'Учитель, оставшийся за рекой',
    tieTwo: 'Компас, который показывает не север',
    stunts: [
      ['Чутьё дороги', '+2 к Выживанию, когда она ищет путь в незнакомой местности.'],
      ['Твёрдая рука', 'Рисует карту на ходу и не теряет ни одной детали.'],
    ],
    extras: ['Планшет с картами, уголь и компас.', 'Города помнят её под разными именами.'],
  },
  {
    id: 'darin',
    name: 'Дарин Камнебород',
    concept: 'Кузнец, потерявший клан в подгорном пожаре',
    description:
      'Кузнец из подгорного дома, который потерял клан в пожаре и учится жить заново на поверхности.',
    level: 1,
    setting: 'fate',
    createdAt: '2026-11-13',
    problem: '«Мой клан сгорел, а я остался»',
    adventure: 'Молот, вынесенный из огня',
    tieOne: 'Сестра, которая считает его мёртвым',
    tieTwo: 'Заказчик, который платит вперёд',
    stunts: [
      ['Кузнечное чутьё', '+2 к Ремеслу, когда он работает с металлом.'],
      ['Тяжёлая рука', 'Оружие его работы не ломается в бою.'],
    ],
    extras: ['Молот, клещи и сумка с заготовками.', 'В каждом городе у него есть должники.'],
  },
  {
    id: 'elara',
    name: 'Элара Ночная Пряха',
    concept: 'Жрица, которой боги отвечают шёпотом',
    description:
      'Жрица, которой боги отвечают шёпотом — и не всегда понятно, чего они на самом деле хотят.',
    level: 2,
    setting: 'fate',
    createdAt: '2026-11-11',
    problem: '«Я слышу их, но не понимаю»',
    adventure: 'Ночь, когда статуя заговорила',
    tieOne: 'Храм, который её изгнал',
    tieTwo: 'Мальчик, которого она вывела из чумы',
    stunts: [
      ['Шёпот богов', '+2 к Эмпатии, когда она слушает чужую боль.'],
      ['Свет в ладонях', 'Освещает комнату без огня.'],
    ],
    extras: ['Амулет и книга молитв.', 'Изгнана из храма, но не из веры.'],
  },
  {
    id: 'yennefer',
    name: 'Йеннифэр из Венгерберга',
    concept: 'Чародейка, готовая сжечь мир ради тех, кого любит',
    description:
      'Чародейка из Венгерберга. Умная, опасная и совершенно не переносит, когда её недооценивают.',
    level: 3,
    setting: 'witcher',
    createdAt: '2026-11-09',
    problem: '«Я не позволю собой управлять»',
    adventure: 'Как я выкупила себя у судьбы',
    tieOne: 'Геральт — тот, кому она позволяет себя знать',
    tieTwo: 'Ложа чародеек, которая ей не доверяет',
    stunts: [
      ['Портал', 'Открывает проход в знакомое место.'],
      ['Чародейский щит', '+2 к Воле против магии.'],
    ],
    extras: ['Флакон духов и кольцо с аметистом.', 'Долги, которые она не собирается платить.'],
  },
  {
    id: 'ciri',
    name: 'Цири',
    concept: 'Дитя Предназначения, которое бежит от своей судьбы',
    description:
      'Дитя Предназначения. Умеет исчезать между мирами и боится остаться на одном месте.',
    level: 3,
    setting: 'witcher',
    createdAt: '2026-11-06',
    problem: '«Я не знаю, где мой дом»',
    adventure: 'Побег из Каэр Морхена',
    tieOne: 'Геральт — отец, которого она выбрала',
    tieTwo: 'Йеннифэр — та, кто её учила',
    stunts: [
      ['Прыжок между мирами', 'Уходит из опасного места, потратив очко судьбы.'],
      ['Клинок Ласточки', '+2 к Драке, когда она защищает кого-то.'],
    ],
    extras: ['Меч Ласточка и старый шарф.', 'За ней охотятся те, кто знает про её кровь.'],
  },
  {
    id: 'geralt',
    name: 'Геральт из Ривии',
    concept: 'Ведьмак, который не берёт денег с бедных',
    description: demoCharacter.description,
    level: 4,
    setting: 'witcher',
    createdAt: '2026-11-02',
    portrait: `${BASE}assets/portraits/geralt.jpg`,
    problem: '«Меня все ненавидят»',
    adventure: 'Как я снял проклятие со стрыги',
    tieOne: 'Лютик — бард, которого я вытащил из петли',
    tieTwo: 'Йеннифэр — та, с кем нас связала судьба',
    stunts: [
      ['Ведьмачьи чувства', '+2 к Внимательности, когда он выслеживает чудовище по следам.'],
      ['Знак Игни', 'Атака Магией по зоне: поджигает всё в одном секторе.'],
    ],
    extras: [
      'Серебряный меч, ведьмачий набор для зелий, пара алхимических бомб.',
      'Лютик знает, где меня искать. Йеннифэр не любит, когда я пропадаю.',
    ],
  },
  {
    id: 'luther',
    name: 'Лютер Вейл',
    concept: 'Дознаватель, который верит записям больше, чем людям',
    description:
      'Дознаватель городской стражи. Верит записям больше, чем людям, и почти всегда оказывается прав.',
    level: 1,
    setting: 'fate',
    createdAt: '2026-10-30',
    problem: '«Я не умею верить на слово»',
    adventure: 'Дело, которое он закрыл слишком быстро',
    tieOne: 'Начальник, который его прикрывает',
    tieTwo: 'Вдова, чей муж оказался невиновен',
    stunts: [
      ['Читаю между строк', '+2 к Внимательности при допросе.'],
      ['Память на детали', 'Помнит всё, что видел на бумаге.'],
    ],
    extras: ['Папка с делами и очки.', 'Его боятся больше, чем преступников.'],
  },
  {
    id: 'triss',
    name: 'Трисс Меригольд',
    concept: 'Чародейка с рыжим характером и слабостью к лисам',
    description:
      'Чародейка с рыжим характером. Лечит, влюбляется и очень не любит, когда её жалеют.',
    level: 3,
    setting: 'witcher',
    createdAt: '2026-10-28',
    problem: '«Я всё ещё боюсь огня»',
    adventure: 'Сражение, после которого остались шрамы',
    tieOne: 'Геральт — друг, которого она не отпустила',
    tieTwo: 'Цех чародеек, который считает её своей',
    stunts: [
      ['Лечащие руки', '+2 к Ремеслу, когда она перевязывает чужую рану.'],
      ['Огненный росчерк', 'Атака Магией по площади.'],
    ],
    extras: ['Сумка с зельями и книга с закладками.', 'В каждом городе у неё есть пациенты.'],
  },
  {
    id: 'osmund',
    name: 'Осмунд Пепел',
    concept: 'Бывший стражник — теперь наёмник и команда одного',
    description:
      'Бывший стражник, который ушёл со службы и теперь работает за монеты, а не за клятву.',
    level: 2,
    setting: 'fate',
    createdAt: '2026-10-25',
    problem: '«Я бросил пост и не жалею»',
    adventure: 'Город, который он не спас',
    tieOne: 'Старый напарник, который остался на службе',
    tieTwo: 'Хозяин таверны, который его кормит',
    stunts: [
      ['Держать строй', '+2 к Драке, когда он прикрывает союзника.'],
      ['Взгляд с порога', 'Замечает оружие раньше, чем лица.'],
    ],
    extras: ['Копьё, щит и поношенный плащ.', 'Знает все лазейки в портовом квартале.'],
  },
];

function buildSheet(demo: Demo): Character {
  const stunts: Stunt[] = demo.stunts.map(([name, text]) => ({ name, text }));
  return {
    name: demo.name,
    description: demo.description,
    portrait: demo.portrait ?? '',
    refresh: 3,
    fatePoints: 3,
    aspects: [
      { label: 'Концепция', text: demo.concept },
      { label: 'Проблема', text: demo.problem },
      { label: 'Первое приключение', text: demo.adventure },
      { label: 'Переплетение судеб', text: demo.tieOne },
      { label: 'Переплетение судеб', text: demo.tieTwo },
    ],
    ladder: buildLadder(demo.level, demo.setting),
    stunts,
    extras: demo.extras,
    physicalStress: demo.level,
    mentalStress: demo.level,
    consequences: [
      { value: 2, kind: 'лёгкое' },
      { value: 4, kind: 'среднее' },
      { value: 6, kind: 'серьёзное' },
    ],
  };
}

/** Демонстрационный список. Настоящее хранилище появится вместе с конструктором. */
export const characters: CharacterRecord[] = DEMO.map((demo) => ({
  id: demo.id,
  name: demo.name,
  concept: demo.concept,
  level: demo.level,
  setting: demo.setting,
  createdAt: demo.createdAt,
  portrait: demo.portrait,
  // Геральт — утверждённый демо-лист: берём его как есть, чтобы лист совпадал с эталоном.
  sheet: demo.id === 'geralt' ? demoCharacter : buildSheet(demo),
}));

export function findCharacter(id: string): CharacterRecord | undefined {
  return characters.find((character) => character.id === id);
}
