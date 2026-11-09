import { getLocalGeminiApiKey } from './storage';
import { SettingType } from '../types/character';

export interface GeminiSuggestion {
  title: string;
  description: string;
}

export async function askGeminiForAspect(
  aspectKind: 'high_concept' | 'trouble' | 'other',
  characterName: string,
  setting: SettingType,
  existingAspects: Record<string, string>,
  notes?: string
): Promise<GeminiSuggestion[]> {
  const apiKey = getLocalGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const settingDesc = setting === 'witcher' 
    ? 'вселенная Ведьмака Анджея Сапковского (тёмное славянское фэнтези, чудовища, ведьмачьи цехи, кметы, Нильфгаард, цинизм, серая мораль)' 
    : 'универсальный настольный Fate Core (любой сеттинг от космооперы до нуарного детектива)';

  const kindNames = {
    high_concept: 'Главная концепция (кто персонаж, его призвание, суть и яркий эпитет)',
    trouble: 'Проблема (что осложняет ему жизнь: слабость, заклятый враг, долг, зависимость, кодекс)',
    other: 'Свободный аспект (отношения, знаковая вещь, убеждение или боевой стиль)'
  };

  const systemInstruction = `Ты — опытный Мастер настольной ролевой игры Fate Core и знаток сеттинга ${settingDesc}.
Твоя задача — помочь игроку сформулировать 3 ярких драматических аспекта на выбор.
Помни золотые правила Fate Core:
1. Аспект должен иметь двойное дно (быть полезным для получения преимущества, но давать Мастеру повод для принуждения и драмы).
2. Аспект должен звучать броско, кинематографично и вдохновляюще.
3. Отвечай строго в формате JSON: массив из 3 объектов вида [{"title": "Короткий аспект (до 5-7 слов)", "description": "Краткое пояснение: как использовать в плюс и как в минус (1-2 предложения)"}].`;

  const userPrompt = `Персонаж: "${characterName || 'Безымянный'}"
Сеттинг: ${settingDesc}
Целевой слот: ${kindNames[aspectKind]}
Уже известные аспекты героя:
- Концепция: ${existingAspects.high_concept || 'Не задана'}
- Проблема: ${existingAspects.trouble || 'Не задана'}
- Другие: ${Object.entries(existingAspects).filter(([k]) => !['high_concept', 'trouble'].includes(k)).map(([_, v]) => v).join(', ') || 'Нет'}
${notes ? `Дополнительные пожелания игрока: "${notes}"` : ''}

Предложи 3 отличных варианта в JSON формате.`;

  // We call the Gemini API endpoint
  // Using gemini-2.5-flash or gemini-1.5-flash compatible endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Пустой ответ от Gemini');

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) return parsed.suggestions;
    return [];
  } catch (err) {
    console.error('Failed to parse Gemini JSON response', text);
    throw new Error('Не удалось разобрать ответ ИИ');
  }
}

export async function askGeminiForStunt(
  characterName: string,
  setting: SettingType,
  skillName: string,
  existingAspects: Record<string, string>,
  notes?: string
): Promise<GeminiSuggestion[]> {
  const apiKey = getLocalGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const settingDesc = setting === 'witcher' ? 'вселенная Ведьмака' : 'универсальный Fate Core';

  const prompt = `Ты — мастер Fate Core по сеттингу "${settingDesc}".
Помоги создать 3 варианта Трюка (Stunt), привязанного к навыку "${skillName}" для персонажа "${characterName || 'Герой'}".
Аспекты персонажа: ${JSON.stringify(existingAspects)}
${notes ? `Пожелания: "${notes}"` : ''}

Трюк в Fate Core должен следовать одной из формул:
1. +2 к конкретному действию (Преодоление, Создание преимущества, Атака, Защита) в узких специфических условиях.
2. Возможность использовать навык ${skillName} вместо другого навыка в особой ситуации.
3. Особый разовый драматический эффект (например, раз в сцену за жетон судьбы).

Отвечай строго массивом JSON: [{"title": "Название трюка", "description": "Потому что я [описание], я получаю +2 к [навык] когда я [условие]..."}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : (parsed.suggestions || []);
}
