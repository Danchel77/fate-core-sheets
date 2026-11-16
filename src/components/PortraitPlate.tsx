const BASE = import.meta.env.BASE_URL;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

type Props = {
  src: string;
  alt: string;
};

/** Портрет в бронзовом паспарту с гравированными углами. */
export function PortraitPlate({ src, alt }: Props) {
  return (
    <div className="plate">
      <span
        className="plate__texture"
        aria-hidden="true"
        style={{ backgroundImage: `url(${TEXTURE})` }}
      />
      {src ? (
        <img className="plate__photo" src={src} alt={alt} />
      ) : (
        <span className="plate__empty" role="img" aria-label={alt}>
          <svg viewBox="0 0 90 120" aria-hidden="true">
            <circle cx="45" cy="44" r="17" />
            <path d="M45 66c-18 0-31.4 12-34.4 30.4-.3 1.9 1.2 3.6 3.2 3.6h62.4c2 0 3.5-1.7 3.2-3.6C76.4 78 63 66 45 66Z" />
          </svg>
        </span>
      )}
      <span className="plate__corners" aria-hidden="true">
        {CORNERS.map((corner) => (
          <i
            key={corner}
            className={`plate__corner plate__corner--${corner}`}
            style={{
              maskImage: `url(${CORNER})`,
              WebkitMaskImage: `url(${CORNER})`,
            }}
          />
        ))}
      </span>
    </div>
  );
}
