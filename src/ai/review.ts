import { firebaseApp } from '../firebase/app';
import { ensureAppCheck } from '../firebase/appCheck';

export type ReviewKind = 'concept' | 'trouble' | 'aspect' | 'stunt';

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
  aspect: 'аспект',
  stunt: 'трюк',
};

const SYSTEM_PROMPT = `Ты — опытный ведущий Fate Core. Проверяешь один элемент персонажа: концепцию, проблему, аспект или трюк. Пиши по-русски, коротко и по делу. Не переписывай персонажа и не придумывай новый лист.

КОНЦЕПЦИЯ
Хорошая концепция — одна фраза о том, кто герой и чем он занимается. В ней видно и повод призвать аспект, и повод навязать неприятность.
Плохо: «Непобедимый мечник», «Опытный воин» — это роль или лозунг, второй стороны нет.
Хорошо: «Опытный ведьмак, скрывающий проклятье.» — видно ремесло и тайну, которая осложняет жизнь.

ПРОБЛЕМА
Проблема — порок, враг, долг или проклятие, которое регулярно втягивает героя в неприятности. Это не цель и не задача, которую можно решить раз и навсегда, и она не должна пересказывать концепцию.
Плохо: «Криминальный мир меня ненавидит» при концепции «Ведущий детектив» — это следствие профессии, а не отдельная проблема. «Найти убийцу» — цель.
Хорошо: «Дон Джованни ненавидит меня лично» — конкретный враг, который будет мешать.

АСПЕКТ
Аспект — правдивая фраза о герое или мире, важная для истории. Он должен работать в обе стороны: за жетон даёт +2 или переброс, а Мастер может навязать его как осложнение. Аспект не абсолют, не навык, не трюк и не повторяет другие аспекты.
Плохо: «Непобедимый мечник», «Тяжёлое прошлое» — нет второй стороны или слишком размыто.
Хорошо: «Серебряный меч отца» — помогает против нечисти, но создаёт проблемы, когда меч узнают.

ТРЮК
Трюк — узкий приём, который даёт преимущество в конкретном случае. Он не работает всегда и не заменяет навык.
Формулы: «Потому что я …, я получаю +2 к … при …, когда …»; «… я использую … вместо …, когда …»; «Раз за сцену я могу …».
Плохо: «Я всегда побеждаю», «+2 ко всем броскам».
Хорошо: «Потому что я вырос в канализации, я получаю +2 к Скрытности, когда прячусь в тесных проходах.»

ОЦЕНКА
5 — можно играть сразу.
4 — сильный элемент, одна деталь просит правки.
3 — рабочий, но одна сторона провисает.
2 — лозунг, навык, слишком общее или нет второй стороны.
1 — не по теме, пусто или противоречит Fate.

В strengths — ровно две конкретные сильные стороны. В advice — ровно два улучшения: что не так и как исправить. Ссылайся на слова проверяемого текста. Если текста мало, оцени его как есть и в advice напиши, каких деталей не хватает. Не задавай вопросов.

Ответ — только JSON без markdown и текста вокруг:
{"score":4,"verdict":"сильная концепция","strengths":["...","..."],"advice":[{"what":"...","how":"..."},{"what":"...","how":"..."}],"overlap":null,"example":null}
score — целое от 1 до 5. overlap — строка «пересекается с аспектом „…“» или null. example — короткая улучшенная версия текста или null. Других полей нет.`;

function buildUserMessage(input: ReviewInput): string {
  const lines = [
    `Тип проверки: ${KIND_LABEL[input.kind]}.`,
    `Сеттинг: ${input.setting === 'witcher' ? 'Ведьмак' : 'Fate Core'}.`,
    `Проверяемый текст: ${input.text.trim()}`,
    '',
    'Уже заполнено у героя:',
    `Концепция: ${input.concept.trim() || '—'}`,
    `Проблема: ${input.trouble.trim() || '—'}`,
  ];
  const aspects = input.aspects.map((aspect) => aspect.trim()).filter(Boolean);
  if (aspects.length > 0) {
    lines.push('Другие аспекты:');
    aspects.forEach((aspect, index) => lines.push(`${index + 1}. ${aspect}`));
  }
  lines.push('', 'Сравни проверяемый текст с уже заполненным и укажи overlap, если он повторяет смысл другого элемента.');
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

async function createModel(modelId: string) {
  if (!firebaseApp) throw new Error('Firebase не настроен.');
  await ensureAppCheck();
  const { GoogleAIBackend, Schema, ThinkingLevel, getAI, getGenerativeModel } =
    (await import('firebase/ai')) as AiModule;
  const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  const advice = Schema.object({
    properties: { what: Schema.string(), how: Schema.string() },
  });
  const schema = Schema.object({
    properties: {
      score: Schema.integer(),
      verdict: Schema.string(),
      strengths: Schema.array({ items: Schema.string() }),
      advice: Schema.array({ items: advice }),
      overlap: Schema.string({ nullable: true }),
      example: Schema.string({ nullable: true }),
    },
  });
  return getGenerativeModel(
    ai,
    {
      model: modelId,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      },
    },
    { timeout: 20000 },
  );
}

function getModel(modelId: string) {
  let model = modelCache.get(modelId);
  if (!model) {
    model = createModel(modelId);
    modelCache.set(modelId, model);
    void model.catch(() => modelCache.delete(modelId));
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

const MANUAL_INSTRUCTION = `Ответь обычным текстом, без JSON и без markdown, в таком порядке:
Оценка: X/5
Вердикт: ...
Что хорошо:
1. ...
2. ...
Что усилить:
1. ...
2. ...
Пересечение: ... (или «нет»)
Пример: ... (или «—»)`;

export function buildManualPrompt(input: ReviewInput): string {
  const rules = SYSTEM_PROMPT.replace(/\n\nОтвет — только JSON[\s\S]*$/, '');
  return `${rules}\n\n${MANUAL_INSTRUCTION}\n\n${buildUserMessage(input)}`;
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
