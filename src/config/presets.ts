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
  {
    id: 'athletics',
    nameRu: 'Атлетика',
    nameEn: 'Athletics',
    category: 'physical',
    description: 'Бег, прыжки, акробатика, уклонение от ударов чудовищ.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Перепрыгнуть через горящие балки новиградского склада и уйти по черепичным крышам от погони стражников храма.',
      'Увернуться от сокрушительного удара хвоста разъярённого ослизга на скалистых обрывах ветреного архипелага Скеллиге.',
    ],
  },
  {
    id: 'fight',
    nameRu: 'Ближний бой',
    nameEn: 'Fight',
    category: 'physical',
    description: 'Стальной и серебряный мечи, топоры, кулачный бой.',
    actions: ['overcome', 'advantage', 'attack', 'defend'],
    examples: [
      'Отразить серебряным клинком серию молниеносных выпадов вампирши-бруксы посреди полуразрушенного родового склепа в Вызиме.',
      'Порубить шайку нильфгаардских дезертиров стальным мечом в тесной таверне на тракте возле деревни Залипье.',
    ],
  },
  {
    id: 'shoot',
    nameRu: 'Стрельба',
    nameEn: 'Shoot',
    category: 'physical',
    description: 'Луки, арбалеты, метательные ножи и бомбы.',
    actions: ['overcome', 'advantage', 'attack'],
    examples: [
      'Всадить арбалетный болт точно под панцирь пикирующей гарпии над бурлящим проливом близ Ард Скеллиг.',
      'Сбить выстрелом из лука верёвку подвешенной люстры в кабаке Новиграда, чтобы обрушить её на головорезов.',
    ],
  },
  {
    id: 'stealth',
    nameRu: 'Скрытность',
    nameEn: 'Stealth',
    category: 'physical',
    description: 'Бесшумное движение, засады, маскировка.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Бесшумно проскользнуть мимо нильфгаардских часовых и укрыться среди бочек в лагере дивизии «Черная пехота».',
      'Затаиться в густом тумане кривоуховых топей и выждать удобный момент для удара по утопцам.',
    ],
  },
  {
    id: 'ride',
    nameRu: 'Верховая езда',
    nameEn: 'Ride',
    category: 'physical',
    description: 'Управление лошадью, бой верхом, погони.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Перепрыгнуть на верном коне глубокий овраг, спасаясь от стаи одичавших волков в предгорьях Махакама.',
      'На полном скаку навязать кавалерийскую дуэль нильфгаардскому всаднику на открытом тракте близ Белого Сада.',
    ],
  },
  {
    id: 'physique',
    nameRu: 'Телосложение',
    nameEn: 'Physique',
    category: 'physical',
    description: 'Сила, выносливость, стойкость к ядам и эликсирам; физический стресс.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Удержать плечом дубовые ворота мельницы, пока испуганные кметы спасаются от кровожадных накеров.',
      'Справиться с действием ядовитого укуса главоглаза благодаря крепкому здоровью и очищающему зелью «Иволга».',
    ],
  },

  // Ментальные
  {
    id: 'notice',
    nameRu: 'Внимание',
    nameEn: 'Notice',
    category: 'mental',
    description: 'Острый слух, кошачьи глаза, восприятие ауры чудовищ.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Уловить едва слышный шорох когтей катакана под деревянным помостом ночного новиградского рыбного рынка.',
      'Разглядеть в сумерках кошачьими глазами замаскированные капканы браконьеров в глухой чаще веленского леса.',
    ],
  },
  {
    id: 'investigate',
    nameRu: 'Расследование',
    nameEn: 'Investigate',
    category: 'mental',
    description: 'Следы, вскрытие, анализ контракта, сбор улик.',
    actions: ['overcome', 'advantage'],
    examples: [
      'Осмотреть растерзанное тело кмета на болотах и по глубине порезов определить породу полуночницы.',
      'Изучить разорванную сургучную печать на письме нильфгаардского шпиона в кабинете новиградского банкира Вивальди.',
    ],
  },
  {
    id: 'bestiary',
    nameRu: 'Бестиарий',
    nameEn: 'Bestiary',
    category: 'mental',
    description: 'Повадки и слабости монстров, древние легенды, проклятия.',
    actions: ['overcome', 'advantage'],
    examples: [
      'Вспомнить древний манускрипт о леших, чтобы выяснить ритуал изгнания и найти тотемное дерево.',
      'Определить по следам слизи ядовитую породу куролиска и подсказать охотникам правильное масло для клинков.',
    ],
  },
  {
    id: 'alchemy',
    nameRu: 'Алхимия',
    nameEn: 'Alchemy',
    category: 'mental',
    description: 'Эликсиры, масла, бомбы, яды и травы.',
    actions: ['overcome', 'advantage'],
    examples: [
      'Приготовить эликсир «Ласточка» и нанести масло от призраков перед спуском в заброшенные склепы Эллариона.',
      'Собрать алхимическую бомбу «Самум» из толчёного серебра и селитры для ослепления целой стаи накеров.',
    ],
  },
  {
    id: 'magic',
    nameRu: 'Магия',
    nameEn: 'Magic',
    category: 'mental',
    description: 'Знаки, ритуалы, магические теории и проклятия.',
    actions: ['overcome', 'advantage', 'attack', 'defend'],
    examples: [
      'Сложить пальцы в Знак Игни и выпустить поток пламени во взбесившегося болотного гуля.',
      'Укрыть себя мерцающим щитом Знака Квен за секунду до падения каменной глыбы циклопа.',
    ],
  },
  {
    id: 'will',
    nameRu: 'Воля',
    nameEn: 'Will',
    category: 'mental',
    description: 'Концентрация для Знаков, защита от чар и ужаса; ментальный стресс.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Выдержать парализующий взгляд полуденницы и подавить панику силой нерушимой ведьмачьей концентрации.',
      'Противостоять соблазняющим иллюзиям и чарам коварной суккубы в горной пещере близ Каэр Трольде.',
    ],
  },

  // Социальные
  {
    id: 'rapport',
    nameRu: 'Убеждение',
    nameEn: 'Rapport',
    category: 'social',
    description: 'Доверие, дипломатия, светская беседа, переговоры.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Убедить недоверчивого старосту веленской деревни выплатить задаток за уничтожение полуночницы на полях.',
      'Завязать непринуждённую беседу с новиградским купцом в корчме «Семь котов» и завоевать его расположение.',
    ],
  },
  {
    id: 'deceive',
    nameRu: 'Обман',
    nameEn: 'Deceive',
    category: 'social',
    description: 'Ложь, блеф, маскировка, сокрытие мотивов.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'Выдать себя за реданского интенданта и без досмотра провести телегу через кордон Оксенфурта.',
      'Убедительно солгать охотникам за колдуньями о том, где скрывается преследуемая беглая травница.',
    ],
  },
  {
    id: 'provoke',
    nameRu: 'Запугивание',
    nameEn: 'Provoke',
    category: 'social',
    description: 'Угрозы, давление, жёлтые глаза и отрубленные головы.',
    actions: ['overcome', 'advantage', 'attack'],
    examples: [
      'Швырнуть на стол новиградского корчмаря отрубленную голову грайвера, до смерти напугав местных вышибал.',
      'Сверкнуть кошачьими зрачками и ледяным тоном заставить бандитов бросить оружие без единого удара.',
    ],
  },
  {
    id: 'empathy',
    nameRu: 'Эмпатия',
    nameEn: 'Empathy',
    category: 'social',
    description: 'Чтение эмоций и мотивов, обнаружение лжи.',
    actions: ['overcome', 'advantage', 'defend'],
    examples: [
      'По прерывистому дыханию и дрожи пальцев корчмаря понять, что тот скрывает нильфгаардского перебежчика.',
      'Разгадать скрытые мотивы темерского дворянина ещё до подписания сомнительного контракта на монстра.',
    ],
  },
  {
    id: 'contacts',
    nameRu: 'Контакты',
    nameEn: 'Contacts',
    category: 'social',
    description: 'Трактирщики, старосты, ростовщики, наёмники.',
    actions: ['overcome', 'advantage'],
    examples: [
      'Разыскать через новиградских скупщиков краденого мастера-бронника, способного выковать доспехи школы Кота.',
      'Навести справки среди скеллигских моряков в порту Каэр Трольде о таинственном корабле-призраке.',
    ],
  },
  {
    id: 'resources',
    nameRu: 'Ресурсы',
    nameEn: 'Resources',
    category: 'social',
    description: 'Золото, снаряжение, доступ к нужным людям и вещам.',
    actions: ['overcome', 'advantage'],
    examples: [
      'Купить у новиградского алхимика редчайший порошок из толчёного жемчуга для изготовления сложного мутагена.',
      'Щедро отсыпать флоренов портовой страже в Вызиме, чтобы закрыть глаза на ночной груз.',
    ],
  },
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
