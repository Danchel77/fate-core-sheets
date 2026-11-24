import { firebaseApp } from '../firebase/app';
import { ensureAppCheck } from '../firebase/appCheck';

export type ReviewKind = 'concept' | 'trouble' | 'aspects' | 'stunts';

export type ReviewInput = {
  kind: ReviewKind;
  setting: 'fate' | 'witcher';
  text: string;
  concept: string;
  trouble: string;
  items: string[];
};

export type ReviewResult = {
  score: number;
  verdict: string;
  strengths: string[];
  /** Что конкретно не так: 1–3 коротких пункта, без готовых замен. */
  issues: string[];
  /** Как будет лучше: ровно два переписанных варианта целиком. */
  variants: string[];
  overlap: string | null;
};

/** Разбор трёх свободных аспектов: правка для заполненного, варианты для пустого. */
export type BatchSlot = { slot: number; advice: string | null; options: string[] };

export type BatchResult = { score: number; verdict: string; slots: BatchSlot[] };

export class QuotaError extends Error {
  readonly resetAt: number;

  constructor(resetAt: number) {
    super('На сегодня бесплатный лимит проверок исчерпан.');
    this.name = 'QuotaError';
    this.resetAt = resetAt;
  }
}

const KIND_LABEL: Record<ReviewKind, string> = {
  concept: 'концепция',
  trouble: 'проблема',
  aspects: 'три свободных аспекта',
  stunts: 'три трюка',
};

/**
 * Общее для всех проверок: роль, тон и шкала. Всё остальное — в брифе вида,
 * чтобы промпт не рассказывал про поля, которых в этой проверке нет.
 */
const BASE_RULES = `Ты — редактор листа персонажа Fate Core. Пиши по-русски, коротко и только про проверяемый текст: без вступлений, без пересказа правил, без вопросов и без похвалы «в целом».

ОЦЕНКА
5 — играть можно сразу. 4 — одна деталь просит правки. 3 — провисает одна сторона. 2 — лозунг, навык или общее место. 1 — не по теме или противоречит Fate.`;

const CONCEPT_BRIEF = `КОНЦЕПЦИЯ
Концепция — ключевой аспект: фраза о том, кто герой и чем он занимается. В книге правил её сравнивают с работой или призванием: она говорит, что герой умеет и какие обязанности на нём лежат. С неё начинается лист, поэтому оценивай только этот текст.

Хорошая концепция:
— называет профессию или роль: «Следователь», «Рыцарь Круглого стола», «Мелкий жулик»;
— добавляет определение, которое сужает роль: «Неохотный следователь», «Слишком честный наёмник»;
— иногда соединяет две несовместимые роли — «Волшебник-детектив», «Поющий рыцарь» — или связывает героя с семьёй и организацией: «Отступник из дома Томпсонов»;
— читается в обе стороны: понятно, когда её призвать (+2 или переброс) и как Мастер навяжет через неё неприятность.

Слабые концепции:
— однобокие: «Непобедимый мечник» — призвать легко, навязать нечем;
— пустые: «Загадочный странник», «Тяжёлое прошлое» — непонятно ни то, ни другое;
— о характере без дела: «Опасный тип с тяжёлым прошлым» — не видно, чем герой живёт.

Примеры:
— «Ведьмак, который не берёт денег с бедных» — ремесло плюс черта: в деревнях накормят и спрячут, но попрекнут упрямством.
— «Бывший капитан стражи, которому больше не доверяют» — сослуживцы помнят его в лицо, но приказы уже не выполняют.

КАК ОТВЕЧАТЬ
Вердикт — 2–4 слова: суть оценки, без цифр и без слова «оценка».
Что хорошо — ровно 2 пункта до 14 слов: деталь из текста и что она даёт за столом. Не пересказывай текст и не повторяй одну мысль дважды.
Что не так — 1–3 пункта до 10 слов: конкретный промах, без готовых замен и без «надо бы».
Как будет лучше — ровно 2 варианта до 18 слов: переписанный текст целиком, чтобы можно было вписать в лист как есть; варианты не повторяют друг друга.
Не выдумывай фактов о герое, которых нет в тексте. Если не хватает детали, скажи об этом в «что не так», а не в вердикте.`;

const TROUBLE_BRIEF = `ПРОБЛЕМА
Проблема — второй обязательный аспект: что осложняет герою жизнь. Она не должна решаться раз и навсегда: если бы герой мог от неё избавиться, он бы уже это сделал. Проверяешь вместе с концепцией: проблема не должна её пересказывать.

Проблемы бывают двух видов:
— личная слабость, которой герой поддаётся в самый неподходящий момент: «Вспыльчивость», «Падок на красивое лицо», «Тянется к бутылке»;
— трудные отношения — люди или организации, которые мешают жить: «Семьянин», «Долг перед мафией», «Триада Шрама хочет меня убить».

Хорошая проблема:
— конкретна: понятно, кто или что именно создаёт неприятность и как это случится за столом;
— не повторяет концепцию: у «Ведущего детектива» проблема «Криминальный мир меня ненавидит» слабая — это следует из профессии, а личная «Дон Джованни ненавидит меня лично» сильнее;
— оставляет герою ход: с ней можно жить, а иногда и выигрывать — проблему тоже можно призвать, ведь выросший на улице знает, как договориться с бандитами.

Примеры:
— «Вспыльчивость» — в разговоре с важным человеком герой сорвётся и получит за это жетон судьбы.
— «Долг перед мафией» — позовут на дело в самый неподходящий момент, а отказать нельзя.
— Слабо: «Приключенец, который любит приключения» — это не проблема, а следствие профессии.

КАК ОТВЕЧАТЬ
Вердикт — 2–4 слова: суть оценки, без цифр и без слова «оценка».
Что хорошо — ровно 2 пункта до 14 слов: деталь из текста и что она даёт за столом.
Что не так — 1–3 пункта до 10 слов: конкретный промах, без готовых замен и без «надо бы».
Как будет лучше — ровно 2 варианта до 18 слов: переписанная проблема целиком, чтобы можно было вписать в лист как есть; варианты не повторяют друг друга.
Пересечение — если проблема пересказывает концепцию: назови, что именно совпадает. Иначе «нет».
Не выдумывай фактов о герое, которых нет в тексте.`;

const ASPECTS_BRIEF = `ТРИ СВОБОДНЫХ АСПЕКТА
Свободный аспект — фраза, которая описывает что-то важное в герое: характер, прошлое, связи, проблемы. Он всегда правдив: если написано «Старый долг перед наставницей», значит, долг существует и его вспомнят в игре.

Зачем он нужен: за жетон судьбы аспект призывают — это +2 к броску или переброс кубиков, если действие укладывается во фразу; Мастер может его навязать — герой попадает в передрягу, а игрок получает жетон.

Хороший аспект работает в обе стороны:
— «Серебряный меч отца» выручит в бою и создаст проблемы, когда меч узнают;
— «Слишком честен для своего ремесла» мешает в переговорах, зато простые люди верят на слово;
— «За мной охотится Гильдия» — неприятности на ровном месте, есть повод искать старых знакомых.

Слабые аспекты:
— однобокие: «Непобедимый мечник» — призвать легко, навязать нечем;
— размытые: «Тяжёлое прошлое», «Загадочный странник» — непонятно ни то, ни другое;
— навык или лозунг вместо фразы: «Лучший фехтовальщик Севера», «Всегда прав».

Три поля проверяются вместе: заполненные сверяй с концепцией и проблемой и между собой — смысл не должен повторяться; для пустых предложи идеи в духе уже заполненных, а не копии соседей.

КАК ОТВЕЧАТЬ
Вердикт — 2–4 слова: суть оценки, без цифр и без слова «оценка».
Что усилить — для каждого заполненного поля, с его номером: что не так (до 8 слов), через тире готовая замена до 20 слов — фраза, которую можно вписать в лист как есть. Если аспект повторяет соседний, скажи об этом здесь.
Чего не хватает — для каждого пустого поля, с его номером: ровно два варианта до 10 слов, первый спокойнее, второй смелее. Каждый — законченная фраза для листа, без пояснений в скобках.
Не выдумывай фактов о герое, которых нет в тексте.`;

const STUNTS_BRIEF = `ТРИ ТРЮКА
Трюк — приём персонажа, который даёт преимущество в конкретном случае. Трюк не работает всегда и не заменяет навык: если условие слишком широкое, Мастер попросит его сузить.

Три шаблона формулировки:
— «+2 к [Навык], когда [условие]»: «Серебряный меч» — +2 к Драке, когда герой сражается против чудовища;
— «Использую [Навык А] вместо [Навык Б], когда [условие]»: «Парирую стрелы» — Драка вместо Атлетики против стрел и метательного оружия;
— «Раз за сцену или сессию могу [эффект]»: «Знак Игни» — раз за сцену поджигает всё в одном секторе.

Хороший трюк:
— называет узкое условие, которое реально случается в игре;
— даёт заметную выгоду, но не отменяет сцену целиком;
— не дублирует навык: «умею драться» — не трюк, а Драка;
— три карточки не повторяют друг друга и не пересказывают концепцию.

Слабые трюки:
— «Всегда +2 к Драке» — срабатывает всегда, условие отсутствует;
— «Мастерство» — нет ни навыка, ни условия, ни эффекта;
— «Серебряный меч» без названия навыка и ситуации — непонятно, когда он работает.

КАК ОТВЕЧАТЬ
Вердикт — 2–4 слова: суть оценки, без цифр и без слова «оценка».
Что усилить — для каждой заполненной карточки, с её номером: что не так (до 8 слов), через тире переписанный трюк до 20 слов — название и эффект.
Чего не хватает — для каждой пустой карточки, с её номером: ровно два варианта до 10 слов, каждый — название и эффект.
Не выдумывай фактов о герое, которых нет в тексте.`;

const KIND_BRIEF: Record<ReviewKind, string> = {
  concept: CONCEPT_BRIEF,
  trouble: TROUBLE_BRIEF,
  aspects: ASPECTS_BRIEF,
  stunts: STUNTS_BRIEF,
};

const JSON_SINGLE = (withOverlap: boolean): string => `Ответ — только JSON без markdown и текста вокруг:
{"score":3,"verdict":"живая концепция","strengths":["...","..."],"issues":["...","..."],"variants":["...","..."],${withOverlap ? '"overlap":null,' : ''}}
score — оценка 1–5. verdict — вердикт. strengths — «что хорошо», ровно 2. issues — «что не так», 1–3 коротких пункта без готовых замен. variants — «как будет лучше», ровно 2 переписанных варианта целиком.${withOverlap ? ' overlap — что совпало с концепцией, или null.' : ''} Других полей нет.`;

const JSON_BATCH = `Ответ — только JSON без markdown и текста вокруг:
{"score":3,"verdict":"два поля рабочие","slots":[{"slot":0,"advice":"готовая замена","options":[]},{"slot":1,"advice":null,"options":["первый вариант","второй вариант"]}]}
score — оценка 1–5. verdict — вердикт. slots — ровно три, по порядку: slot 0, 1, 2.
Заполненное поле: advice — готовая замена, options — [].
Пустое поле: advice — null, options — ровно два варианта.`;

function systemPrompt(kind: ReviewKind): string {
  const brief = KIND_BRIEF[kind];
  if (kind === 'aspects' || kind === 'stunts') return `${BASE_RULES}\n\n${brief}\n\n${JSON_BATCH}`;
  return `${BASE_RULES}\n\n${brief}\n\n${JSON_SINGLE(kind === 'trouble')}`;
}

/**
 * Что показывать модели вместе с проверяемым текстом.
 * Концепция — вершина листа: её прорабатывают отдельно, ничего не сравнивая.
 * Проблема опирается только на концепцию; свободные аспекты и трюки, которые
 * растут уже из неё, — на концепцию и проблему.
 */
function buildContext(input: ReviewInput): string[] {
  if (input.kind === 'concept') return [];
  const lines: string[] = [];
  const concept = input.concept.trim();
  if (concept) lines.push(`Концепция: ${concept}`);
  if (input.kind === 'trouble') return lines;
  const trouble = input.trouble.trim();
  if (trouble) lines.push(`Проблема: ${trouble}`);
  return lines;
}

function buildUserMessage(input: ReviewInput): string {
  const setting = input.setting === 'witcher' ? 'Ведьмак' : 'Fate Core';
  if (input.kind === 'aspects' || input.kind === 'stunts') {
    const noun = input.kind === 'aspects' ? 'Аспект' : 'Трюк';
    const lines = [
      `Тип проверки: ${KIND_LABEL[input.kind]}.`,
      `Сеттинг: ${setting}.`,
      `Проверяемые ${input.kind === 'aspects' ? 'аспекты' : 'трюки'}:`,
    ];
    input.items.slice(0, 3).forEach((text, index) => {
      lines.push(`${noun} ${index + 1}: ${text.trim() || '(пусто)'}`);
    });
    const context = buildContext(input);
    if (context.length > 0) lines.push('', 'Что уже есть у героя:', ...context);
    return lines.join('\n');
  }
  const lines = [
    `Тип проверки: ${KIND_LABEL[input.kind]}.`,
    `Сеттинг: ${setting}.`,
    `Проверяемый текст: ${input.text.trim()}`,
  ];
  const context = buildContext(input);
  if (context.length > 0) lines.push('', 'Что уже есть у героя:', ...context);
  return lines.join('\n');
}

function pacificOffsetMs(at: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(at));
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') === 24 ? 0 : get('hour'),
    get('minute'),
    get('second'),
  );
  return asUtc - at;
}

function nextPacificMidnight(now: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now));
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const targetLocal = Date.UTC(get('year'), get('month') - 1, get('day') + 1);
  return targetLocal - pacificOffsetMs(targetLocal);
}

function quotaResetAt(error: unknown): number {
  const text = errorText(error);
  const match = text.match(/retryDelay\D{0,12}(\d+)s/i);
  if (match) return Date.now() + Number(match[1]) * 1000 + 5000;
  return nextPacificMidnight(Date.now());
}

type AiModule = typeof import('firebase/ai');

const MODEL_IDS = ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'] as const;
const modelCache = new Map<string, Promise<import('firebase/ai').GenerativeModel>>();

async function createModel(modelId: string, kind: ReviewKind) {
  if (!firebaseApp) throw new Error('Firebase не настроен.');
  await ensureAppCheck();
  const { GoogleAIBackend, Schema, ThinkingLevel, getAI, getGenerativeModel } =
    (await import('firebase/ai')) as AiModule;
  const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  const batch = kind === 'aspects' || kind === 'stunts';
  const schema = batch
    ? Schema.object({
        properties: {
          score: Schema.integer(),
          verdict: Schema.string(),
          slots: Schema.array({
            items: Schema.object({
              properties: {
                slot: Schema.integer(),
                advice: Schema.string({ nullable: true }),
                options: Schema.array({ items: Schema.string() }),
              },
            }),
          }),
        },
      })
    : Schema.object({
        properties: {
          score: Schema.integer(),
          verdict: Schema.string(),
          strengths: Schema.array({ items: Schema.string() }),
          issues: Schema.array({ items: Schema.string() }),
          variants: Schema.array({ items: Schema.string() }),
          ...(kind === 'trouble' ? { overlap: Schema.string({ nullable: true }) } : {}),
        },
      });
  return getGenerativeModel(
    ai,
    {
      model: modelId,
      systemInstruction: systemPrompt(kind),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      },
    },
    { timeout: 20000 },
  );
}

function getModel(modelId: string, kind: ReviewKind) {
  const key = `${modelId}:${kind}`;
  let model = modelCache.get(key);
  if (!model) {
    model = createModel(modelId, kind);
    modelCache.set(key, model);
    void model.catch(() => modelCache.delete(key));
  }
  return model;
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name} ${error.message}`;
  return String(error);
}

function isPermissionError(error: unknown): boolean {
  return /permission denied|permission_denied|\b403\b/i.test(errorText(error));
}

function isQuotaError(error: unknown): boolean {
  return /RESOURCE_EXHAUSTED|\b429\b|quota/i.test(errorText(error));
}

function isOverloaded(error: unknown): boolean {
  return /\b(500|503|504)\b|high demand|overload|temporarily|unavailable/i.test(errorText(error));
}

function parseResult(raw: string): ReviewResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('Модель ответила не JSON.');
  }
  if (typeof value !== 'object' || value === null) throw new Error('Пустой ответ модели.');
  const data = value as Record<string, unknown>;
  const score = data.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Некорректная оценка.');
  }
  if (typeof data.verdict !== 'string' || !data.verdict.trim()) throw new Error('Нет вывода.');
  if (!Array.isArray(data.strengths) || data.strengths.length !== 2) {
    throw new Error('Не две сильные стороны.');
  }
  if (!Array.isArray(data.issues) || data.issues.length < 1 || data.issues.length > 3) {
    throw new Error('Нет разбора слабых сторон.');
  }
  if (!Array.isArray(data.variants) || data.variants.length !== 2) {
    throw new Error('Не два варианта.');
  }
  const strengths = data.strengths.map((item) => {
    if (typeof item !== 'string' || !item.trim()) throw new Error('Пустая сильная сторона.');
    return item.trim();
  });
  const issues = data.issues.map((item) => {
    if (typeof item !== 'string' || !item.trim()) throw new Error('Пустая слабая сторона.');
    return item.trim();
  });
  const variants = data.variants.map((item) => {
    if (typeof item !== 'string' || !item.trim()) throw new Error('Пустой вариант.');
    return item.trim();
  });
  const overlap = data.overlap === null ? null : typeof data.overlap === 'string' ? data.overlap.trim() : null;
  return { score, verdict: data.verdict.trim(), strengths, issues, variants, overlap };
}

function parseBatch(raw: string, texts: string[]): BatchResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('Модель ответила не JSON.');
  }
  if (typeof value !== 'object' || value === null) throw new Error('Пустой ответ модели.');
  const data = value as Record<string, unknown>;
  const score = data.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Некорректная оценка.');
  }
  if (typeof data.verdict !== 'string' || !data.verdict.trim()) throw new Error('Нет вывода.');
  if (!Array.isArray(data.slots)) throw new Error('Нет разбора по аспектам.');
  const parsed = new Map<number, BatchSlot>();
  data.slots.forEach((item) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const slot = record.slot;
    if (typeof slot !== 'number' || !Number.isInteger(slot)) return;
    const advice = typeof record.advice === 'string' ? record.advice.trim() : '';
    const options = Array.isArray(record.options)
      ? record.options
          .filter((option): option is string => typeof option === 'string')
          .map((option) => option.trim())
          .filter(Boolean)
      : [];
    parsed.set(slot, { slot, advice: advice || null, options });
  });
  const slots: BatchSlot[] = texts.slice(0, 3).map((text, index) => {
    const item = parsed.get(index);
    if (text.trim()) {
      if (!item?.advice) throw new Error('Не хватает правки.');
      return { slot: index, advice: item.advice, options: [] };
    }
    if (!item || item.options.length === 0) throw new Error('Не хватает вариантов для пустого поля.');
    return { slot: index, advice: null, options: item.options.slice(0, 2) };
  });
  return { score, verdict: data.verdict.trim(), slots };
}

/** Один запрос на три свободных аспекта или три трюка. */
export async function reviewBatch(input: ReviewInput): Promise<BatchResult> {
  const texts = input.items.slice(0, 3);
  if (!texts.some((text) => text.trim())) throw new Error('Сначала заполните хотя бы одно поле.');
  let lastError: unknown = null;
  let quotaReset = 0;
  for (const modelId of MODEL_IDS) {
    let model: import('firebase/ai').GenerativeModel;
    try {
      model = await getModel(modelId, input.kind);
    } catch (error) {
      lastError = error;
      continue;
    }
    const tries = modelId === MODEL_IDS[0] ? 2 : 1;
    for (let attempt = 0; attempt < tries; attempt += 1) {
      try {
        const response = await model.generateContent(buildUserMessage(input));
        return parseBatch(response.response.text().trim(), texts);
      } catch (error) {
        lastError = error;
        if (isPermissionError(error)) {
          throw new Error('Проверка пока не подключена. Включите Firebase AI Logic и App Check в консоли Firebase.');
        }
        if (isQuotaError(error)) {
          quotaReset = Math.max(quotaReset, quotaResetAt(error));
          break;
        }
        if (isOverloaded(error)) break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (quotaReset > 0) throw new QuotaError(quotaReset);
  console.error('AI review failed', lastError);
  if (lastError && isOverloaded(lastError)) {
    throw new Error('Модель сейчас перегружена. Попробуйте через минуту.');
  }
  throw new Error('Проверка сейчас недоступна. Попробуйте позже.');
}

export async function reviewElement(input: ReviewInput): Promise<ReviewResult> {
  if (!input.text.trim()) throw new Error('Сначала заполните поле.');
  let lastError: unknown = null;
  let quotaReset = 0;
  for (const modelId of MODEL_IDS) {
    let model: import('firebase/ai').GenerativeModel;
    try {
      model = await getModel(modelId, input.kind);
    } catch (error) {
      lastError = error;
      continue;
    }
    const tries = modelId === MODEL_IDS[0] ? 2 : 1;
    for (let attempt = 0; attempt < tries; attempt += 1) {
      try {
        const response = await model.generateContent(buildUserMessage(input));
        return parseResult(response.response.text().trim());
      } catch (error) {
        lastError = error;
        if (isPermissionError(error)) {
          throw new Error('Проверка пока не подключена. Включите Firebase AI Logic и App Check в консоли Firebase.');
        }
        if (isQuotaError(error)) {
          quotaReset = Math.max(quotaReset, quotaResetAt(error));
          break;
        }
        if (isOverloaded(error)) break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (quotaReset > 0) throw new QuotaError(quotaReset);
  console.error('AI review failed', lastError);
  if (lastError && isOverloaded(lastError)) {
    throw new Error('Модель сейчас перегружена. Попробуйте через минуту.');
  }
  throw new Error('Проверка сейчас недоступна. Попробуйте позже.');
}

/** Ручная проверка: тот же бриф и разбор, но обычным текстом для чужого чата. */
function manualAnswer(kind: ReviewKind): string {
  const head = `Ответ — обычным текстом, строго по шаблону и без вступлений.
Каждый пункт — с новой строки, с тире, без нумерации:
Оценка: X/5
Вердикт: ...`;
  if (kind === 'aspects' || kind === 'stunts') {
    const one = kind === 'aspects' ? 'Аспект' : 'Трюк';
    return `${head}
Что усилить — для каждого заполненного, с его номером:
— ${one} <номер>. <что не так> — <готовая замена>.
Чего не хватает — для каждого пустого, по два варианта с его номером:
— ${one} <номер>. <первый вариант> / <второй вариант>`;
  }
  const overlap = kind === 'concept' ? '' : 'Пересечение: ... (или «нет»)\n';
  return `${head}
Что хорошо:
— ...
— ...
Что не так:
— ...
— ...
Как будет лучше:
— ...
— ...
${overlap}`;
}

export function buildManualPrompt(input: ReviewInput): string {
  return `${BASE_RULES}\n\n${KIND_BRIEF[input.kind]}\n\n${manualAnswer(input.kind)}\n\n${buildUserMessage(input)}`;
}

export function reviewErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Firebase не настроен')) return 'Проверка недоступна: Firebase не настроен.';
    if (error.message.includes('Проверка пока не подключена')) return error.message;
    if (error.message.includes('permission') || error.message.includes('Permission') || error.message.includes('403')) {
      return 'Проверка пока не подключена. Включите Firebase AI Logic и App Check в консоли Firebase.';
    }
    if (error.message.includes('Сначала заполните')) return error.message;
    if (error.message.includes('Модель сейчас перегружена')) return error.message;
    if (error.message.includes('Проверка сейчас недоступна')) return error.message;
    if (error.message.includes('лимит проверок')) return error.message;
    if (error.message.includes('совет') || error.message.includes('оценка') || error.message.includes('JSON')) {
      return 'Не удалось разобрать ответ. Попробуйте ещё раз.';
    }
  }
  return 'Проверка не удалась. Попробуйте ещё раз.';
}
