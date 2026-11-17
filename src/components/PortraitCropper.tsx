import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { IconClose } from './icons';
import '../styles/stunt-modal.css';
import '../styles/portrait-dialog.css';

/** Рамка кадра — 3:4, как плашка портрета в листе. */
const FRAME_RATIO = 3 / 4;
/** Размер готовой картинки: хватает для ретины и печати, но не тяжело для хранилища. */
const OUT_W = 600;
const OUT_H = 800;

type Props = {
  src: string;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
};

/** Окно кадрирования: картинку можно подвинуть мышью и увеличить ползунком. */
export function PortraitCropper({ src, onCancel, onDone }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ w: 300, h: 400 });
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setFrame({ w: rect.width, h: rect.width / FRAME_RATIO });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.addEventListener('load', () => setImage(img));
    img.src = src;
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const baseScale = image ? Math.max(frame.w / image.naturalWidth, frame.h / image.naturalHeight) : 1;
  const scale = baseScale * zoom;
  const width = image ? image.naturalWidth * scale : 0;
  const height = image ? image.naturalHeight * scale : 0;
  const maxX = Math.max(0, (width - frame.w) / 2);
  const maxY = Math.max(0, (height - frame.h) / 2);
  const x = Math.min(maxX, Math.max(-maxX, pos.x));
  const y = Math.min(maxY, Math.max(-maxY, pos.y));

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { px: event.clientX, py: event.clientY, ox: x, oy: y };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.ox + event.clientX - d.px, y: d.oy + event.clientY - d.py });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const confirm = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sw = frame.w / scale;
    const sh = frame.h / scale;
    const sx = image.naturalWidth / 2 + x / scale - sw / 2;
    const sy = image.naturalHeight / 2 + y / scale - sh / 2;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
    onDone(canvas.toDataURL('image/jpeg', 0.86));
  };

  return (
    <div className="pc-overlay">
      <div className="sm__panel pc" role="dialog" aria-modal="true" aria-labelledby="pc-title">
        <div className="sm__head">
          <span className="sm__head-title" id="pc-title">
            Кадрирование портрета
          </span>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onCancel}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body pc__body">
          <div
            ref={frameRef}
            className="pc__frame"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {image && (
              <img
                className="pc__img"
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              />
            )}
            <span className="pc__frame-edge" aria-hidden="true" />
            <span className="pc__frame-corners" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>

          <label className="pc__zoom">
            <span className="pc__zoom-label">Масштаб</span>
            <input
              className="pc__range"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              aria-label="Масштаб портрета"
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <span className="pc__zoom-value">{Math.round(zoom * 100)}%</span>
          </label>
        </div>

        <div className="sm__footer">
          <div className="sm__footer-left">
            <button type="button" className="sm__ghost" onClick={onCancel}>
              Отмена
            </button>
          </div>
          <div className="sm__actions">
            <button type="button" className="sm__primary" onClick={confirm} disabled={!image}>
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
