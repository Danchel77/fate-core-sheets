import { useState } from 'react';

const BASE = import.meta.env.BASE_URL;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

export type HintVariant = 'cartouche' | 'plate' | 'bookmark';

type Props = {
  variant: HintVariant;
  title: string;
  text: string;
  id: string;
};

const cornerMask = {
  maskImage: `url(${CORNER})`,
  WebkitMaskImage: `url(${CORNER})`,
};

/** Слово с подсказкой: затухающее подчёркивание и тултип в стиле листа. */
export function HintWord({ variant, title, text, id }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`hint hint--${variant}${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="hint__word"
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        {title}
      </button>

      <span className="hint__pop" id={id} role="tooltip">
        {variant !== 'bookmark' && (
          <span
            className="hint__texture"
            aria-hidden="true"
            style={{ backgroundImage: `url(${TEXTURE})` }}
          />
        )}
        {variant === 'plate' &&
          CORNERS.map((corner) => (
            <i
              key={corner}
              className={`hint__corner hint__corner--${corner}`}
              aria-hidden="true"
              style={cornerMask}
            />
          ))}
        <span className="hint__title">{title}</span>
        <span className="hint__text">{text}</span>
      </span>
    </span>
  );
}
