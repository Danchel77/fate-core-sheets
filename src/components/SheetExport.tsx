import { useEffect, useRef, useState } from 'react';
import { downloadFile, fileText, jsonFileName } from '../data/exchange';
import type { CharacterRecord } from '../data/types';
import { IconBraces, IconFileDown, IconLink } from './icons';
import { SheetDownload } from './SheetDownload';

type Props = {
  record: CharacterRecord;
  /** Открыть окно публичной ссылки; без обработчика пункт не показывается. */
  onShare?: () => void;
};

/** Экспорт прямо с листа: окно скачивания, файл героя и ссылка. */
export function SheetExport({ record, onShare }: Props) {
  const [open, setOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
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
            onClick={() => {
              setOpen(false);
              setDownloadOpen(true);
            }}
          >
            <span className="bmenu__icon">
              <IconFileDown />
            </span>
            <span>Скачать лист</span>
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

      {downloadOpen && (
        <SheetDownload
          record={record}
          onClose={() => {
            setDownloadOpen(false);
            window.requestAnimationFrame(() => triggerRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}
