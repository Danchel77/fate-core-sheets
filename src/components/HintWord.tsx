const BASE = import.meta.env.BASE_URL;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

const cornerMask = {
  maskImage: `url(${CORNER})`,
  WebkitMaskImage: `url(${CORNER})`,
};

export type HintVariant = 'cartouche' | 'plate' | 'bookmark';

type WordProps = {
  variant: HintVariant;
  title: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
};

/** Слово-подсказка: затухающее подчёркивание, по клику раскрывает плашку. */
export function HintWord({ variant, title, open, controls, onToggle }: WordProps) {
  return (
    <span className={`hint hint--${variant}${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="hint__word"
        aria-expanded={open}
        aria-controls={controls}
        onClick={onToggle}
      >
        {title}
      </button>
    </span>
  );
}

type PanelProps = {
  id: string;
  variant: HintVariant;
  title: string;
  text: string;
};

/** Плашка подсказки: заголовок и текст в стиле листа. */
export function HintPanel({ id, variant, title, text }: PanelProps) {
  return (
    <div className={`hint-panel hint-panel--${variant}`} id={id} role="note">
      {variant !== 'bookmark' && (
        <span
          className="hint-panel__texture"
          aria-hidden="true"
          style={{ backgroundImage: `url(${TEXTURE})` }}
        />
      )}
      {variant === 'plate' &&
        CORNERS.map((corner) => (
          <i
            key={corner}
            className={`hint-panel__corner hint-panel__corner--${corner}`}
            aria-hidden="true"
            style={cornerMask}
          />
        ))}
      <span className="hint-panel__title">{title}</span>
      <span className="hint-panel__text">{text}</span>
    </div>
  );
}
