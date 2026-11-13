const BASE = import.meta.env.BASE_URL;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

export type HeaderVariant = 'cartouche' | 'fleuron' | 'plaque';

type Props = {
  variant: HeaderVariant;
  title: string;
};

/** Заголовок блока листа: три трактовки — рамка, флерон, бронзовая плашка. */
export function BlockHeader({ variant, title }: Props) {
  if (variant === 'fleuron') {
    return (
      <div className="bh bh--fleuron">
        <span className="bh__rule" aria-hidden="true" />
        <i className="bh__gem" aria-hidden="true" />
        <span className="bh__title">{title}</span>
        <i className="bh__gem" aria-hidden="true" />
        <span className="bh__rule bh__rule--end" aria-hidden="true" />
      </div>
    );
  }

  if (variant === 'plaque') {
    return (
      <div className="bh bh--plaque">
        <span className="bh__title">{title}</span>
      </div>
    );
  }

  return (
    <div className="bh bh--cartouche">
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
