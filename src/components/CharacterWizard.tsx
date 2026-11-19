import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import '../styles/stunt-modal.css';
import '../styles/wizard.css';
import { Hint } from './Hint';
import { FATE_POINTS_HINT, REFRESH_HINT } from './FatePoints';
import { NameGenerator } from './NameGenerator';
import { PortraitPlate } from './PortraitPlate';
import { SettingMark } from './SettingMark';
import { PortraitCropper } from './PortraitCropper';
import { SkillPicker } from './SkillPicker';
import { SkillPyramid } from './SkillPyramid';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconDice,
  IconSparkles,
  IconSwords,
  IconUser,
  IconZap,
} from './icons';
import {
  FREE_STUNTS,
  MAX_STUNTS,
  SKILLS,
  STARTING_REFRESH,
  ladderFromPicks,
} from '../data/characters';
import type { SettingId, Stunt } from '../data/types';

const BASE = import.meta.env.BASE_URL;
const PAPER = `${BASE}assets/textures/parchment-soft.jpg`;

/* Тексты плашек: заголовок — сам термин, в тексте его уже не повторяем. */
const TIP_INVOKE =
  'Потрать жетон судьбы, чтобы получить +2 к броску или переброс, когда действие укладывается в аспект.';
const TIP_COMPEL =
  'Мастер предлагает осложнение по аспекту. Согласись — получишь жетон судьбы, откажись — заплати жетон.';

type Setting = 'witcher' | 'fate';
type HintId = 'concept' | 'trouble' | 'aspects';
type StepNo = 1 | 2 | 3 | 4;

/** Навык, поставленный на ступень пирамиды. */
export type SkillPick = { name: string; value: number };

/** Сколько карточек помещается на ступени: +4 — одна, +3 — две и так далее. */
const capFor = (value: number) => Math.max(0, 5 - value);

/* Подписи ступеней словами — прямо на пирамиде, чтобы не объяснять их в тексте. */
const RANK_WORDS: Record<number, string> = {
  4: 'Отлично',
  3: 'Хорошо',
  2: 'Неплохо',
  1: 'Средне',
};

const TIP_MILESTONE_SIGNIFICANT =
  'Конец сценария или крупного события. Герой получает очко навыка и может поменять местами две ступени навыков или заменить навык, сменить трюк или купить новый, если хватает обновления, переименовать аспект (кроме концепции) и переписать последствия.';
const TIP_MILESTONE_MAJOR =
  'Конец сюжетной арки. Даёт всё, что даёт значимая веха, плюс очко обновления, возможность добавить новую ступень навыков и переписать концепцию.';

const STEPS: { name: string; icon: ReactNode }[] = [
  { name: 'Кто он', icon: <IconUser /> },
  { name: 'Аспекты', icon: <IconSparkles /> },
  { name: 'Навыки', icon: <IconSwords /> },
  { name: 'Трюки', icon: <IconZap /> },
];

/* Три свободных аспекта: без подписей, только примеры в поле. */
const ASPECT_EXAMPLES = [
  'Старый долг перед наставницей…',
  'Слишком честен для своего ремесла…',
  'За мной охотится Гильдия…',
];

/** Знак сеттинга — те же логотипы, что на карточках списка. */
function Logo({ kind }: { kind: Setting }) {
  const src =
    kind === 'witcher'
      ? `${BASE}assets/logos/wolf-head.svg`
      : `${BASE}assets/logos/fate-wordmark.svg`;
  const mask = { WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` };
  return <span className={`wiz__logo wiz__logo--${kind}`} style={mask} aria-hidden="true" />;
}

type GrowProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  ariaLabel?: string;
};

/** Поле в одну строку, которое растёт под текст. */
function GrowTextarea({
  id,
  value,
  onChange,
  placeholder,
  maxLength = 120,
  ariaLabel,
}: GrowProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      className="sm__input wiz__grow"
      rows={1}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={ariaLabel}
    />
  );
}

type AspectFieldsProps = {
  values: string[];
  onChange: (index: number, value: string) => void;
};

/** Три строки аспектов: без подписей, примеры — в подсказке поля. */
function AspectFields({ values, onChange }: AspectFieldsProps) {
  return (
    <div className="wiz__aspects">
      {ASPECT_EXAMPLES.map((example, index) => (
        <div className="wiz__aspect" key={example}>
          <GrowTextarea
            id={`wiz-aspect-${index}`}
            value={values[index]}
            onChange={(value) => onChange(index, value)}
            placeholder={example}
            maxLength={100}
            ariaLabel={`Аспект ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

function ConceptText() {
  return (
    <div className="sm__hint-body">
      <p>
        <strong>Что это.</strong> Ключевой аспект — фраза о том, кто герой и чем он
        занимается. В книге правил его сравнивают с работой или призванием: он говорит, что
        герой умеет и какие обязанности на нём лежат.
      </p>
      <p>
        <strong>Как придумать.</strong> Назвать профессию или роль: «Следователь», «Рыцарь
        Круглого стола», «Мелкий жулик». Добавить определение: «Неохотный следователь»,
        «Слишком честный наёмник». Соединить две несовместимые роли: «Волшебник-детектив»,
        «Поющий рыцарь». Связать с семьёй или организацией: «Отступник из дома Томпсонов»,
        «Должник Гильдии».
      </p>
      <p>
        <strong>Что делает её хорошей.</strong> Понятно, когда аспект призвать и когда
        Мастер может его навязать. У «Непобедимого мечника» вторая сторона не читается —
        таких фраз лучше избегать.
      </p>
      <p>
        <strong>Если не идёт.</strong> Не обязательно попадать в точку с первого раза:
        аспект можно уточнить позже, в том числе по ходу игры.
      </p>
      <ol className="sm__hint-list">
        <li>
          <span className="sm__hint-pattern">Ведьмак, который не берёт денег с бедных.</span>
          <span className="sm__hint-example">
            В деревнях про него знают: где-то накормят и спрячут, а где-то попрекнут
            упрямством.
          </span>
        </li>
        <li>
          <span className="sm__hint-pattern">
            Бывший капитан стражи, которому больше не доверяют.
          </span>
          <span className="sm__hint-example">
            Сослуживцы помнят его в лицо, но приказы уже не выполняют.
          </span>
        </li>
      </ol>
    </div>
  );
}

function TroubleText() {
  return (
    <div className="sm__hint-body">
      <p>
        <strong>Что это.</strong> Проблема отвечает на вопрос, что осложняет герою жизнь.
        Она не должна решаться раз и навсегда: если бы герой мог от неё избавиться, он бы
        это уже сделал.
      </p>
      <p>
        <strong>Как придумать.</strong> Проблемы бывают двух видов. Личная слабость — то,
        чему герой поддаётся в самый неподходящий момент: «Вспыльчивость», «Падок на
        красивое лицо», «Тянется к бутылке». Трудные отношения — люди или организации,
        которые мешают жить: «Семьянин», «Долг перед мафией», «Триада Шрама хочет меня
        убить».
      </p>
      <p>
        <strong>Что делает её хорошей.</strong> Она не повторяет концепцию. У «Ведущего
        детектива» проблема «Криминальный мир меня ненавидит» слабая: это уже следует из
        концепции. Лучше сделать её личной — «Дон Джованни ненавидит меня лично».
      </p>
      <p>
        <strong>Другая сторона.</strong> Проблему тоже можно призвать. Опыт борьбы с ней
        иногда помогает: тот, кто вырос на улице, знает, как договориться с бандитами.
      </p>
      <ol className="sm__hint-list">
        <li>
          <span className="sm__hint-pattern">Вспыльчивость.</span>
          <span className="sm__hint-example">
            В разговоре с важным человеком герой может сорваться и получить за это жетон
            судьбы.
          </span>
        </li>
        <li>
          <span className="sm__hint-pattern">Долг перед мафией.</span>
          <span className="sm__hint-example">
            Позовут на дело в самый неподходящий момент, а отказать нельзя.
          </span>
        </li>
        <li>
          <span className="sm__hint-pattern">Семьянин.</span>
          <span className="sm__hint-example">
            Семья втягивается в чужие проблемы, и их приходится распутывать.
          </span>
        </li>
      </ol>
    </div>
  );
}

function AspectText() {
  return (
    <div className="sm__hint-body">
      <p>
        <strong>Что это.</strong> Аспект — фраза, которая описывает что-то важное в герое:
        характер, прошлое, связи, проблемы. Он всегда правдив: если написано «Старый долг
        перед наставницей», значит, долг существует и его вспомнят в игре.
      </p>
      <p>
        <strong>Зачем он нужен.</strong> За жетон судьбы аспект призывают: это +2 к броску
        или переброс кубиков, если действие укладывается во фразу. Мастер может навязать
        его — герой попадает в передрягу, а вы получаете жетон.
      </p>
      <p>
        <strong>Что делает его хорошим.</strong> Он работает в обе стороны. «Серебряный меч
        отца» выручит в бою и создаст проблемы, когда меч узнают. «Непобедимый мечник»
        призвать легко, а навязать нечем.
      </p>
      <p>
        <strong>Откуда их три.</strong> В книге оставшиеся аспекты берут из предыстории:
        первое приключение героя, а затем две встречи с другими героями. Если вы создаёте
        героя один, придумайте любые три фразы или оставьте поля пустыми — их можно
        заполнить в игре.
      </p>
      <ol className="sm__hint-list">
        <li>
          <span className="sm__hint-pattern">Старый долг перед наставницей.</span>
          <span className="sm__hint-example">
            Позовут на помощь в неподходящий момент; старые связи при этом открывают двери.
          </span>
        </li>
        <li>
          <span className="sm__hint-pattern">Слишком честен для своего ремесла.</span>
          <span className="sm__hint-example">
            В переговорах мешает; простые люди зато верят на слово.
          </span>
        </li>
        <li>
          <span className="sm__hint-pattern">За мной охотится Гильдия.</span>
          <span className="sm__hint-example">
            Неприятности на ровном месте; есть повод искать старых знакомых.
          </span>
        </li>
      </ol>
    </div>
  );
}

/** Черновик героя: то, что игрок успел заполнить в конструкторе. */
export type WizardDraft = {
  setting: SettingId;
  name: string;
  concept: string;
  trouble: string;
  aspects: string[];
  skills: SkillPick[];
  stunts: Stunt[];
  portrait: string;
};

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
  onSkip: () => void;
  /** У готового героя сеттинг не меняется: иначе пришлось бы стирать навыки. */
  lockedSetting?: boolean;
};

/**
 * Конструктор героя — шаги 1–2 поверх нового листа. Лист виден под окном:
 * новичок сразу понимает, куда попадут имя, портрет и аспекты, а опытный
 * игрок пропускает конструктор одной кнопкой.
 */
export function CharacterWizard({ draft, onChange, onSkip, lockedSetting = false }: Props) {
  const [step, setStep] = useState<StepNo>(1);
  const [hint, setHint] = useState<HintId | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pickValue, setPickValue] = useState<number | null>(null);
  /* Справка шага «Трюки» открывается рядом с полями, а не вместо них. */
  const [stuntHelp, setStuntHelp] = useState(false);
  /* Генератор имён на шаге «Кто он». */
  const [nameGen, setNameGen] = useState(false);

  const setting = draft.setting;
  const name = draft.name;
  const concept = draft.concept;
  const trouble = draft.trouble;
  const aspects = draft.aspects;
  const photo = draft.portrait;
  const skills = draft.skills;
  const stunts = draft.stunts;

  const setSetting = (next: SettingId) => onChange({ setting: next });
  const setName = (next: string) => onChange({ name: next });
  const setConcept = (next: string) => onChange({ concept: next });
  const setTrouble = (next: string) => onChange({ trouble: next });
  const setAspect = (index: number, value: string) =>
    onChange({ aspects: aspects.map((item, i) => (i === index ? value : item)) });
  const setPhoto = (next: string) => onChange({ portrait: next });
  const setSkills = (next: SkillPick[]) => onChange({ skills: next });
  const setStunts = (next: Stunt[]) => onChange({ stunts: next });
  /* Обновление после добавления трюка: три трюка бесплатны, каждый следующий −1. */
  const refreshAfter = (count: number) =>
    Math.max(1, STARTING_REFRESH - Math.max(0, count - FREE_STUNTS));
  const nextStuntCosts = refreshAfter(stunts.length + 1) < refreshAfter(stunts.length);
  const addStunt = () => {
    if (stunts.length >= MAX_STUNTS) return;
    stuntFocus.current = stunts.length;
    setStunts([...stunts, { name: '', text: '' }]);
  };
  const updateStunt = (index: number, patch: Partial<Stunt>) =>
    setStunts(stunts.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const removeStunt = (index: number) => setStunts(stunts.filter((_, i) => i !== index));
  const addSkill = (value: number, skillName: string) =>
    setSkills([...skills, { name: skillName, value }]);
  const removeSkill = (skillName: string) =>
    setSkills(skills.filter((pick) => pick.name !== skillName));
  const freeSkills = SKILLS[setting].filter(
    (skillName) => !skills.some((pick) => pick.name === skillName),
  );

  const photoRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /* Новый трюк добавляется пустой карточкой — курсор сразу в её название. */
  const stuntRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stuntFocus = useRef<number | null>(null);

  /* Пока окно открыто, страница под ним не прокручивается. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* После добавления трюка ставим курсор в его название. */
  useEffect(() => {
    const index = stuntFocus.current;
    if (index === null) return;
    const field = stuntRefs.current[index];
    if (!field) return;
    field.focus();
    stuntFocus.current = null;
  }, [stunts]);

  /* Esc: из справки — назад к полям, из полей — закрыть конструктор. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pickValue !== null) {
        setPickValue(null);
        return;
      }
      if (stuntHelp) {
        setStuntHelp(false);
        return;
      }
      if (hint !== null) {
        setHint(null);
        return;
      }
      onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hint, pickValue, stuntHelp, onSkip]);

  /* Если до подвала не хватает пары пикселей, поджимаем нижний отступ,
     чтобы ползунок не появлялся ради двух пикселей. Если не влезает
     больше 12 px — прокрутка остаётся обычной. */
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const fit = () => {
      const over = el.scrollHeight - el.clientHeight;
      if (over > 12) {
        el.style.paddingBottom = '';
      } else if (over > 0) {
        el.style.paddingBottom = `${Math.max(0, 8 - over)}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    window.addEventListener('resize', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [step, hint, stuntHelp, name, concept, trouble, aspects, photo, stunts.length]);

  /* Справка встаёт на место текста слева: возвращаем окно к началу, чтобы
     поля трюков не оказались наполовину прокручены. */
  useEffect(() => {
    if (stuntHelp) bodyRef.current?.scrollTo({ top: 0 });
  }, [stuntHelp]);

  const goTo = (next: StepNo) => {
    setHint(null);
    setStuntHelp(false);
    setPickValue(null);
    setStep(next);
  };

  const pageTitle =
    hint === 'concept'
      ? 'Как придумать концепцию'
      : hint === 'trouble'
        ? 'Как придумать проблему'
        : 'Как придумать аспект';
  const pageFieldLabel = hint === 'concept' ? 'Концепция' : 'Проблема';
  const pageFieldValue = hint === 'concept' ? concept : trouble;
  const pageFieldPlaceholder =
    hint === 'concept'
      ? 'Кто он и чем живёт — одной фразой'
      : 'Что то и дело втягивает его в неприятности';
  const setPageFieldValue = hint === 'concept' ? setConcept : setTrouble;

  return (
    <div className="wiz-overlay">
      <div
        className="sm__panel wiz"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiz-title"
      >
            <div className="sm__head">
              <span
                className="sm__texture"
                aria-hidden="true"
                style={{ backgroundImage: `url(${PAPER})` }}
              />
              <span className="sm__head-title" id="wiz-title">
                Создание героя
              </span>
              <button
                type="button"
                className="wiz__close"
                aria-label="Закрыть конструктор"
                onClick={onSkip}
              >
                <IconClose />
              </button>
            </div>

            <ol className="wiz__path" aria-label="Шаги создания героя">
              {STEPS.map((item, index) => {
                const done = index < step - 1;
                const current = index === step - 1;
                return (
                  <li
                    key={item.name}
                    className={`wiz__step${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
                    aria-current={current ? 'step' : undefined}
                  >
                    <button
                      type="button"
                      className="wiz__stepbtn"
                      onClick={() => goTo((index + 1) as StepNo)}
                      title={`Перейти к шагу «${item.name}»`}
                    >
                      <span className="wiz__node">{done ? <IconCheck /> : item.icon}</span>
                      <span className="wiz__label">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="sm__body" ref={bodyRef}>
              {hint !== null ? (
                <div className="wiz__page" role="region" aria-label={pageTitle}>
                  <h3 className="wiz__page-title">{pageTitle}</h3>
                  {hint === 'concept' && <ConceptText />}
                  {hint === 'trouble' && <TroubleText />}
                  {hint === 'aspects' && <AspectText />}

                  {hint === 'aspects' ? (
                    <div className="wiz__page-field">
                      <AspectFields values={aspects} onChange={setAspect} />
                    </div>
                  ) : (
                    <div className="wiz__page-field">
                      <label className="sm__label" htmlFor={`wiz-${hint}-page`}>
                        {pageFieldLabel}
                      </label>
                      <GrowTextarea
                        id={`wiz-${hint}-page`}
                        value={pageFieldValue}
                        onChange={setPageFieldValue}
                        placeholder={pageFieldPlaceholder}
                      />
                    </div>
                  )}
                </div>
              ) : step === 1 ? (
                <>
                  <div className="wiz__toprow">
                    <div className="sm__field wiz__namefield">
                      <input
                        id="wiz-name"
                        className="sm__input wiz__name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Имя героя…"
                        aria-label="Имя героя"
                        autoComplete="off"
                        maxLength={40}
                      />
                      <button
                        type="button"
                        className="wiz__dice"
                        aria-label="Открыть генератор имён"
                        title="Открыть генератор имён"
                        onClick={() => setNameGen(true)}
                      >
                        <IconDice />
                      </button>
                    </div>

                    {!lockedSetting && (
                      <div className="wiz__segs" role="group" aria-label="Сеттинг">
                        <button
                          type="button"
                          className="wiz__seg"
                          aria-pressed={setting === 'witcher'}
                          onClick={() => setSetting('witcher')}
                        >
                          <Logo kind="witcher" />
                          <span>Ведьмак</span>
                        </button>
                        <button
                          type="button"
                          className="wiz__seg"
                          aria-pressed={setting === 'fate'}
                          aria-label="Fate"
                          onClick={() => setSetting('fate')}
                        >
                          <Logo kind="fate" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="wiz__grid">
                    <div className="wiz__pick">
                      <button
                        type="button"
                        className="wiz__portrait"
                        aria-label="Загрузить портрет героя"
                        onClick={() => photoRef.current?.click()}
                      >
                        <span aria-hidden="true">
                          <PortraitPlate src={photo} alt="" />
                        </span>
                        {lockedSetting && <SettingMark setting={setting} />}
                      </button>
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.addEventListener('load', () => setCropSrc(String(reader.result)));
                          reader.readAsDataURL(file);
                          event.target.value = '';
                        }}
                      />
                      <span className="wiz__pick-hint">Нажмите, чтобы загрузить фото</span>
                    </div>

                    <div className="wiz__col">
                      <div className="sm__field">
                        <label className="sm__label" htmlFor="wiz-concept">
                          Концепция
                        </label>
                        <GrowTextarea
                          id="wiz-concept"
                          value={concept}
                          onChange={setConcept}
                          placeholder="Кто он и чем живёт — одной фразой…"
                        />
                        <p className="wiz__note">
                          Когда действие героя укладывается в концепцию, её можно{' '}
                          <Hint title="Призыв аспекта" text={TIP_INVOKE}>
                            призвать
                          </Hint>{' '}
                          за{' '}
                          <Hint title="Жетоны судьбы" text={FATE_POINTS_HINT}>
                            жетон судьбы
                          </Hint>
                          .
                        </p>
                        <button
                          type="button"
                          className="wiz__hint-link"
                          onClick={() => setHint('concept')}
                        >
                          <span>Как придумать концепцию</span>
                          <IconArrowRight />
                        </button>
                      </div>

                      <div className="sm__field wiz__field-gap">
                        <label className="sm__label" htmlFor="wiz-trouble">
                          Проблема
                        </label>
                        <GrowTextarea
                          id="wiz-trouble"
                          value={trouble}
                          onChange={setTrouble}
                          placeholder="Что то и дело втягивает его в неприятности…"
                        />
                        <p className="wiz__note">
                          Мастер может{' '}
                          <Hint title="Навязывание" text={TIP_COMPEL}>
                            навязать
                          </Hint>{' '}
                          проблему: герой попадает в переделку, а игрок получает{' '}
                          <Hint title="Жетоны судьбы" text={FATE_POINTS_HINT}>
                            жетон судьбы
                          </Hint>
                          .
                        </p>
                        <button
                          type="button"
                          className="wiz__hint-link"
                          onClick={() => setHint('trouble')}
                        >
                          <span>Как придумать проблему</span>
                          <IconArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : step === 2 ? (
                <div className="wiz__grid wiz__grid--aspects">
                  <div className="wiz__aside">
                    <p>Аспект — короткая фраза о герое, она всегда правдива.</p>
                    <p>
                      Аспект можно{' '}
                      <Hint title="Призыв аспекта" text={TIP_INVOKE}>
                        призвать
                      </Hint>{' '}
                      за{' '}
                      <Hint title="Жетоны судьбы" text={FATE_POINTS_HINT}>
                        жетон судьбы
                      </Hint>
                      , а мастер может его{' '}
                      <Hint title="Навязывание" text={TIP_COMPEL}>
                        навязать
                      </Hint>{' '}
                      — тогда жетон получаете вы.
                    </p>
                  </div>

                  <div className="wiz__col">
                    <span className="sm__label">Ещё три аспекта</span>
                    <AspectFields values={aspects} onChange={setAspect} />
                    <button
                      type="button"
                      className="wiz__hint-link"
                      onClick={() => setHint('aspects')}
                    >
                      <span>Как придумать аспект</span>
                      <IconArrowRight />
                    </button>
                  </div>
                </div>
              ) : step === 3 ? (
                <div className="wiz__grid wiz__grid--aspects wiz__grid--skills">
                  <div className="wiz__aside">
                    <p>
                      Когда исход под вопросом, бросают четыре кубика: на двух гранях плюс, на двух
                      минус, на двух пусто. К тому, что выпало, прибавляют навык — так получается
                      результат проверки.
                    </p>
                    <p>
                      Развитие персонажа в Fate устроено по вехам:{' '}
                      <Hint title="Значимая веха" text={TIP_MILESTONE_SIGNIFICANT}>
                        значимая веха
                      </Hint>{' '}
                      позволяет добавить новый навык на ступень +1 или поместить существующий навык
                      на ступень выше, а{' '}
                      <Hint title="Большая веха" text={TIP_MILESTONE_MAJOR}>
                        большая веха
                      </Hint>{' '}
                      вдобавок добавляет новую ступень навыков.
                    </p>
                  </div>

                  <div className="wiz__col">
                    <SkillPyramid
                      big
                      rows={ladderFromPicks(skills).map((row) => ({
                        value: row.value,
                        skills: row.skills,
                      }))}
                      cap={capFor}
                      rankWords={RANK_WORDS}
                      onSlot={setPickValue}
                      onRemove={(_, skillName) => removeSkill(skillName)}
                      slotTitle={(value) => `Поставить навык на +${value}`}
                    />
                  </div>
                </div>
              ) : (
                <div className={`wiz__grid wiz__grid--stunts${stuntHelp ? ' is-help' : ''}`}>
                  <div className="wiz__aside">
                    {stuntHelp ? (
                      <div
                        className={`wiz__stunt-help${stunts.length < 4 ? ' wiz__stunt-help--scroll' : ''}`}
                        role="region"
                        aria-label="Как придумать трюк"
                      >
                        <h3 className="wiz__page-title">Как придумать трюк</h3>
                        <p>
                          <strong>Что такое трюк.</strong> Это приём героя, который даёт
                          преимущество в конкретном случае. Пользуйтесь им, когда выполнены его
                          условия.
                        </p>
                        <p>
                          <strong>Хороший трюк</strong> не работает всегда: помогает в ситуации,
                          которая действительно случается в игре, и не заменяет навык. Слишком
                          широкое условие Мастер попросит сузить.
                        </p>
                        <p>
                          <strong>Как придумать.</strong> Оттолкнитесь от биографии: чем герой
                          занимался, с кем связан, чего боится. Ниже три шаблона с примерами — это
                          не обязательные правила, можно написать свой вариант.
                        </p>
                        <ol className="sm__hint-list">
                          <li>
                            <span className="sm__hint-pattern">+2 к [Навык], когда [условие].</span>
                            <span className="sm__hint-example">
                              Пример: «Серебряный меч» — +2 к Драке, когда сражаетесь против
                              чудовища.
                            </span>
                          </li>
                          <li>
                            <span className="sm__hint-pattern">
                              Использую [Навык А] вместо [Навык Б], когда [условие].
                            </span>
                            <span className="sm__hint-example">
                              Пример: «Парирую стрелы» — Драка вместо Атлетики, когда защищаетесь от
                              стрел.
                            </span>
                          </li>
                          <li>
                            <span className="sm__hint-pattern">
                              Раз за сцену или сессию могу [эффект].
                            </span>
                            <span className="sm__hint-example">
                              Пример: «Знак Игни» — раз за сцену поджигаю всё в одном секторе.
                            </span>
                          </li>
                        </ol>
                      </div>
                    ) : (
                      <>
                        <p>
                          Трюк — особый приём героя: он даёт преимущество в узком случае.
                          Например, +2 к навыку, замена одного навыка другим или разовый эффект.
                        </p>
                        <p>
                          Срабатывает трюк только когда выполнено его условие, поэтому он не
                          заменяет навык. Три трюка входят в стартовое обновление, каждый следующий
                          отнимает по жетону.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="wiz__col">
                    <div className="wiz__stunts">
                      {stunts.map((stunt, index) => (
                        <article className="wiz__stunt" key={index}>
                          <input
                            ref={(field) => {
                              stuntRefs.current[index] = field;
                            }}
                            className="sm__input wiz__stunt-name"
                            type="text"
                            value={stunt.name}
                            maxLength={48}
                            placeholder="Название трюка"
                            aria-label={`Название трюка ${index + 1}`}
                            onChange={(event) => updateStunt(index, { name: event.target.value })}
                          />
                          <textarea
                            className="sm__input sm__textarea wiz__stunt-text"
                            rows={2}
                            value={stunt.text}
                            maxLength={240}
                            placeholder="Что даёт и при каком условии работает"
                            aria-label={`Описание трюка ${index + 1}`}
                            onChange={(event) => updateStunt(index, { text: event.target.value })}
                          />
                          <button
                            type="button"
                            className="wiz__stunt-remove"
                            aria-label={`Удалить трюк ${index + 1}`}
                            onClick={() => removeStunt(index)}
                          >
                            <IconClose />
                          </button>
                        </article>
                      ))}

                      {stunts.length < MAX_STUNTS && (
                        <div
                          className={`wiz__stunt-add${nextStuntCosts ? ' wiz__stunt-add--cost' : ''}`}
                        >
                          <button
                            type="button"
                            className="wiz__stunt-add-hit"
                            aria-label="Добавить трюк"
                            onClick={addStunt}
                          />
                          <span className="wiz__stunt-plus" aria-hidden="true">
                            +
                          </span>
                          <span className="wiz__stunt-add-label">Добавить трюк</span>
                          {nextStuntCosts && (
                            <span className="wiz__stunt-add-note">
                              Этот трюк уменьшит{' '}
                              <Hint title="Обновление" text={REFRESH_HINT}>
                                обновление
                              </Hint>
                              : {refreshAfter(stunts.length)} → {refreshAfter(stunts.length + 1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!stuntHelp && (
                      <button
                        type="button"
                        className="wiz__hint-link"
                        onClick={() => setStuntHelp(true)}
                      >
                        Как придумать трюк
                        <IconArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <footer className="sm__footer">
              <div className="sm__footer-left">
                {hint === null && !stuntHelp && step === 1 && (
                  <button type="button" className="sm__ghost" onClick={onSkip}>
                    Пропустить конструктор
                  </button>
                )}
                {hint === null && !stuntHelp && step > 1 && (
                  <button
                    type="button"
                    className="sm__ghost wiz__back"
                    onClick={() => goTo((step - 1) as StepNo)}
                  >
                    <IconArrowLeft />
                    Назад
                  </button>
                )}
                {hint !== null && (
                  <button
                    type="button"
                    className="sm__ghost wiz__back"
                    onClick={() => setHint(null)}
                  >
                    <IconArrowLeft />
                    Вернуться к полям
                  </button>
                )}
                {stuntHelp && (
                  <button
                    type="button"
                    className="sm__ghost wiz__back"
                    onClick={() => setStuntHelp(false)}
                  >
                    <IconArrowLeft />
                    Вернуться к полям
                  </button>
                )}
              </div>
              <div className="sm__actions">
                {hint === null && step < 4 && (
                  <button
                    type="button"
                    className="sm__primary"
                    onClick={() => goTo((step + 1) as StepNo)}
                  >
                    Далее
                  </button>
                )}
                {hint === null && step === 4 && (
                  <button type="button" className="sm__primary" onClick={onSkip}>
                    Готово
                  </button>
                )}
              </div>
            </footer>
      </div>

      {pickValue !== null && (
        <SkillPicker
          rank={pickValue}
          skills={freeSkills}
          onPick={(skillName) => {
            addSkill(pickValue, skillName);
            setPickValue(null);
          }}
          onClose={() => setPickValue(null)}
        />
      )}

      {nameGen && (
        <NameGenerator
          setting={setting}
          onPick={(next) => {
            setName(next);
            setNameGen(false);
          }}
          onClose={() => setNameGen(false)}
        />
      )}

      {cropSrc && (
        <PortraitCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onDone={(next) => {
            setPhoto(next);
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}
