import { useEffect, useRef, useState } from 'react';
import { downloadBlob } from '../data/download';
import { downloadFile, fileText, jsonFileName, pdfFileName } from '../data/exchange';
import type { CharacterRecord } from '../data/types';
import { buildCharacterPdf } from '../pdf/sheetPdf';
import { IconBraces, IconFileDown, IconLink } from './icons';

type Props = {
  record: CharacterRecord;
  /** Открыть окно публичной ссылки; без обработчика пункт не показывается. */
  onShare?: () => void;
};

/** Экспорт прямо с листа: PDF, файл героя и ссылка, без возврата к списку. */
export function SheetExport({ record, onShare }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const downloadPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const bytes = await buildCharacterPdf(record.sheet);
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), pdfFileName(record));
      setOpen(false);
    } catch (error) {
      console.error('Не удалось собрать PDF', error);
      window.alert('Не удалось собрать PDF. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  const downloadJson = () => {
    downloadFile(fileText(record), jsonFileName(record));
    setOpen(false);
  };

  return (
    <div className="sheet-export" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="sheet-nav__btn sheet-export__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Экспорт героя"
        title="Экспорт"
        onClick={() => setOpen((value) => !value)}
      >
        <IconFileDown />
        <span className="sheet-export__label">Экспорт</span>
      </button>

      {open && (
        <div className="bmenu__list" role="menu" aria-label="Экспорт героя">
          <button
            type="button"
            role="menuitem"
            className="bmenu__item"
            disabled={busy}
            onClick={() => void downloadPdf()}
          >
            <span className="bmenu__icon">
              <IconFileDown />
            </span>
            <span>{busy ? 'Собираем PDF…' : 'Скачать PDF'}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="bmenu__item"
            onClick={downloadJson}
          >
            <span className="bmenu__icon">
              <IconBraces />
            </span>
            <span>Скачать JSON</span>
          </button>
          {onShare && (
            <button
              type="button"
              role="menuitem"
              className="bmenu__item"
              onClick={() => {
                setOpen(false);
                onShare();
              }}
            >
              <span className="bmenu__icon">
                <IconLink />
              </span>
              <span>Поделиться ссылкой</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
