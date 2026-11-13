const BASE = import.meta.env.BASE_URL;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

export type HeaderVariant = 'cartouche' | 'emboss' | 'rule';

type Props = {
  variant: HeaderVariant;
  title: string;
};

/** Заголовок блока листа: три трактовки — вставка, тиснение, линейка. */
export function BlockHeader({ variant, title }: Props) {
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
        <span
          className="bh__texture"
          aria-hidden="true"
          style={{ backgroundImage: `url(${TEXTURE})` }}
        />
        <span className="bh__title">{title}</span>
      </div>
    );
  }

  return (
    <div className="bh bh--cartouche">
      <span
        className="bh__texture"
        aria-hidden="true"
        style={{ backgroundImage: `url(${TEXTURE})` }}
      />
      {CORNERS.map((corner) => (
        <i
          key={corner}
          className={`bh__corner bh__corner--${corner}`}
          aria-hidden="true"
          style={{
            maskImage: `url(${CORNER})`,
            WebkitMaskImage: `url(${CORNER})`,
          }}
        />
      ))}
      <span className="bh__title">{title}</span>
    </div>
  );
}
