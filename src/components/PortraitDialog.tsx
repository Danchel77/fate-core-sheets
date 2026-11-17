import { useEffect, useRef, useState } from 'react';
import { IconClose } from './icons';
import { PortraitPlate } from './PortraitPlate';
import { PortraitCropper } from './PortraitCropper';
import '../styles/stunt-modal.css';
import '../styles/portrait-dialog.css';

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
  onChange: (next: string) => void;
};

/** Окно портрета в листе: заменить (с кадрированием) или удалить. */
export function PortraitDialog({ src, alt, onClose, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (crop) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [crop, onClose]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => setCrop(String(reader.result)));
    reader.readAsDataURL(file);
  };

  if (crop) {
    return (
      <PortraitCropper
        src={crop}
        onCancel={() => setCrop(null)}
        onDone={(next) => {
          onChange(next);
          setCrop(null);
        }}
      />
    );
  }

  return (
    <div
      className="pd-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sm__panel pd" role="dialog" aria-modal="true" aria-labelledby="pd-title">
        <div className="sm__head">
          <span className="sm__head-title" id="pd-title">
            Портрет
          </span>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body pd__body">
          <button
            type="button"
            className="pd__preview"
            aria-label="Загрузить фото"
            onClick={() => fileRef.current?.click()}
          >
            <PortraitPlate src={src} alt={alt} />
          </button>
          <p className="pd__note">Нажмите на портрет, чтобы загрузить фото.</p>
          <input
            ref={fileRef}
            className="pd__file"
            type="file"
            accept="image/*"
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>

        <div className="sm__footer">
          <div className="sm__footer-left">
            {src && (
              <button type="button" className="sm__ghost pd__remove" onClick={() => onChange('')}>
                Удалить портрет
              </button>
            )}
          </div>
          <div className="sm__actions">
            <button type="button" className="sm__primary" onClick={onClose}>
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
