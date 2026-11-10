import { SkillDefinition } from '../types/fate';
import { SettingType } from '../types/character';

export const FATE_LADDER = [
  { level: 8, nameRu: 'Легендарно (+8)', nameEn: 'Legendary' },
  { level: 7, nameRu: 'Эпически (+7)', nameEn: 'Epic' },
  { level: 6, nameRu: 'Фантастически (+6)', nameEn: 'Fantastic' },
  { level: 5, nameRu: 'Великолепно (+5)', nameEn: 'Superb' },
  { level: 4, nameRu: 'Отлично (+4)', nameEn: 'Great' },
  { level: 3, nameRu: 'Хорошо (+3)', nameEn: 'Good' },
  { level: 2, nameRu: 'Неплохо (+2)', nameEn: 'Fair' },
  { level: 1, nameRu: 'Средне (+1)', nameEn: 'Average' },
  { level: 0, nameRu: 'Так себе (0)', nameEn: 'Mediocre' },
  { level: -1, nameRu: 'Плохо (-1)', nameEn: 'Poor' },
  { level: -2, nameRu: 'Ужасно (-2)', nameEn: 'Terrible' },
];

export const UNIVERSAL_SKILLS: SkillDefinition[] = [
  { id: 'athletics', nameRu: 'Атлетика', nameEn: 'Athletics', category: 'physical', description: 'Бег, прыжки, уклонение в бою, физическая координация.' },
  { id: 'fight', nameRu: 'Драка', nameEn: 'Fight', category: 'physical', description: 'Ближний бой холодным оружием и рукопашная.' },
  { id: 'shoot', nameRu: 'Стрельба', nameEn: 'Shoot', category: 'physical', description: 'Стрельба из луков, арбалетов, метательное и огнестрельное оружие.' },
  { id: 'physique', nameRu: 'Сложение', nameEn: 'Physique', category: 'physical', description: 'Грубая сила, выносливость, определяет коробки физического стресса.' },
  { id: 'stealth', nameRu: 'Скрытность', nameEn: 'Stealth', category: 'physical', description: 'Незаметное передвижение, маскировка, спрятаться в тени.' },
  { id: 'drive', nameRu: 'Транспорт', nameEn: 'Drive', category: 'physical', description: 'Управление повозками, автомобилями, кораблями.' },
  
  { id: 'notice', nameRu: 'Внимательность', nameEn: 'Notice', category: 'mental', description: 'Наблюдательность, готовность к опасности, реакция.' },
  { id: 'investigate', nameRu: 'Расследование', nameEn: 'Investigate', category: 'mental', description: 'Поиск улик, глубокий анализ места событий, дедукция.' },
  { id: 'lore', nameRu: 'Знания', nameEn: 'Lore', category: 'mental', description: 'Эрудиция, академические науки, история, мистика и магия.' },
  { id: 'crafts', nameRu: 'Ремесло', nameEn: 'Crafts', category: 'mental', description: 'Создание, починка и модификация предметов и механизмов.' },
  { id: 'will', nameRu: 'Воля', nameEn: 'Will', category: 'mental', description: 'Ментальная стойкость, решимость, определяет ментальный стресс.' },
  
  { id: 'burglary', nameRu: 'Воровство', nameEn: 'Burglary', category: 'physical', description: 'Взлом замков, карманные кражи, обход систем безопасности.' },
  { id: 'contacts', nameRu: 'Контакты', nameEn: 'Contacts', category: 'social', description: 'Связи в обществе, слухи, поиск нужных людей.' },
  { id: 'deceive', nameRu: 'Обман', nameEn: 'Deceive', category: 'social', description: 'Ложь, маскировка, отвлечение внимания, блеф.' },
  { id: 'empathy', nameRu: 'Проницательность', nameEn: 'Empathy', category: 'social', description: 'Чтение эмоций и мотивов людей, обнаружение лжи.' },
  { id: 'provoke', nameRu: 'Провокация', nameEn: 'Provoke', category: 'social', description: 'Запугивание, ментальное давление, вывод из равновесия.' },
  { id: 'rapport', nameRu: 'Общение', nameEn: 'Rapport', category: 'social', description: 'Обаяние, светская беседа, дипломатия, доверие.' },
  { id: 'resources', nameRu: 'Ресурсы', nameEn: 'Resources', category: 'social', description: 'Богатство, снаряжение, способность купить нужное.' },
];

export const WITCHER_SKILLS: SkillDefinition[] = [
  // Физические
  { id: 'athletics', nameRu: 'Атлетика', nameEn: 'Athletics', category: 'physical', description: 'Бег, прыжки, акробатика, уклонение от ударов чудовищ.' },
  { id: 'fight', nameRu: 'Ближний бой', nameEn: 'Fight', category: 'physical', description: 'Стальной и серебряный мечи, топоры, кулачный бой.' },
  { id: 'shoot', nameRu: 'Стрельба', nameEn: 'Shoot', category: 'physical', description: 'Луки, арбалеты, метательные ножи и бомбы.' },
  { id: 'stealth', nameRu: 'Скрытность', nameEn: 'Stealth', category: 'physical', description: 'Бесшумное движение, засады, маскировка.' },
  { id: 'ride', nameRu: 'Верховая езда', nameEn: 'Ride', category: 'physical', description: 'Управление лошадью, бой верхом, погони.' },
  { id: 'physique', nameRu: 'Телосложение', nameEn: 'Physique', category: 'physical', description: 'Сила, выносливость, стойкость к ядам и эликсирам; физический стресс.' },

  // Ментальные
  { id: 'notice', nameRu: 'Внимание', nameEn: 'Notice', category: 'mental', description: 'Острый слух, кошачьи глаза, восприятие ауры чудовищ.' },
  { id: 'investigate', nameRu: 'Расследование', nameEn: 'Investigate', category: 'mental', description: 'Следы, вскрытие, анализ контракта, сбор улик.' },
  { id: 'bestiary', nameRu: 'Бестиарий', nameEn: 'Bestiary', category: 'mental', description: 'Повадки и слабости монстров, древние легенды, проклятия.' },
  { id: 'alchemy', nameRu: 'Алхимия', nameEn: 'Alchemy', category: 'mental', description: 'Эликсиры, масла, бомбы, яды и травы.' },
  { id: 'magic', nameRu: 'Магия', nameEn: 'Magic', category: 'mental', description: 'Знаки, ритуалы, магические теории и проклятия.' },
  { id: 'will', nameRu: 'Воля', nameEn: 'Will', category: 'mental', description: 'Концентрация для Знаков, защита от чар и ужаса; ментальный стресс.' },

  // Социальные
  { id: 'rapport', nameRu: 'Убеждение', nameEn: 'Rapport', category: 'social', description: 'Доверие, дипломатия, светская беседа, переговоры.' },
  { id: 'deceive', nameRu: 'Обман', nameEn: 'Deceive', category: 'social', description: 'Ложь, блеф, маскировка, сокрытие мотивов.' },
  { id: 'provoke', nameRu: 'Запугивание', nameEn: 'Provoke', category: 'social', description: 'Угрозы, давление, жёлтые глаза и отрубленные головы.' },
  { id: 'empathy', nameRu: 'Эмпатия', nameEn: 'Empathy', category: 'social', description: 'Чтение эмоций и мотивов, обнаружение лжи.' },
  { id: 'contacts', nameRu: 'Контакты', nameEn: 'Contacts', category: 'social', description: 'Трактирщики, старосты, ростовщики, наёмники.' },
  { id: 'resources', nameRu: 'Ресурсы', nameEn: 'Resources', category: 'social', description: 'Золото, снаряжение, доступ к нужным людям и вещам.' },
];

export type PowerPresetKey = 'start' | 'experienced' | 'veteran';

export const POWER_PRESETS: Record<PowerPresetKey, {
  label: string;
  description: string;
  refresh: number;
  skillCap: number;
}> = {
  start: {
    label: 'Старт',
    description: 'Стандартный стартовый персонаж Fate Core.',
    refresh: 3,
    skillCap: 4,
  },
  experienced: {
    label: 'Опытные',
    description: 'Кампания с несколькими значимыми вехами: выше обновление и потолок.',
    refresh: 4,
    skillCap: 5,
  },
  veteran: {
    label: 'Ветераны',
    description: 'Долгая кампания: персонажи уже прошли серьёзное развитие.',
    refresh: 5,
    skillCap: 6,
  },
};

export const SETTING_PRESETS: Record<SettingType, {
  name: string;
  tagline: string;
  skills: SkillDefinition[];
  defaultAspectSuggestions: {
    highConcept: string[];
    trouble: string[];
    others: string[];
  };
}> = {
  witcher: {
    name: 'Ведьмак / Тёмное фэнтези',
    tagline: 'Мир Неверленда: серебряные мечи, чудовища, монеты и моральная серость',
    skills: WITCHER_SKILLS,
    defaultAspectSuggestions: {
      highConcept: [
        'Ведьмак Школы Волка старой закалки',
        'Бывший наемник «Вольной компании» из Темерии',
        'Молодая чародейка, скрывающаяся от Охотников за колдуньями',
        'Краснолюдский ветеран битвы при Бренне',
        'Эльфийский следопыт скоя’таэлей из Дол Блатанна',
        'Циничный бродячий алхимик с сомнительным прошлым',
      ],
      trouble: [
        'Мутации пугают простых кметов',
        'Тяжелый долг перед мафией Новиграда',
        'Кодекс ведьмака не позволяет убивать разумных существ',
        'Охотники за головами по пятам',
        'Вспыльчив, когда оскорбляют нелюдей',
        'Зависимость от боевых эликсиров и фисштеха',
      ],
      others: [
        '«Чеканная монета вперед, монстр — потом»',
        'Серебряный меч доставшийся от погибшего наставника',
        'Трактирщики в Вызиме знают меня как надежного человека',
        'Спасенный когда-то кмет теперь служит мне верным проводником',
        'Истинное чудовище — это всегда человек',
      ]
    }
  },
  universal: {
    name: 'Классический Fate Core (Универсал)',
    tagline: 'Нейтральная система правил для любого сеттинга: от космоса до детектива',
    skills: UNIVERSAL_SKILLS,
    defaultAspectSuggestions: {
      highConcept: [
        'Упрямый частный детектив старой школы',
        'Капитан потрепанного контрабандистского фрегата',
        'Блестящий ученый-кибернетик с темным секретом',
        'Рыцарь ордена, верный клятве защищать слабых',
      ],
      trouble: [
        'Никогда не могу пройти мимо несправедливости',
        'В розыске властями за преступление, которого не совершал',
        'Любопытство побеждает инстинкт самосохранения',
        'Должен огромную сумму местному синдикату',
      ],
      others: [
        'Верный старый револьвер с гравировкой',
        'Моя команда — моя единственная семья',
        'Знаю темную изнанку каждого мегаполиса',
        'Слово чести дороже золота',
      ]
    }
  }
};
