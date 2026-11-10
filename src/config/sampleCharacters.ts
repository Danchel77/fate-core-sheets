import { Character } from '../types/character';
import { createNewCharacter } from '../utils/fateMath';

export const SAMPLE_CHARACTERS: Character[] = [
  {
    ...createNewCharacter('witcher', 'Геральт из Ривии'),
    id: 'char_sample_geralt',
    avatar: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=400&auto=format&fit=crop&q=80',
    aspects: {
      high_concept: 'Опытный ведьмак Школы Волка',
      trouble: '«Зло — это зло. Меньшее, большее, среднее...»',
      aspect_3: 'Серебряный меч для чудовищ, стальной — для людей',
      aspect_4: 'Связан Предназначением с Цири',
      aspect_5: 'Тяжелый вздох и сарказм скрывают доброе сердце',
    },
    skills: {
      4: ['fight'], // +4 Ближний бой
      3: ['notice', 'physique'], // +3 Внимание, Телосложение
      2: ['bestiary', 'alchemy', 'athletics'], // +2 Бестиарий, Алхимия, Атлетика
      1: ['stealth', 'ride', 'will', 'investigate'], // +1 Скрытность, Верховая езда, Воля, Расследование
    },
    stunts: [
      {
        id: 'stunt_igni',
        name: 'Знак Игни',
        template: 'bonus',
        description: 'Потому что я владею Знаком Игни, я получаю +2 к созданию преимущества с помощью Магии при поджоге врагов.',
      },
      {
        id: 'stunt_quen',
        name: 'Знак Квен',
        template: 'swap',
        description: 'Потому что я использую защитный щит Квен, я могу использовать Магию вместо Атлетики для защиты от мощных физических ударов.',
      },
      {
        id: 'stunt_potions',
        name: 'Ведьмачья фармакопея',
        template: 'special',
        description: 'Раз за сцену я могу принять эликсир и сразу очистить 1 ячейку физического стресса.',
      }
    ],
    description: 'Белый Волк, Мясник из Блавикена. Мутант с желтыми кошачьими глазами.',
    refresh: 3,
    currentFatePoints: 3,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    ...createNewCharacter('witcher', 'Йеннифэр из Венгерберга'),
    id: 'char_sample_yennefer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    aspects: {
      high_concept: 'Могущественная чародейка из Ложи',
      trouble: 'Запах сирени и крыжовника, скрывающий гордыню и ранимость',
      aspect_3: 'Хаос подчиняется воле сильнейших',
      aspect_4: 'Материнская привязанность к Цири',
      aspect_5: 'Сложные узы любви с Белым Волком',
    },
    skills: {
      4: ['magic'], // +4 Магия
      3: ['will', 'deceive'], // +3 Воля, Обман
      2: ['rapport', 'notice', 'provoke'], // +2 Контакт, Внимание, Провокация
      1: ['investigate', 'contacts', 'ride', 'fight'], // +1 Расследование, Связи, Верховая езда, Фехтование
    },
    stunts: [
      {
        id: 'stunt_teleport',
        name: 'Врата Хаоса (Телепортация)',
        template: 'special',
        description: 'Потратив 1 жетон Fate, могу мгновенно переместиться сама или переместить союзников в безопасную зону сцены.',
      },
      {
        id: 'stunt_glamour',
        name: 'Иллюзорный морок',
        template: 'bonus',
        description: '+2 к преодолению препятствий с помощью Обмана, когда использую магические иллюзии и очарование.',
      }
    ],
    description: 'Черные локоны, фиалковые глаза и обсидиановая звезда на шее.',
    refresh: 3,
    currentFatePoints: 3,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    ...createNewCharacter('universal', 'Майлз «Тень» Корделл'),
    id: 'char_sample_miles',
    aspects: {
      high_concept: 'Частный сыщик с безупречной интуицией',
      trouble: 'Долги местному криминальному синдикату',
      aspect_3: '«Улицы этого города говорят со мной»',
      aspect_4: 'Верный револьвер 38-го калибра',
      aspect_5: 'Никогда не бросает начатое дело',
    },
    skills: {
      4: ['investigate'], // +4 Расследование
      3: ['notice', 'shoot'], // +3 Внимание, Стрельба
      2: ['contacts', 'stealth', 'will'], // +2 Контакты, Скрытность, Воля
      1: ['athletics', 'physique', 'fight', 'drive'], // +1 Атлетика, Телосложение, Драка, Вождение
    },
    stunts: [
      {
        id: 'stunt_eye',
        name: 'Острый глаз сыщика',
        template: 'bonus',
        description: '+2 к Расследованию при поиске скрытых улик на месте преступления.',
      }
    ],
    description: 'Потертый плащ, фетровая шляпа и не затухающая сигарета.',
    refresh: 3,
    currentFatePoints: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];
