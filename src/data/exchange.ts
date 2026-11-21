import { downloadBlob } from './download';
import { createEmptyCharacter } from './characters';
import type { Character, CharacterRecord, SettingId } from './types';

/**
 * Файл героя. Версия растёт, если состав данных меняется несовместимо:
 * старые файлы при этом продолжают открываться.
 */
const FILE_VERSION = 2;

type CharacterFile = {
  app: 'fate-core-sheets';
  version: number;
  exportedAt: string;
  setting: SettingId;
  sheet: Character;
};

/** Файл несёт героя целиком, вместе с портретом: перенос не требует второй картинки. */
function toFile(record: CharacterRecord): CharacterFile {
  return {
    app: 'fate-core-sheets',
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    setting: record.setting,
    sheet: { ...record.sheet },
  };
}

export function fileText(record: CharacterRecord): string {
  return JSON.stringify(toFile(record), null, 2);
}

function cleanBase(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

export function jsonFileName(record: CharacterRecord): string {
  return `${cleanBase(record.sheet.name) || 'Лист персонажа'}.fate.json`;
}

export function pdfFileName(record: CharacterRecord): string {
  return `${cleanBase(record.sheet.name) || 'Лист персонажа'}.pdf`;
}

export function downloadFile(text: string, fileName: string, type = 'application/json'): void {
  downloadBlob(new Blob([text], { type }), fileName);
}

function asSetting(value: unknown): SettingId | null {
  return value === 'fate' || value === 'witcher' ? value : null;
}

function asInt(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, number));
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Портрет приходит картинкой в тексте; совсем огромные файлы не принимаем. */
const MAX_PORTRAIT = 3_000_000;

function asPortrait(value: unknown): string {
  if (typeof value !== 'string') return '';
  if (!value.startsWith('data:image/')) return '';
  return value.length <= MAX_PORTRAIT ? value : '';
}

function asPair(value: unknown, fallback: [string, string]): [string, string] {
  if (!Array.isArray(value) || value.length !== 2) return fallback;
  return [asText(value[0]), asText(value[1])];
}

/**
 * Разбирает файл героя. Возвращает null, если это не наш файл:
 * битый JSON, чужая версия, нет листа.
 */
export function parseFile(text: string): { setting: SettingId; sheet: Character } | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;

  const file = raw as Partial<CharacterFile>;
  const setting = asSetting(file.setting);
  if (!setting) return null;
  if (typeof file.version === 'number' && file.version > FILE_VERSION) return null;
  if (!file.sheet || typeof file.sheet !== 'object') return null;

  const source = file.sheet as Partial<Character>;
  const base = createEmptyCharacter();
  const aspects = Array.isArray(source.aspects) ? source.aspects : [];
  const ladder = Array.isArray(source.ladder) ? source.ladder : [];
  const stunts = Array.isArray(source.stunts) ? source.stunts : [];
  const consequences = Array.isArray(source.consequences) ? source.consequences : [];

  /* Поднятые вехами ступени (+5, +6) тоже сохраняются: без них импорт терял навыки. */
  const rows = [...base.ladder];
  for (const item of ladder) {
    const value = Number(item?.value);
    if (!Number.isInteger(value) || value < 5 || value > 6) continue;
    if (rows.some((row) => row.value === value)) continue;
    rows.push({ value, skills: [] });
  }
  rows.sort((left, right) => right.value - left.value);

  const sheet: Character = {
    ...base,
    name: asText(source.name).slice(0, 60),
    description: asText(source.description),
    portrait: asPortrait(source.portrait),
    level: asInt(source.level, base.level, 1, 99),
    refresh: asInt(source.refresh, base.refresh, 1, 99),
    fatePoints: asInt(source.fatePoints, base.fatePoints, 0, 9),
    aspects: base.aspects.map((aspect, index) => ({
      label: asText(aspects[index]?.label) || aspect.label,
      text: asText(aspects[index]?.text).slice(0, 240),
    })),
    ladder: rows.map((row) => {
      const saved = ladder.find((item) => Number(item?.value) === row.value);
      const skills = Array.isArray(saved?.skills)
        ? saved.skills.filter((skill): skill is string => typeof skill === 'string' && skill.trim() !== '')
        : [];
      return { value: row.value, skills: skills.slice(0, 5) };
    }),
    stunts: stunts
      .filter((stunt) => stunt && typeof stunt.name === 'string' && stunt.name.trim() !== '')
      .slice(0, 5)
      .map((stunt) => ({
        name: asText(stunt.name).slice(0, 48),
        text: asText(stunt.text).slice(0, 240),
      })),
    extras: asPair(source.extras, base.extras),
    extraTitles: asPair(source.extraTitles, base.extraTitles),
    marks: {
      physical: Array.isArray(source.marks?.physical)
        ? source.marks.physical.map((mark) => mark === true)
        : [],
      mental: Array.isArray(source.marks?.mental) ? source.marks.mental.map((mark) => mark === true) : [],
    },
    consequences: base.consequences.map((item) => {
      const saved = consequences.find((entry) => Number(entry?.value) === item.value);
      return { ...item, text: asText(saved?.text).slice(0, 200) };
    }),
  };

  return { setting, sheet };
}
