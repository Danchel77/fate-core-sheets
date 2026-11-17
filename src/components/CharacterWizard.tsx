import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import '../styles/stunt-modal.css';
import '../styles/wizard.css';
import { Hint } from './Hint';
import { PortraitPlate } from './PortraitPlate';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconSparkles,
  IconSwords,
  IconUser,
  IconZap,
} from './icons';
import type { SettingId } from '../data/characters';

const BASE = import.meta.env.BASE_URL;
const PAPER = `${BASE}assets/textures/parchment-soft.jpg`;

/* Тексты плашек: заголовок — сам термин, в тексте его уже не повторяем. */
const TIP_FATE_POINTS =
  'Валюта истории. Отдай жетон, чтобы воспользоваться аспектом: +2 к броску или переброс.';
const TIP_INVOKE =
  'Потрать жетон судьбы, чтобы получить +2 к броску или переброс, когда действие укладывается в аспект.';
const TIP_COMPEL =
  'Мастер предлагает осложнение по аспекту. Согласись — получишь жетон судьбы, откажись — заплати жетон.';

type Setting = 'witcher' | 'fate';
type HintId = 'concept' | 'trouble' | 'aspects';
type StepNo = 1 | 2;

const STEPS: { name: string; icon: ReactNode }[] = [
  { name: 'Кто он', icon: <IconUser /> },
  { name: 'Аспекты', icon: <IconSparkles /> },
  { name: 'Навыки', icon: <IconSwords /> },
  { name: 'Трюки', icon: <IconZap /> },
];

/* Три свободных аспекта: без подписей, только примеры в поле. */
const ASPECT_EXAMPLES = [
  'Старый долг перед наставницей',
  'Слишком честен для своего ремесла',
  'За мной охотится Гильдия',
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
  portrait: string;
};

type Props = {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
  onSkip: () => void;
};

/**
 * Конструктор героя — шаги 1–2 поверх нового листа. Лист виден под окном:
 * новичок сразу понимает, куда попадут имя, портрет и аспекты, а опытный
 * игрок пропускает конструктор одной кнопкой.
 */
export function CharacterWizard({ draft, onChange, onSkip }: Props) {
  const [step, setStep] = useState<StepNo>(1);
  const [hint, setHint] = useState<HintId | null>(null);

  const setting = draft.setting;
  const name = draft.name;
  const concept = draft.concept;
  const trouble = draft.trouble;
  const aspects = draft.aspects;
  const photo = draft.portrait;

  const setSetting = (next: SettingId) => onChange({ setting: next });
  const setName = (next: string) => onChange({ name: next });
  const setConcept = (next: string) => onChange({ concept: next });
  const setTrouble = (next: string) => onChange({ trouble: next });
  const setAspect = (index: number, value: string) =>
    onChange({ aspects: aspects.map((item, i) => (i === index ? value : item)) });
  const setPhoto = (next: string) => onChange({ portrait: next });

  const photoRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* Пока окно открыто, страница под ним не прокручивается. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Esc: из справки — назад к полям, из полей — закрыть конструктор. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (hint !== null) {
        setHint(null);
        return;
      }
      onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hint, onSkip]);

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
  }, [step, hint, name, concept, trouble, aspects, photo]);

  const goTo = (next: StepNo) => {
    setHint(null);
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
                      disabled={index > 1}
                      title={
                        index > 1
                          ? `Шаг «${item.name}» появится позже`
                          : `Перейти к шагу «${item.name}»`
                      }
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
                      <label className="sm__label" htmlFor="wiz-name">
                        Имя героя
                      </label>
                      <input
                        id="wiz-name"
                        className="sm__input wiz__name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="off"
                        maxLength={40}
                      />
                    </div>

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
                          reader.addEventListener('load', () => setPhoto(String(reader.result)));
                          reader.readAsDataURL(file);
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
                          placeholder="Кто он и чем живёт — одной фразой"
                        />
                        <p className="wiz__note">
                          Когда действие героя укладывается в концепцию, её можно{' '}
                          <Hint title="Призыв аспекта" text={TIP_INVOKE}>
                            призвать
                          </Hint>{' '}
                          за{' '}
                          <Hint title="Жетоны судьбы" text={TIP_FATE_POINTS}>
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
                          placeholder="Что то и дело втягивает его в неприятности"
                        />
                        <p className="wiz__note">
                          Мастер может{' '}
                          <Hint title="Навязывание" text={TIP_COMPEL}>
                            навязать
                          </Hint>{' '}
                          проблему: герой попадает в переделку, а игрок получает{' '}
                          <Hint title="Жетоны судьбы" text={TIP_FATE_POINTS}>
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
              ) : (
                <div className="wiz__grid wiz__grid--aspects">
                  <div className="wiz__aside">
                    <p>Аспект — короткая фраза о герое, она всегда правдива.</p>
                    <p>
                      Аспект можно{' '}
                      <Hint title="Призыв аспекта" text={TIP_INVOKE}>
                        призвать
                      </Hint>{' '}
                      за{' '}
                      <Hint title="Жетоны судьбы" text={TIP_FATE_POINTS}>
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
              )}
            </div>

            <footer className="sm__footer">
              <div className="sm__footer-left">
                {hint === null && step === 1 && (
                  <button type="button" className="sm__ghost" onClick={onSkip}>
                    Пропустить конструктор
                  </button>
                )}
                {hint === null && step === 2 && (
                  <button
                    type="button"
                    className="sm__ghost wiz__back"
                    onClick={() => goTo(1)}
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
              </div>
              <div className="sm__actions">
                {hint === null && (
                  <button
                    type="button"
                    className="sm__primary"
                    onClick={() => goTo(2)}
                    disabled={step === 2}
                    title={
                      step === 2
                        ? 'Дальше — шаг «Навыки», он появится позже'
                        : undefined
                    }
                  >
                    Далее
                  </button>
                )}
              </div>
            </footer>
      </div>
    </div>
  );
}
