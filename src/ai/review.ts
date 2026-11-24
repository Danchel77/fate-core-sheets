import { firebaseApp } from '../firebase/app';
import { ensureAppCheck } from '../firebase/appCheck';

export type ReviewKind = 'concept' | 'trouble' | 'aspects' | 'stunt';

export type ReviewInput = {
  kind: ReviewKind;
  setting: 'fate' | 'witcher';
  text: string;
  concept: string;
  trouble: string;
  aspects: string[];
};

export type ReviewAdvice = { what: string; how: string };

export type ReviewResult = {
  score: number;
  verdict: string;
  strengths: string[];
  advice: ReviewAdvice[];
  overlap: string | null;
  example: string | null;
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
  stunt: 'трюк',
};

/**
 * Общие правила для обеих проверок: встроенной и ручной.
 * Задача — короткий разбор с готовыми правками, без пересказа правил и воды.
 */
const RULES = `Ты — редактор листа персонажа Fate Core. Пиши по-русски, коротко и только про проверяемый текст: без вступлений, без пересказа правил, без вопросов и без похвалы «в целом».

ЧТО СМОТРЕТЬ
Концепция: кто герой и чем занимается; есть ли вторая сторона — повод призвать и повод навязать неприятность. Оценивай текст сам по себе и ничего с ним не сравнивай.
Проблема: конкретный порок, враг, долг или проклятие, которое будет мешать; не цель и не следствие профессии. Сверяй только с концепцией: проблема не должна её пересказывать.
Свободные аспекты: правдивая фраза, которая работает в обе стороны; не лозунг, не навык, не трюк. Их проверяют по три сразу: заполненные сверяй с концепцией, проблемой и между собой — смысл не должен повторяться.
Трюк: узкий приём с условием; не заменяет навык и не срабатывает всегда. Сверяй с концепцией.

КАК ПИСАТЬ
Вердикт — 2–4 слова: суть оценки, без цифр и без слова «оценка».
Что хорошо — ровно 2 пункта до 14 слов: деталь из текста и что она даёт за столом. Не пересказывай текст и не повторяй одну мысль дважды.
Что усилить — ровно 2 пункта: сначала что не так (до 8 слов), потом готовая замена или добавка до 18 слов, которую можно вписать в лист как есть.
Пересечение — только если проверяемый текст повторяет смысл другого элемента: назови элемент и что совпадает. Иначе «нет». Для концепции — всегда «нет».
Пример — переписанный сам текст, если его можно усилить, иначе «—». Не придумывай нового элемента и не уходи в другой жанр.

ГРАНИЦЫ
Не выдумывай фактов о герое, которых нет в тексте.
Не предлагай больше двух правок и не давай советов «в общем».
Если в тексте не хватает нужной детали, скажи об этом в «что усилить», а не в вердикте.

ТРИ АСПЕКТА СРАЗУ
Заполненному аспекту — одна правка с готовой заменой, до 20 слов.
Пустому полю — ровно два варианта до 10 слов: первый спокойнее, второй смелее.
Варианты не должны повторять концепцию, проблему и уже написанные аспекты.
Каждый вариант — законченная фраза для листа, без пояснений в скобках.

ОЦЕНКА
5 — играть можно сразу. 4 — одна деталь просит правки. 3 — провисает одна сторона. 2 — лозунг, навык или общее место. 1 — не по теме или противоречит Fate.`;

const JSON_ANSWER = `Ответ — только JSON без markdown и текста вокруг:
{"score":4,"verdict":"живая концепция","strengths":["...","..."],"advice":[{"what":"...","how":"..."},{"what":"...","how":"..."}],"overlap":null,"example":null}
score — оценка 1–5. verdict — вердикт. strengths — «что хорошо». advice — «что усилить»: what — что не так, how — готовая замена. overlap — пересечение или null. example — пример или null. Других полей нет.`;

const JSON_ANSWER_BATCH = `Ответ — только JSON без markdown и текста вокруг:
{"score":3,"verdict":"два аспекта рабочие","slots":[{"slot":0,"advice":"готовая замена","options":[]},{"slot":1,"advice":null,"options":["первый вариант","второй вариант"]}]}
score — оценка 1–5. verdict — вердикт. slots — ровно три, по порядку: slot 0, 1, 2.
Заполненный аспект: advice — готовая замена, options — [].
Пустое поле: advice — null, options — ровно два варианта.`;

const SYSTEM_PROMPT = `${RULES}\n\n${JSON_ANSWER}`;
const SYSTEM_PROMPT_BATCH = `${RULES}\n\n${JSON_ANSWER_BATCH}`;

/**
 * Что показывать модели вместе с проверяемым текстом.
 * Концепция — вершина листа: её прорабатывают отдельно, ничего не сравнивая.
 * Проблема опирается только на концепцию, свободный аспект — на всё, что выше
 * и рядом. Трюк сверяется с концепцией.
 */
function buildContext(input: ReviewInput): string[] {
  if (input.kind === 'concept') return [];
  const lines: string[] = [];
  const concept = input.concept.trim();
  if (concept) lines.push(`Концепция: ${concept}`);
  if (input.kind === 'trouble' || input.kind === 'stunt') return lines;
  const trouble = input.trouble.trim();
  if (trouble) lines.push(`Проблема: ${trouble}`);
  return lines;
}

function buildUserMessage(input: ReviewInput): string {
  const setting = input.setting === 'witcher' ? 'Ведьмак' : 'Fate Core';
  if (input.kind === 'aspects') {
    const lines = [
      `Тип проверки: ${KIND_LABEL[input.kind]}.`,
      `Сеттинг: ${setting}.`,
      'Проверяемые аспекты:',
    ];
    input.aspects.slice(0, 3).forEach((text, index) => {
      lines.push(`Аспект ${index + 1}: ${text.trim() || '(пусто)'}`);
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

async function createModel(modelId: string, batch = false) {
  if (!firebaseApp) throw new Error('Firebase не настроен.');
  await ensureAppCheck();
  const { GoogleAIBackend, Schema, ThinkingLevel, getAI, getGenerativeModel } =
    (await import('firebase/ai')) as AiModule;
  const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
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
          advice: Schema.array({
            items: Schema.object({
              properties: { what: Schema.string(), how: Schema.string() },
            }),
          }),
          overlap: Schema.string({ nullable: true }),
          example: Schema.string({ nullable: true }),
        },
      });
  return getGenerativeModel(
    ai,
    {
      model: modelId,
      systemInstruction: batch ? SYSTEM_PROMPT_BATCH : SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      },
    },
    { timeout: 20000 },
  );
}

function getModel(modelId: string, batch = false) {
  const key = batch ? `${modelId}:batch` : modelId;
  let model = modelCache.get(key);
  if (!model) {
    model = createModel(modelId, batch);
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
  if (!Array.isArray(data.advice) || data.advice.length !== 2) {
    throw new Error('Не два совета.');
  }
  const strengths = data.strengths.map((item) => {
    if (typeof item !== 'string' || !item.trim()) throw new Error('Пустая сильная сторона.');
    return item.trim();
  });
  const advice = data.advice.map((item) => {
    if (typeof item !== 'object' || item === null) throw new Error('Некорректный совет.');
    const record = item as Record<string, unknown>;
    if (typeof record.what !== 'string' || typeof record.how !== 'string') {
      throw new Error('Некорректный совет.');
    }
    return { what: record.what.trim(), how: record.how.trim() };
  });
  const overlap = data.overlap === null ? null : typeof data.overlap === 'string' ? data.overlap.trim() : null;
  const example = data.example === null ? null : typeof data.example === 'string' ? data.example.trim() : null;
  return { score, verdict: data.verdict.trim(), strengths, advice, overlap, example };
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
      if (!item?.advice) throw new Error('Не хватает правки для аспекта.');
      return { slot: index, advice: item.advice, options: [] };
    }
    if (!item || item.options.length === 0) throw new Error('Не хватает вариантов для пустого поля.');
    return { slot: index, advice: null, options: item.options.slice(0, 2) };
  });
  return { score, verdict: data.verdict.trim(), slots };
}

export async function reviewAspects(input: ReviewInput): Promise<BatchResult> {
  const texts = input.aspects.slice(0, 3);
  if (!texts.some((text) => text.trim())) throw new Error('Сначала заполните хотя бы одно поле.');
  let lastError: unknown = null;
  let quotaReset = 0;
  for (const modelId of MODEL_IDS) {
    let model: import('firebase/ai').GenerativeModel;
    try {
      model = await getModel(modelId, true);
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
      model = await getModel(modelId);
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

/** Ручная проверка: тот же разбор, но обычным текстом для чужого чата. */
function manualFormat(kind: ReviewKind): string {
  if (kind === 'aspects') {
    return `Ответь обычным текстом, без JSON и markdown, строго по шаблону и без вступлений:
Оценка: X/5
Вердикт: ...
Заполненные аспекты:
1. <аспект> — готовая замена.
2. <аспект> — готовая замена.
Пустые поля — по два варианта на каждое:
3. <номер поля>: первый вариант / второй вариант
Пример: ... (или «—»)`;
  }
  const overlap = kind === 'concept' ? '' : 'Пересечение: ... (или «нет»)\n';
  return `Ответь обычным текстом, без JSON и markdown, строго по шаблону и без вступлений:
Оценка: X/5
Вердикт: ...
Что хорошо:
1. ...
2. ...
Что усилить:
1. Что не так — готовая замена.
2. Что не так — готовая замена.
${overlap}Пример: ... (или «—»)`;
}

export function buildManualPrompt(input: ReviewInput): string {
  return `${RULES}\n\n${manualFormat(input.kind)}\n\n${buildUserMessage(input)}`;
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
