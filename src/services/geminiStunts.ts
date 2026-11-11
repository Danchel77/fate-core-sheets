import { getLocalGeminiApiKey } from './storage';
import { ACTION_LABELS } from '../config/skillActions';
import { STUNT_PATTERNS } from '../config/stuntPatterns';
import type { ActionType, StuntTemplate } from '../types/fate';

export interface StuntEvaluation {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  pattern: StuntTemplate;
  patternNote: string;
}

export interface StuntSuggestionInput {
  name: string;
  description: string;
  template: StuntTemplate;
  skillId?: string;
  action?: ActionType;
  situation?: string;
}

export interface StuntContext {
  characterName: string;
  setting: 'witcher' | 'universal';
  skills: { name: string; rating: number }[];
  stunts: string[];
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

const DEFAULT_VERDICT = 'Трюк понятен, но условие срабатывания стоит сузить.';
const DEFAULT_PATTERN_NOTE = 'Формулировка держится шаблона, но ей не хватает узкого условия.';

/* ------------------------------------------------------------------ */
/* Низкоуровневые помощники                                            */
/* ------------------------------------------------------------------ */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    const text = readString(item);
    if (!text) continue;
    result.push(text);
    if (result.length >= limit) break;
  }
  return result;
}

function isStuntTemplate(value: string): value is StuntTemplate {
  return value === 'bonus' || value === 'swap' || value === 'special';
}

function isActionType(value: string): value is ActionType {
  return value === 'overcome' || value === 'advantage' || value === 'attack' || value === 'defend';
}

function parsePattern(value: unknown, fallback: StuntTemplate = 'bonus'): StuntTemplate {
  const text = readString(value).toLowerCase();
  return isStuntTemplate(text) ? text : fallback;
}

function parseScore(value: unknown): number {
  let numeric = Number.NaN;
  if (typeof value === 'number') {
    numeric = value;
  } else if (typeof value === 'string' && value.trim() !== '') {
    numeric = Number(value.trim());
  }
  if (!Number.isFinite(numeric)) return 5;
  // Модель может вернуть 0, 11 или 7.5 — лист ждёт целое на шкале 1..10.
  return Math.min(10, Math.max(1, Math.round(numeric)));
}

function pickText(value: unknown, fallback: string): string {
  const text = readString(value);
  return text || fallback;
}

/**
 * Достаёт text из ответа Gemini, не доверяя форме объекта:
 * candidates[0].content.parts[0].text может отсутствовать или быть пустым.
 */
function extractCandidateText(data: unknown): string {
  const root = asRecord(data);
  if (!root) return '';
  const candidates = root.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return '';
  const first = asRecord(candidates[0]);
  if (!first) return '';
  const content = asRecord(first.content);
  if (!content) return '';
  const parts = content.parts;
  if (!Array.isArray(parts)) return '';
  for (const part of parts) {
    const text = readString(asRecord(part)?.text);
    if (text) return text;
  }
  return '';
}

async function requestGeminiJson(prompt: string, temperature: number): Promise<unknown> {
  const apiKey = getLocalGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Ключ уходит только в URL запроса и никогда не попадает в сообщения об ошибках.
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      const errorText = await response.text();
      if (errorText.toLowerCase().includes('per day')) {
        throw new Error('Дневной лимит Gemini на сегодня исчерпан. Попробуйте позже или подключите другой ключ.');
      }
      throw new Error('Gemini перегружен, попробуйте ещё раз.');
    }
    if (response.status === 400 || response.status === 403 || response.status === 404) {
      throw new Error('Gemini отклонил запрос: ключ не подходит или модель недоступна.');
    }
    throw new Error('Gemini перегружен, попробуйте ещё раз.');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('Не удалось разобрать ответ ИИ');
  }

  const text = extractCandidateText(data);
  if (!text) throw new Error('Пустой ответ от Gemini');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Не удалось разобрать ответ ИИ');
  }
}

/* ------------------------------------------------------------------ */
/* Нормализация ответов                                                */
/* ------------------------------------------------------------------ */

export function parseEvaluation(raw: unknown): StuntEvaluation {
  const source = asRecord(raw) ?? {};

  return {
    score: parseScore(source.score),
    verdict: pickText(source.verdict, DEFAULT_VERDICT),
    strengths: readStringList(source.strengths, 2),
    improvements: readStringList(source.improvements, 2),
    pattern: parsePattern(source.pattern),
    patternNote: pickText(source.patternNote, DEFAULT_PATTERN_NOTE),
  };
}

function parseSuggestionItem(item: unknown): StuntSuggestionInput | null {
  const source = asRecord(item);
  if (!source) return null;

  const name = readString(source.name);
  const description = readString(source.description);
  if (!name || !description) return null;

  // Для предложений невалидный шаблон — повод выбросить элемент: карточка без
  // шаблона не отрисуется, а подставлять 'bonus' значит молча искажать идею.
  const rawTemplate = readString(source.template).toLowerCase();
  if (!isStuntTemplate(rawTemplate)) return null;

  const skillId = readString(source.skillId);
  const action = readString(source.action).toLowerCase();
  const situation = readString(source.situation);

  const result: StuntSuggestionInput = {
    name,
    description,
    template: rawTemplate,
  };
  if (skillId) result.skillId = skillId;
  if (isActionType(action)) result.action = action;
  if (situation) result.situation = situation;
  return result;
}

export function parseSuggestions(raw: unknown, count: number): StuntSuggestionInput[] {
  // count приводим к безопасному целому: 0 — валидный запрос «ничего не надо».
  const limit = Number.isFinite(count) ? Math.min(Math.max(Math.trunc(count), 0), 3) : 3;
  if (limit === 0) return [];

  let list: unknown = raw;
  const wrapper = asRecord(raw);
  if (wrapper && Array.isArray(wrapper.suggestions)) {
    list = wrapper.suggestions;
  }
  if (!Array.isArray(list)) return [];

  const result: StuntSuggestionInput[] = [];
  for (const item of list) {
    const parsed = parseSuggestionItem(item);
    if (!parsed) continue;
    result.push(parsed);
    if (result.length >= limit) break;
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Сборка промптов                                                     */
/* ------------------------------------------------------------------ */

function describeSetting(setting: StuntContext['setting']): string {
  return setting === 'witcher'
    ? 'вселенная «Ведьмака» Анджея Сапковского (тёмное славянское фэнтези, чудовища, ведьмачьи цехи, кметы, Нильфгаард, серая мораль)'
    : 'универсальный настольный Fate Core (от космооперы до нуарного детектива)';
}

function formatSkillList(skills: StuntContext['skills']): string {
  if (skills.length === 0) return 'навыки не заданы';
  return skills
    .map((skill) => `${skill.name} (${skill.rating >= 0 ? '+' : ''}${skill.rating})`)
    .join(', ');
}

function findSkillName(skillId: string | undefined, skills: StuntContext['skills']): string {
  if (!skillId) return '';
  const lowered = skillId.toLowerCase();
  const match = skills.find((skill) => skill.name.toLowerCase() === lowered);
  return match ? match.name : skillId;
}

function describeStunt(stunt: StuntSuggestionInput, skills: StuntContext['skills']): string {
  const pattern = STUNT_PATTERNS.find((item) => item.id === stunt.template);
  const skill = findSkillName(stunt.skillId, skills);

  const lines = [
    `Название: ${stunt.name || 'пока без названия'}`,
    `Формулировка: ${stunt.description || 'пока не сформулирована'}`,
    `Шаблон: ${pattern ? `${pattern.label} (${pattern.formula})` : stunt.template}`,
    `Навык персонажа: ${skill || 'не выбран'}`,
    `Действие Fate: ${stunt.action ? ACTION_LABELS[stunt.action] : 'не выбрано'}`,
    `Ситуация: ${stunt.situation || 'не задана'}`,
  ];
  return lines.join('\n');
}

function describeNarrative(context: StuntContext): string {
  const stunts = context.stunts.length > 0
    ? context.stunts.map((stunt) => `- ${stunt}`).join('\n')
    : '- трюков пока нет';
  return [
    `Персонаж: ${context.characterName || 'Безымянный'}`,
    `Сеттинг: ${describeSetting(context.setting)}`,
    `Навыки по убыванию: ${formatSkillList(context.skills)}`,
    `Уже существующие трюки (не повторять):\n${stunts}`,
  ].join('\n');
}

function buildEvaluationPrompt(stunt: StuntSuggestionInput, context: StuntContext): string {
  const pattern = STUNT_PATTERNS.find((item) => item.id === stunt.template);
  const templateHint = pattern
    ? `Заявленный шаблон — «${pattern.label}»: ${pattern.formula}.`
    : '';

  return `Ты — опытный Мастер настольной ролевой игры Fate Core и знаток сеттинга «Ведьмак».
Тебе принесли трюк на проверку. Оцени его строго, но по делу.

${describeNarrative(context)}

Проверяемый трюк:
${describeStunt(stunt, context.skills)}
${templateHint}

Критерии оценки:
1. Трюк следует ровно одному из трёх шаблонов Fate и не смешивает их: бонус +2 в узкой ситуации, замена навыка в узких условиях, особое правило «раз за сцену».
2. Условие узкое и конкретное; формулировки вроде «всегда», «в любом бою», «против любого врага» — минус.
3. Трюк опирается на навыки персонажа с их рейтингами и на дух сеттинга, а не висит в вакууме.
4. Трюк не дублирует уже существующие трюки персонажа.
5. Формулировка читается как готовая фраза для листа, а не как заметка автора.

Шкала:
- 9–10 — узкий, кинематографичный и однозначный трюк, придраться не к чему;
- 7–8 — крепкий трюк с мелкой шероховатостью;
- 4–6 — работает, но общее место, условие размыто;
- 1–3 — нарушает правила Fate или дублирует существующий трюк.

Ответ — строго один JSON-объект без markdown и пояснений вокруг:
{"score": 7, "verdict": "одна короткая фраза-вывод", "strengths": ["1–2 пункта"], "improvements": ["1–2 конкретных пункта"], "pattern": "bonus", "patternNote": "одно предложение: как трюк соотносится с паттерном"}
Поле "pattern" — только одно из: "bonus", "swap", "special".`;
}

function buildSuggestionPrompt(context: StuntContext, draft: StuntSuggestionInput | null): string {
  const draftBlock = draft
    ? `\nИгрок уже начал формулировку — сохрани её суть и предложи три улучшенных варианта именно этой идеи, а не что-то постороннее:
${describeStunt(draft, context.skills)}\n`
    : '';

  return `Ты — опытный Мастер настольной ролевой игры Fate Core и знаток сеттинга «Ведьмак».
Придумай ровно 3 РАЗНЫХ трюка для персонажа — готовые фразы, которые можно сразу вписать в лист.

${describeNarrative(context)}
${draftBlock}
Требования:
1. Три варианта должны опираться на разные шаблоны, если это возможно. Если идея игрока явно про один шаблон — можно два варианта в нём, но третий обязан быть другим.
2. Каждый вариант — законченная фраза по формуле своего шаблона:
   - bonus: «Потому что я …, я получаю +2 к … когда …»;
   - swap: «Я могу использовать X вместо Y, когда …»;
   - special: «Раз за сцену, когда …, я могу …».
3. Опирайся на навыки персонажа с рейтингами; не бери навыки, которых у него нет, если вариант от этого не становится заметно ярче.
4. Условие узкое: не «всегда» и не «в любом бою». Один трюк — одна ясная ситуация.
5. Не повторяй уже существующие трюки и не пересказывай их другими словами.
6. Стиль — в духе «Ведьмака»: чудовища, знаки, серебро, алхимия, контракты, цинизм, грязные дороги.

Ответ — строго JSON-массив из 3 объектов без markdown:
[{"name": "короткое название", "description": "готовая фраза целиком", "template": "bonus", "skillId": "id или название навыка персонажа", "action": "attack", "situation": "узкое условие"}]
Поле "template" — только "bonus", "swap" или "special". Поле "action" — только "overcome", "advantage", "attack", "defend" и только для шаблона bonus.`;
}

/* ------------------------------------------------------------------ */
/* Публичный API                                                       */
/* ------------------------------------------------------------------ */

export async function evaluateStunt(
  stunt: StuntSuggestionInput,
  context: StuntContext
): Promise<StuntEvaluation> {
  const raw = await requestGeminiJson(buildEvaluationPrompt(stunt, context), 0.3);
  return parseEvaluation(raw);
}

export async function suggestStunts(
  context: StuntContext,
  draft?: StuntSuggestionInput | null,
  count?: number
): Promise<StuntSuggestionInput[]> {
  const limit = Math.min(Math.max(Math.trunc(count ?? 3), 1), 3);
  const raw = await requestGeminiJson(buildSuggestionPrompt(context, draft ?? null), 0.9);
  return parseSuggestions(raw, limit);
}
