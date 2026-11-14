import type { ReactNode } from 'react';

const BASE = import.meta.env.BASE_URL;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

export type HeaderVariant =
  | 'caps'
  | 'lozenge'
  | 'bevel'
  | 'cartouche'
  | 'emboss'
  | 'rule';

type Props = {
  variant: HeaderVariant;
  title: string;
  /** Небольшая группа справа в плашке (уровень, кошелёк). */
  aside?: ReactNode;
};

function Texture() {
  return (
    <span
      className="bh__texture"
      aria-hidden="true"
      style={{ backgroundImage: `url(${TEXTURE})` }}
    />
  );
}

const cornerMask = {
  maskImage: `url(${CORNER})`,
  WebkitMaskImage: `url(${CORNER})`,
};

/** Заголовок блока листа: одна плашка, разные концы. */
export function BlockHeader({ variant, title, aside }: Props) {
  if (variant === 'rule') {
    return (
      <div className="bh bh--rule">
        <span className="bh__rule" aria-hidden="true" />
        <i className="bh__gem" aria-hidden="true" />
        <span className="bh__title">{title}</span>
        <i className="bh__gem" aria-hidden="true" />
        <span className="bh__rule bh__rule--end" aria-hidden="true" />
      </div>
    );
  }

  if (variant === 'emboss') {
    return (
      <div className="bh bh--emboss">
        <Texture />
        <span className="bh__title">{title}</span>
      </div>
    );
  }

  if (variant === 'bevel') {
    return (
      <div className="bh bh--bevel">
        <span className="bh__fill" aria-hidden="true">
          <Texture />
        </span>
        <span className="bh__title">{title}</span>
      </div>
    );
  }

  if (variant === 'lozenge') {
    return (
      <div className="bh bh--lozenge">
        <Texture />
        <i className="bh__lozenge bh__lozenge--l" aria-hidden="true" />
        <i className="bh__lozenge bh__lozenge--r" aria-hidden="true" />
        <span className="bh__title">{title}</span>
        {aside && <span className="bh__aside">{aside}</span>}
      </div>
    );
  }

  if (variant === 'caps') {
    return (
      <div className="bh bh--caps">
        <Texture />
        <span className="bh__cap bh__cap--l" aria-hidden="true">
          <i className="bh__cap-line" />
          <i className="bh__cap-orn" style={cornerMask} />
        </span>
        <span className="bh__cap bh__cap--r" aria-hidden="true">
          <i className="bh__cap-line" />
          <i className="bh__cap-orn" style={cornerMask} />
        </span>
        <span className="bh__title">{title}</span>
      </div>
    );
  }

  return (
    <div className="bh bh--cartouche">
      <Texture />
      {CORNERS.map((corner) => (
        <i
          key={corner}
          className={`bh__corner bh__corner--${corner}`}
          aria-hidden="true"
          style={cornerMask}
        />
      ))}
      <span className="bh__title">{title}</span>
    </div>
  );
}
