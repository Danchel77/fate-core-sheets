import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { downloadBlob } from '../data/download';
import { pdfFileName, pngFileName } from '../data/exchange';
import type { CharacterRecord } from '../data/types';
import { IconClose } from './icons';

type Props = {
  record: CharacterRecord;
  onClose: () => void;
};

type PdfPreview = {
  status: 'loading' | 'ready' | 'error';
  bytes: Uint8Array | null;
  pages: string[];
};

/** Готовые превью живут, пока жива запись: повторное открытие окна не собирает PDF заново. */
const pdfCache = new WeakMap<CharacterRecord, PdfPreview>();

/** Превью показывается шириной около 470 px; 1,2 достаточно и на экране с удвоенной плотностью. */
const PDF_PREVIEW_SCALE = 1.2;

/** 3020 px давали 2,8–3,1 МБ. 1,08 оставляет ~1630 px и около 1 МБ без видимой разницы на экране. */
const PNG_PIXEL_RATIO = 1.08;

/** Ширина макета: на телефоне книга всё равно снимается широким разворотом. */
const FRAME_WIDTH = 1520;

const pdfPending = new WeakMap<CharacterRecord, Promise<PdfPreview>>();

let pdfjsPreloaded = false;

/** Заранее тянет PDF.js и воркер: первое открытие окна перестаёт ждать загрузку. */
export function preloadPdfPreview(): void {
  if (pdfjsPreloaded) return;
  pdfjsPreloaded = true;
  void import('pdfjs-dist')
    .then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
      return fetch(pdfWorker, { cache: 'force-cache' });
    })
    .catch(() => {
      /* Предзагрузка не обязательна: при ошибке PDF.js загрузится при открытии окна. */
    });
}

/** Собирает бланк и рисует его страницы; результат хранится, пока жива запись. */
async function buildPdfPreview(record: CharacterRecord): Promise<PdfPreview> {
  const { buildCharacterPdf } = await import('../pdf/sheetPdf');
  const bytes = await buildCharacterPdf(record.sheet);

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
  const pdfDocument: PDFDocumentProxy = await pdfjs
    .getDocument({ data: bytes.slice() })
    .promise;

  const pages: string[] = [];
  try {
    for (let number = 1; number <= pdfDocument.numPages; number += 1) {
      const page = await pdfDocument.getPage(number);
      const viewport = page.getViewport({ scale: PDF_PREVIEW_SCALE });
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Нет холста для страницы PDF');
      await page.render({ canvasContext: context, viewport }).promise;
      pages.push(canvas.toDataURL('image/png'));
    }
  } finally {
    await pdfDocument.destroy();
  }

  return { status: 'ready', bytes, pages };
}

function requestPdfPreview(record: CharacterRecord): Promise<PdfPreview> {
  const ready = pdfCache.get(record);
  if (ready?.status === 'ready') return Promise.resolve(ready);

  let pending = pdfPending.get(record);
  if (!pending) {
    pending = buildPdfPreview(record).then(
      (result) => {
        pdfCache.set(record, result);
        pdfPending.delete(record);
        return result;
      },
      (cause) => {
        pdfPending.delete(record);
        throw cause;
      },
    );
    pdfPending.set(record, pending);
  }
  return pending;
}

/** Начинает готовить бланк, как только открыли меню «Экспорт»: к выбору пункта он уже готов. */
export function prewarmPdfPreview(record: CharacterRecord): void {
  void requestPdfPreview(record).catch(() => {
    /* Ошибку покажет само окно, если пользователь дойдёт до скачивания. */
  });
}

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

const EXPORT_CSS = `
  html, body {
    margin: 0;
    padding: 0;
    background: transparent !important;
    overflow: hidden;
  }
  body { font-family: var(--font-body); }
  .table {
    min-height: 0 !important;
    background: transparent !important;
    padding: 76px 76px 84px !important;
  }
  .sheet-nav,
  .sheet-toast,
  .bmenu,
  .ske__slot,
  .ske__del,
  .ske__up,
  .ske__lvsteps,
  .ske__lv-free,
  .stk__empty,
  .na,
  .nm {
    display: none !important;
  }
  .hint__word { border-bottom: 0 !important; }
  textarea::placeholder,
  input::placeholder {
    color: transparent !important;
    opacity: 0 !important;
  }
`;

/** Переносит текущие значения полей в клон: атрибуты в разметке хранят не всё. */
function syncFormValues(source: HTMLElement, clone: HTMLElement): void {
  const sourceFields = Array.from(source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
  const cloneFields = Array.from(clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));

  sourceFields.forEach((field, index) => {
    const target = cloneFields[index];
    if (!target) return;

    if (field instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) {
      target.textContent = field.value;
      return;
    }
    if (field instanceof HTMLInputElement && target instanceof HTMLInputElement) {
      target.setAttribute('value', field.value);
      target.checked = field.checked;
      return;
    }
    target.value = field.value;
  });

  const sourceSelects = Array.from(source.querySelectorAll<HTMLSelectElement>('select'));
  const cloneSelects = Array.from(clone.querySelectorAll<HTMLSelectElement>('select'));
  sourceSelects.forEach((field, index) => {
    const target = cloneSelects[index];
    if (target) target.value = field.value;
  });
}

/** Снимает с листа служебное: меню, пустые слоты, подсказки и заполненные жетоны. */
function prepareClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  syncFormValues(source, clone);
  clone.classList.add('is-export');

  clone
    .querySelectorAll('.sheet-nav, .sheet-toast, .bmenu, .ske__slot, .ske__del, .ske__up, .ske__lvsteps, .ske__lv-free, .stk__empty, .na, .nm')
    .forEach((node) => node.remove());

  // Плейсхолдеры подсказывают, что вписать; на готовой странице они лишние.
  clone.querySelectorAll('[placeholder]').forEach((node) => node.removeAttribute('placeholder'));

  clone.querySelectorAll('.fp__coin.is-filled').forEach((node) => {
    node.classList.remove('is-filled');
    node.setAttribute('aria-pressed', 'false');
  });

  // В картинке стресс показывается пустым: отметки — для игры за столом, не для обложки.
  clone.querySelectorAll('.str__box.is-filled').forEach((node) => {
    node.classList.remove('is-filled');
    node.setAttribute('aria-pressed', 'false');
  });

  return clone;
}

/**
 * Снимок листа в отдельном документе шириной компьютера.
 * Так телефон тоже получает разворот, а React и Firebase второй раз не запускаются.
 */
function buildExportDocument(): string {
  const source = document.querySelector<HTMLElement>('.table');
  if (!source) return '';

  const clone = prepareClone(source);
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');
  const bodyClass = document.body.className ? ` class="${document.body.className}"` : '';
  const base = document.baseURI.split('#')[0].replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <base href="${base}">
    ${styles}
    <style>${EXPORT_CSS}</style>
  </head>
  <body${bodyClass}>
    ${clone.outerHTML}
  </body>
</html>`;
}

/**
 * Окно скачивания: бумажный бланк и книга картинкой.
 * Превью — тот же снимок листа, только уменьшенный; PNG собирается из него же.
 */
export function SheetDownload({ record, onClose }: Props) {
  useBodyScrollLock();

  const panelRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [documentHtml] = useState(buildExportDocument);
  const [frameHeight, setFrameHeight] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfPreview>({ status: 'loading', bytes: null, pages: [] });
  const [pdfAttempt, setPdfAttempt] = useState(0);

  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const titleId = `download-title-${id}`;

  useDialogKeys({ panel: panelRef, onClose, trap: true });

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLButtonElement>('.sm__close')?.focus();
    return () => {
      const previous = previousFocus.current;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (pdfAttempt > 0) {
      pdfCache.delete(record);
      pdfPending.delete(record);
    }

    const cached = pdfAttempt === 0 ? pdfCache.get(record) : undefined;
    if (cached?.status === 'ready') {
      setPdf(cached);
      return;
    }

    setPdf({ status: 'loading', bytes: null, pages: [] });
    void requestPdfPreview(record)
      .then((result) => {
        if (!cancelled) setPdf(result);
      })
      .catch((cause) => {
        console.error('Не удалось показать PDF', cause);
        if (!cancelled) setPdf({ status: 'error', bytes: null, pages: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [record, pdfAttempt]);

  useEffect(() => {
    const box = previewRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setBoxWidth(entry.contentRect.width);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const scale = boxWidth > 0 ? Math.min(1, boxWidth / FRAME_WIDTH) : 0;
  const previewHeight = frameHeight > 0 ? Math.ceil(frameHeight * scale) : 220;

  const onFrameLoad = async () => {
    const frame = frameRef.current;
    const frameDocument = frame?.contentDocument;
    if (!frame || !frameDocument) return;

    const table = frameDocument.querySelector<HTMLElement>('.table');
    if (!table) {
      setError('Не удалось собрать лист для скачивания.');
      return;
    }

    try {
      await frameDocument.fonts.ready;
      await Promise.all(
        Array.from(frameDocument.images).map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) resolve();
              else {
                image.addEventListener('load', () => resolve(), { once: true });
                image.addEventListener('error', () => resolve(), { once: true });
              }
            }),
        ),
      );
    } catch {
      /* Картинки и шрифты не обязательны: лист всё равно можно снять. */
    }

    setFrameHeight(Math.ceil(table.getBoundingClientRect().height));
    setReady(true);
  };

  const downloadPdf = async () => {
    if (busy) return;
    setBusy('pdf');
    setError(null);
    try {
      let bytes = pdf.bytes;
      if (!bytes) {
        const { buildCharacterPdf } = await import('../pdf/sheetPdf');
        bytes = await buildCharacterPdf(record.sheet);
      }
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), pdfFileName(record));
      onClose();
    } catch (cause) {
      console.error('Не удалось собрать PDF', cause);
      setError('Не удалось собрать PDF. Попробуйте ещё раз.');
    } finally {
      setBusy(null);
    }
  };

  const downloadPng = async () => {
    if (busy || !ready) return;
    setBusy('png');
    setError(null);
    try {
      const table = frameRef.current?.contentDocument?.querySelector<HTMLElement>('.table');
      if (!table) throw new Error('Нет листа для снимка');

      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(table, {
        pixelRatio: PNG_PIXEL_RATIO,
        backgroundColor: undefined,
        cacheBust: true,
      });
      if (!blob) throw new Error('Пустой снимок');

      downloadBlob(blob, pngFileName(record));
      onClose();
    } catch (cause) {
      console.error('Не удалось сохранить картинку листа', cause);
      setError('Не удалось сохранить картинку. Попробуйте ещё раз.');
    } finally {
      setBusy(null);
    }
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="sm" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className="sm__panel dl__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sm__head">
          <span
            className="sm__texture"
            aria-hidden="true"
            style={{ backgroundImage: `url(${PAPER})` }}
          />
          <span className="sm__head-title" id={titleId}>
            Скачать лист
          </span>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body">
          <section className="dl__section">
            <h3 className="sm__label">Книга</h3>

            <div
              ref={previewRef}
              className="dl__preview"
              style={{ height: `${previewHeight}px` }}
              aria-busy={!ready}
            >
              {documentHtml ? (
                <iframe
                  ref={frameRef}
                  className="dl__frame"
                  title="Предпросмотр листа"
                  srcDoc={documentHtml}
                  tabIndex={-1}
                  onLoad={() => void onFrameLoad()}
                  style={{
                    width: `${FRAME_WIDTH}px`,
                    height: frameHeight > 0 ? `${frameHeight}px` : '900px',
                    transform: `scale(${scale || 0.3})`,
                  }}
                />
              ) : (
                <span className="dl__loading">Не удалось собрать превью</span>
              )}
              {!ready && documentHtml && <span className="dl__loading">Готовим превью…</span>}
            </div>

            <div className="dl__actions">
              <button
                type="button"
                className="sm__primary"
                disabled={!ready || busy !== null}
                onClick={() => void downloadPng()}
              >
                {busy === 'png' ? 'Сохраняем…' : 'Скачать PNG'}
              </button>
            </div>

          </section>

          <section className="dl__section">
            <h3 className="sm__label">Бумажный бланк</h3>

            <div className="dl__pdf" aria-busy={pdf.status === 'loading'}>
              {pdf.status === 'ready' &&
                pdf.pages.map((page, index) => (
                  <img
                    key={index}
                    className="dl__pdf-page"
                    src={page}
                    alt={`Страница ${index + 1}`}
                  />
                ))}
              {pdf.status === 'loading' && <span className="dl__loading">Готовим PDF…</span>}
              {pdf.status === 'error' && (
                <span className="dl__loading">
                  Не удалось показать бланк.
                  <button
                    type="button"
                    className="sm__ghost"
                    onClick={() => setPdfAttempt((value) => value + 1)}
                  >
                    Повторить
                  </button>
                </span>
              )}
            </div>

            <div className="dl__actions">
              <button
                type="button"
                className="sm__primary"
                disabled={busy !== null || pdf.status === 'loading'}
                onClick={() => void downloadPdf()}
              >
                {busy === 'pdf' ? 'Собираем PDF…' : 'Скачать PDF'}
              </button>
            </div>

          </section>

          {error && <p className="sm__note sm__note--warn">{error}</p>}
        </div>

        <footer className="sm__footer">
          <div className="sm__actions">
            <button type="button" className="sm__ghost" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
