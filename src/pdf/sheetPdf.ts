import {
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  rgb,
  moveTo,
  lineTo,
  closePath,
  fill,
  setFillingRgbColor,
  pushGraphicsState,
  popGraphicsState,
} from 'pdf-lib';
import type { Character } from '../data/types';
import { effectiveRefresh } from '../data/characters';
import { embedFonts, type PdfFonts } from './fonts';

const MM = 72 / 25.4;

/** A4 в альбомной ориентации, миллиметры. */
const PAGE = { w: 297, h: 210 };

/** Бланк 220×158 мм растягиваем на A4: контент занимает почти весь лист. */
const SCALE = 1.42;
const OFFSET_X = 13.6;
const OFFSET_Y = 14.85;

const mm = (value: number) => value * MM;
const mapX = (x: number) => OFFSET_X + (x - 15) * SCALE;
const mapY = (y: number) => OFFSET_Y + (y - 20) * SCALE;

type Box = { x: number; y: number; w: number; h: number };

/** Прямоугольник по координатам бланка (мм от левого верхнего угла). */
const B = (x0: number, y0: number, x1: number, y1: number): Box => ({
  x: mapX(x0),
  y: mapY(y0),
  w: mapX(x1) - mapX(x0),
  h: mapY(y1) - mapY(y0),
});

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GREY = rgb(0.44, 0.44, 0.44);
const LINE = rgb(0.08, 0.08, 0.08);

const LINE_WIDTH = 0.7;
type PDFColor = ReturnType<typeof rgb>;

type Overflow = { title: string; text: string };

/* ------------------------------------------------------------------ */
/* Текст                                                               */
/* ------------------------------------------------------------------ */

type Align = 'left' | 'center' | 'right';

const capMm = (size: number) => (size * 0.72) / MM;

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  size: number,
  font: PDFFont,
  color: PDFColor = BLACK,
  align: Align = 'left',
  maxWidth?: number,
): void {
  if (!text) return;
  const width = font.widthOfTextAtSize(text, size) / MM;
  let x0 = x;
  if (align === 'center' && maxWidth !== undefined) x0 = x + (maxWidth - width) / 2;
  if (align === 'right') x0 = x - width;
  page.drawText(text, {
    x: mm(x0),
    y: mm(PAGE.h - top) - size * 0.72,
    size,
    font,
    color,
  });
}

function drawTracked(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  size: number,
  font: PDFFont,
  color: PDFColor,
  tracking: number,
): void {
  let cursor = x;
  for (const char of text) {
    page.drawText(char, {
      x: mm(cursor),
      y: mm(PAGE.h - top) - size * 0.72,
      size,
      font,
      color,
    });
    cursor += (font.widthOfTextAtSize(char, size) + tracking) / MM;
  }
}

function fitLine(
  text: string,
  font: PDFFont,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): { text: string; size: number } {
  const limit = mm(maxWidth);
  for (let size = maxSize; size >= minSize; size -= 0.2) {
    if (font.widthOfTextAtSize(text, size) <= limit) return { text, size };
  }
  const ellipsis = '…';
  let cut = text;
  while (cut.length > 1 && font.widthOfTextAtSize(cut + ellipsis, minSize) > limit) {
    cut = cut.slice(0, -1).trimEnd();
  }
  return { text: cut ? cut + ellipsis : '', size: minSize };
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const limit = mm(maxWidth);
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= limit) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    while (font.widthOfTextAtSize(current, size) > limit && current.length > 1) {
      let cut = current.length - 1;
      while (cut > 1 && font.widthOfTextAtSize(`${current.slice(0, cut)}…`, size) > limit) cut -= 1;
      lines.push(`${current.slice(0, cut)}…`);
      current = current.slice(cut);
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Вписывает абзац в рамку: уменьшает кегль, затем обрезает строки. */
function fitParagraph(
  text: string,
  font: PDFFont,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
  leading = 1.28,
): { lines: string[]; size: number; clipped: boolean } {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return { lines: [], size: minSize, clipped: false };

  for (let size = maxSize; size >= minSize; size -= 0.2) {
    const lines = wrapText(clean, font, size, maxWidth);
    const height = (lines.length * size * leading) / MM;
    if (height <= maxHeight) return { lines, size, clipped: false };
  }

  const lines = wrapText(clean, font, minSize, maxWidth);
  const perLine = (minSize * leading) / MM;
  const fitCount = Math.max(1, Math.floor(maxHeight / perLine));
  if (lines.length <= fitCount) return { lines, size: minSize, clipped: false };

  const kept = lines.slice(0, fitCount);
  const last = kept[kept.length - 1];
  const limit = mm(maxWidth);
  let cut = last;
  while (cut.length > 1 && font.widthOfTextAtSize(cut + '…', minSize) > limit) cut = cut.slice(0, -1);
  kept[kept.length - 1] = `${cut.trimEnd()}…`;
  return { lines: kept, size: minSize, clipped: true };
}

function drawParagraph(
  page: PDFPage,
  lines: string[],
  x: number,
  top: number,
  size: number,
  font: PDFFont,
  leading = 1.28,
): void {
  const step = (size * leading) / MM;
  lines.forEach((line, index) => {
    drawText(page, line, x, top + index * step, size, font);
  });
}

/* ------------------------------------------------------------------ */
/* Фигуры                                                              */
/* ------------------------------------------------------------------ */

function strokeBox(page: PDFPage, box: Box, color: PDFColor = LINE, width = LINE_WIDTH): void {
  page.drawRectangle({
    x: mm(box.x),
    y: mm(PAGE.h - box.y - box.h),
    width: mm(box.w),
    height: mm(box.h),
    borderColor: color,
    borderWidth: width,
  });
}

/** Рамка без верхней линии — когда верхняя грань уже нарисована соседним полем. */
function strokeBoxOpenTop(page: PDFPage, box: Box, color: PDFColor = LINE, width = LINE_WIDTH): void {
  const left = mm(box.x);
  const right = mm(box.x + box.w);
  const top = mm(PAGE.h - box.y);
  const bottom = mm(PAGE.h - box.y - box.h);
  page.drawLine({ start: { x: left, y: top }, end: { x: left, y: bottom }, thickness: width, color });
  page.drawLine({ start: { x: left, y: bottom }, end: { x: right, y: bottom }, thickness: width, color });
  page.drawLine({ start: { x: right, y: bottom }, end: { x: right, y: top }, thickness: width, color });
}

const BAR_SLANT = 3.0;

/** Чёрная плашка заголовка с косым правым концом (как на бланке). */
function drawBar(page: PDFPage, box: Box, title: string, fonts: PdfFonts, size = 12.4): void {
  const left = mm(box.x);
  const right = mm(box.x + box.w);
  const top = mm(PAGE.h - box.y);
  const bottom = mm(PAGE.h - box.y - box.h);
  const slant = mm(BAR_SLANT);

  page.drawRectangle({
    x: left,
    y: bottom,
    width: right - left - slant,
    height: top - bottom,
    color: BLACK,
  });
  page.pushOperators(
    pushGraphicsState(),
    setFillingRgbColor(0, 0, 0),
    moveTo(right - slant, top),
    lineTo(right, top),
    lineTo(right - slant, bottom),
    lineTo(right - slant, top),
    closePath(),
    fill(),
    popGraphicsState(),
  );

  drawTracked(
    page,
    title.toUpperCase(),
    box.x + 2.2,
    box.y + (box.h - capMm(size)) / 2,
    size,
    fonts.black,
    WHITE,
    0.3,
  );
}

function drawFieldLabel(page: PDFPage, text: string, x: number, top: number, fonts: PdfFonts, size = 8): void {
  drawText(page, text, x, top, size, fonts.medium, GREY);
}

/* ------------------------------------------------------------------ */
/* Раскладка                                                           */
/* ------------------------------------------------------------------ */

const ROWS: Array<{ label: string; value: number }> = [
  { label: 'Великолеп. (+5)', value: 5 },
  { label: 'Отличный (+4)', value: 4 },
  { label: 'Хороший (+3)', value: 3 },
  { label: 'Неплохой (+2)', value: 2 },
  { label: 'Средний (+1)', value: 1 },
];

const ROW_TOPS = [52, 58, 64, 70, 76];
const ROW_H = 4.2;
const SKILL_CELL_STARTS = [114, 132.3, 150.7, 169.2, 187.7];
const SKILL_CELL_W = 17.6;

function skillsFor(character: Character, value: number): string[] {
  const row = character.ladder.find((item) => item.value === value);
  return row ? row.skills : [];
}

function drawHeader(
  page: PDFPage,
  character: Character,
  fonts: PdfFonts,
  logo: PDFImage | null,
  overflow: Overflow[],
): void {
  drawBar(page, B(15, 20, 147, 23.5), 'Персонаж', fonts);

  const nameBox = B(15, 25.2, 127.4, 29.4);
  strokeBox(page, nameBox);
  const namePad = 2.2;
  const name = character.name.trim();
  if (!name) {
    drawFieldLabel(page, 'Имя', nameBox.x + namePad, nameBox.y + (nameBox.h - capMm(8)) / 2, fonts, 8);
  } else {
    const fit = fitLine(name, fonts.semiBold, nameBox.w - namePad * 2, 14, 8.4);
    drawText(
      page,
      fit.text,
      nameBox.x + namePad,
      nameBox.y + (nameBox.h - capMm(fit.size)) / 2,
      fit.size,
      fonts.semiBold,
    );
    if (fit.text.endsWith('…')) overflow.push({ title: 'Имя', text: name });
  }

  const refreshBox = B(128.8, 25.2, 147, 42.4);
  strokeBox(page, refreshBox);
  drawFieldLabel(page, 'Обновление', refreshBox.x + 1.6, refreshBox.y + 0.9, fonts, 7.4);
  drawText(
    page,
    String(effectiveRefresh(character)),
    refreshBox.x + 1.6,
    refreshBox.y + refreshBox.h / 2 - capMm(26) / 2 + 1.2,
    26,
    fonts.semiBold,
    BLACK,
    'center',
    refreshBox.w - 3.2,
  );

  const descriptionBox = B(15, 29.4, 127.4, 42.4);
  strokeBoxOpenTop(page, descriptionBox);
  const description = character.description.trim();
  if (!description) {
    drawFieldLabel(page, 'Описание', descriptionBox.x + 2.2, descriptionBox.y + 1.2, fonts, 8);
  } else {
    const fit = fitParagraph(
      description,
      fonts.regular,
      descriptionBox.w - 4.4,
      descriptionBox.h - 2.6,
      10.2,
      8,
    );
    drawParagraph(page, fit.lines, descriptionBox.x + 2.2, descriptionBox.y + 1.3, fit.size, fonts.regular);
    if (fit.clipped) overflow.push({ title: 'Описание', text: description });
  }

  if (logo) {
    const logoBox = B(150, 19.5, 205, 42.4);
    const ratio = logo.width / logo.height;
    const width = Math.min(logoBox.w, logoBox.h * ratio);
    const height = width / ratio;
    page.drawImage(logo, {
      x: mm(logoBox.x + (logoBox.w - width) / 2),
      y: mm(PAGE.h - logoBox.y - logoBox.h + (logoBox.h - height) / 2),
      width: mm(width),
      height: mm(height),
    });
  }
}

function drawAspects(page: PDFPage, character: Character, fonts: PdfFonts, overflow: Overflow[]): void {
  drawBar(page, B(15, 47, 85.6, 52.2), 'Аспекты', fonts);

  ROW_TOPS.forEach((top, index) => {
    const box = B(14, top, 85.6, top + ROW_H);
    strokeBox(page, box);
    const aspect = character.aspects[index];
    if (!aspect) return;

    const label = aspect.label.trim();
    const text = aspect.text.trim();
    if (!text) {
      if (label && index < 2) {
        drawFieldLabel(page, label, box.x + 2, box.y + (box.h - capMm(7.6)) / 2, fonts, 7.6);
      }
      return;
    }
    const fit = fitLine(text, fonts.regular, box.w - 4, 10.6, 7.4);
    drawText(
      page,
      fit.text,
      box.x + 2,
      box.y + (box.h - capMm(fit.size)) / 2,
      fit.size,
      fonts.regular,
    );
    if (fit.text.endsWith('…')) {
      overflow.push({ title: `Аспект «${label || `№ ${index + 1}`}»`, text });
    }
  });
}

function drawSkills(page: PDFPage, character: Character, fonts: PdfFonts, overflow: Overflow[]): void {
  drawBar(page, B(91.4, 47, 205.2, 52.2), 'Навыки', fonts);

  ROWS.forEach((row, rowIndex) => {
    const top = ROW_TOPS[rowIndex];
    const rowBox = B(91.4, top, 113, top + ROW_H);
    drawText(
      page,
      row.label,
      rowBox.x + rowBox.w - 0.8,
      rowBox.y + (rowBox.h - capMm(8.4)) / 2,
      8.4,
      fonts.medium,
      GREY,
      'right',
    );

    const skills = row.value === 5 ? [] : skillsFor(character, row.value);
    for (let column = 0; column < 5; column += 1) {
      const x0 = SKILL_CELL_STARTS[column];
      const box = B(x0, top, x0 + SKILL_CELL_W, top + ROW_H);
      strokeBox(page, box, LINE, 0.55);
      const skill = skills[column];
      if (!skill) continue;
      const fit = fitLine(skill, fonts.regular, box.w - 2.6, 10.2, 7);
      drawText(
        page,
        fit.text,
        box.x + 1.3,
        box.y + (box.h - capMm(fit.size)) / 2,
        fit.size,
        fonts.regular,
      );
      if (fit.text.endsWith('…')) overflow.push({ title: `Навык на +${row.value}`, text: skill });
    }
  });
}

function drawExtras(page: PDFPage, character: Character, fonts: PdfFonts, overflow: Overflow[]): void {
  drawBar(page, B(15, 85.2, 106, 88.4), 'Дополнения', fonts);
  const box = B(14, 88.4, 105.7, 113.6);
  strokeBox(page, box);

  const columnWidth = (box.w - 9) / 2;

  character.extras.forEach((text, index) => {
    const x = box.x + 3 + index * (columnWidth + 3);
    const title = (character.extraTitles[index] || `Заметки ${index + 1}`).trim();
    const titleFit = fitLine(title, fonts.semiBold, columnWidth, 8, 6.6);
    drawText(page, titleFit.text, x, box.y + 0.9, titleFit.size, fonts.semiBold, GREY);

    const value = text.trim();
    if (!value) return;
    const fit = fitParagraph(value, fonts.regular, columnWidth - 2, box.h - 5.4, 9.8, 7.2);
    drawParagraph(page, fit.lines, x, box.y + 3.2, fit.size, fonts.regular);
    if (fit.clipped) overflow.push({ title: `Дополнения · ${title}`, text: value });
  });
}

function drawStunts(page: PDFPage, character: Character, fonts: PdfFonts, overflow: Overflow[]): void {
  drawBar(page, B(109.7, 85.2, 205.2, 88.4), 'Трюки', fonts);
  const box = B(109.7, 88.4, 204.8, 113.6);
  strokeBox(page, box);

  const left = box.x + 2.4;
  const width = box.w - 4.8;
  const bottom = box.y + box.h - 1;
  const stunts = character.stunts
    .map((stunt) => ({ name: stunt.name.trim(), text: stunt.text.trim() }))
    .filter((stunt) => stunt.name || stunt.text);

  let chosen: { nameSize: number; textSize: number } | null = null;
  let layout: Array<{ name: string[]; text: string[] }> = [];

  for (let step = 0; step <= 10 && !chosen; step += 1) {
    const nameSize = 10 - step * 0.25;
    const textSize = 9.6 - step * 0.24;
    const blocks = stunts.map((stunt) => ({
      name: stunt.name ? wrapText(stunt.name, fonts.semiBold, nameSize, width) : [],
      text: stunt.text ? wrapText(stunt.text, fonts.regular, textSize, width) : [],
    }));
    const height =
      blocks.reduce(
        (sum, block) =>
          sum + (block.name.length * nameSize * 1.22 + block.text.length * textSize * 1.26) / MM + 1.2,
        0,
      ) + 0.6;
    if (height <= bottom - box.y - 1.8) {
      chosen = { nameSize, textSize };
      layout = blocks;
    } else if (step === 10) {
      chosen = { nameSize, textSize };
      layout = blocks;
    }
  }

  const nameSize = chosen?.nameSize ?? 10;
  const textSize = chosen?.textSize ?? 9.6;
  let cursor = box.y + 1.8;
  let hidden = 0;

  layout.forEach((block, item) => {
    const height =
      (block.name.length * nameSize * 1.22 + block.text.length * textSize * 1.26) / MM + 1.2;
    if (cursor + height > bottom) {
      hidden += 1;
      overflow.push({
        title: 'Трюк',
        text: [stunts[item].name, stunts[item].text].filter(Boolean).join(' — '),
      });
      return;
    }
    block.name.forEach((line, index) => {
      drawText(page, line, left, cursor + (index * nameSize * 1.22) / MM, nameSize, fonts.semiBold);
    });
    cursor += (block.name.length * nameSize * 1.22) / MM;
    block.text.forEach((line, index) => {
      drawText(page, line, left, cursor + (index * textSize * 1.26) / MM, textSize, fonts.regular);
    });
    cursor += (block.text.length * textSize * 1.26) / MM + 1.2;
  });

  if (hidden > 0) {
    drawText(
      page,
      `Ещё трюков: ${hidden} — на листе «Продолжение»`,
      box.x + box.w,
      box.y + box.h + 2.4,
      7.2,
      fonts.regular,
      GREY,
      'right',
    );
  }
}

function drawStressTrack(page: PDFPage, top: number, fonts: PdfFonts): void {
  for (let index = 0; index < 4; index += 1) {
    const x0 = 15 + index * 9.5;
    const box = B(x0, top, x0 + 7, top + 6);
    strokeBox(page, box, LINE, 1);
    drawText(page, String(index + 1), box.x + 0.9, box.y + 0.4, 9.5, fonts.medium, GREY);
  }
}

function drawStress(page: PDFPage, fonts: PdfFonts): void {
  const physBar = B(15, 118.2, 63.3, 121.2);
  drawBar(page, physBar, 'Физ. стресс', fonts, 9.8);
  const physTitle = 'ФИЗ. СТРЕСС';
  const physTitleW = fonts.black.widthOfTextAtSize(physTitle, 9.8) / MM + 0.3 * physTitle.length / MM;
  drawText(
    page,
    '(Телосложение)',
    physBar.x + 2.2 + physTitleW + 1.6,
    physBar.y + (physBar.h - capMm(6.2)) / 2,
    6.2,
    fonts.medium,
    WHITE,
  );

  const mentalBar = B(15, 130, 63.7, 133);
  drawBar(page, mentalBar, 'Ментал. стресс', fonts, 9.8);
  const mentalTitle = 'МЕНТАЛ. СТРЕСС';
  const mentalTitleW = fonts.black.widthOfTextAtSize(mentalTitle, 9.8) / MM + 0.3 * mentalTitle.length / MM;
  drawText(
    page,
    '(Воля)',
    mentalBar.x + 2.2 + mentalTitleW + 1.6,
    mentalBar.y + (mentalBar.h - capMm(6.2)) / 2,
    6.2,
    fonts.medium,
    WHITE,
  );

  drawStressTrack(page, 121.2, fonts);
  drawStressTrack(page, 133, fonts);
}

function drawConsequences(
  page: PDFPage,
  character: Character,
  fonts: PdfFonts,
  overflow: Overflow[],
): void {
  drawBar(page, B(68.3, 118.2, 205.2, 121.2), 'Последствия', fonts, 11.2);

  const rows: Array<{ top: number; value: number; label: string }> = [
    { top: 121.4, value: 2, label: 'Лёгкое' },
    { top: 127.4, value: 4, label: 'Среднее' },
    { top: 133.4, value: 6, label: 'Серьёзное' },
  ];

  rows.forEach((row) => {
    drawText(page, String(row.value), mapX(67.4), mapY(row.top) + 0.4, 12, fonts.medium, GREY, 'right');

    const box = B(69, row.top, 134.8, row.top + 5.8);
    strokeBox(page, box);

    const value = character.consequences.find((item) => item.value === row.value)?.text?.trim() ?? '';
    if (!value) {
      drawFieldLabel(page, row.label, box.x + 1.6, box.y + 1.1, fonts, 7.8);
      return;
    }
    const fit = fitLine(value, fonts.regular, box.w - 3.2, 9.8, 7.2);
    drawText(page, fit.text, box.x + 1.6, box.y + 1.9, fit.size, fonts.regular);
    if (fit.text.endsWith('…')) {
      overflow.push({ title: `Последствие «${row.label}»`, text: value });
    }
  });

  // Второй слот «Лёгкое» — запасной из правил +5; на бланке он есть, данных пока нет.
  const extraBox = B(135, 121.4, 204, 127.2);
  strokeBox(page, extraBox);
  drawText(page, '2', mapX(133.8), mapY(121.4) + 0.4, 12, fonts.medium, GREY, 'right');
  drawFieldLabel(page, 'Лёгкое', extraBox.x + 1.6, extraBox.y + 1.1, fonts, 7.8);
}

/* ------------------------------------------------------------------ */
/* Продолжение                                                         */
/* ------------------------------------------------------------------ */

function drawAppendix(doc: PDFDocument, fonts: PdfFonts, entries: Overflow[]): void {
  const marginX = 18;
  const columnWidth = 120;
  const gap = 10;
  const columns = [marginX, marginX + columnWidth + gap];
  const top = 32;
  const bottom = 196;

  let page = doc.addPage([mm(PAGE.w), mm(PAGE.h)]);
  drawBar(page, B(15, 18, 205, 23), 'Продолжение', fonts, 12.4);
  drawText(
    page,
    'Полные тексты полей, которые не поместились на бланке.',
    marginX,
    26,
    8.6,
    fonts.regular,
    GREY,
  );

  let column = 0;
  let cursor = top;

  const nextColumn = () => {
    column += 1;
    if (column > 1) {
      page = doc.addPage([mm(PAGE.w), mm(PAGE.h)]);
      drawBar(page, B(15, 18, 205, 23), 'Продолжение', fonts, 12.4);
      column = 0;
    }
    cursor = top;
  };

  entries.forEach((entry) => {
    const titleLines = wrapText(entry.title, fonts.semiBold, 9.4, columnWidth);
    const textLines = wrapText(entry.text, fonts.regular, 8.8, columnWidth);
    const height = (titleLines.length * 9.4 * 1.25 + textLines.length * 8.8 * 1.3) / MM + 3.4;

    if (cursor + height > bottom) nextColumn();

    const x = columns[column];
    titleLines.forEach((line, index) => {
      drawText(page, line, x, cursor + (index * 9.4 * 1.25) / MM, 9.4, fonts.semiBold);
    });
    cursor += (titleLines.length * 9.4 * 1.25) / MM + 0.6;
    textLines.forEach((line, index) => {
      drawText(page, line, x, cursor + (index * 8.8 * 1.3) / MM, 8.8, fonts.regular);
    });
    cursor += (textLines.length * 8.8 * 1.3) / MM + 3.4;
  });
}

/* ------------------------------------------------------------------ */
/* Сборка                                                              */
/* ------------------------------------------------------------------ */

async function loadLogo(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}assets/logos/fate-core-logo.png`);
    if (!response.ok) return null;
    return await doc.embedPng(await response.arrayBuffer());
  } catch {
    return null;
  }
}

export async function buildCharacterPdf(character: Character): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Лист персонажа — ${character.name.trim() || 'без имени'}`);
  doc.setAuthor('Fate Core Sheets');
  doc.setCreator('Fate Core Sheets');
  doc.setProducer('Fate Core Sheets (pdf-lib)');

  const fonts = await embedFonts(doc);
  const logo = await loadLogo(doc);
  const overflow: Overflow[] = [];

  const page = doc.addPage([mm(PAGE.w), mm(PAGE.h)]);
  drawHeader(page, character, fonts, logo, overflow);
  drawAspects(page, character, fonts, overflow);
  drawSkills(page, character, fonts, overflow);
  drawExtras(page, character, fonts, overflow);
  drawStunts(page, character, fonts, overflow);
  drawStress(page, fonts);
  drawConsequences(page, character, fonts, overflow);

  if (overflow.length > 0) drawAppendix(doc, fonts, overflow);

  return doc.save();
}
