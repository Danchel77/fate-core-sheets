import fontkit from '@pdf-lib/fontkit';
import type { PDFDocument, PDFFont } from 'pdf-lib';

/**
 * Шрифты PDF-листа. Официальный бланк набран Gotham, он несвободный,
 * поэтому берём Montserrat (OFL) — ближайший свободный гротеск по пластике.
 */
export type PdfFonts = {
  regular: PDFFont;
  medium: PDFFont;
  semiBold: PDFFont;
  bold: PDFFont;
  black: PDFFont;
};

const FILES: Record<keyof PdfFonts, string> = {
  regular: 'Montserrat-Regular.ttf',
  medium: 'Montserrat-Medium.ttf',
  semiBold: 'Montserrat-SemiBold.ttf',
  bold: 'Montserrat-Bold.ttf',
  black: 'Montserrat-Black.ttf',
};

const loaded = new Map<string, Promise<ArrayBuffer>>();

function loadFontFile(name: string): Promise<ArrayBuffer> {
  let pending = loaded.get(name);
  if (!pending) {
    pending = fetch(`${import.meta.env.BASE_URL}fonts/${name}`).then((response) => {
      if (!response.ok) {
        throw new Error(`Не удалось загрузить шрифт для PDF: ${name}`);
      }
      return response.arrayBuffer();
    });
    loaded.set(name, pending);
  }
  return pending;
}

export async function embedFonts(doc: PDFDocument): Promise<PdfFonts> {
  doc.registerFontkit(fontkit);

  const keys = Object.keys(FILES) as Array<keyof PdfFonts>;
  const fonts = await Promise.all(
    keys.map(async (key) => {
      const bytes = await loadFontFile(FILES[key]);
      return doc.embedFont(bytes, { subset: true });
    }),
  );

  return keys.reduce((acc, key, index) => {
    acc[key] = fonts[index];
    return acc;
  }, {} as PdfFonts);
}
