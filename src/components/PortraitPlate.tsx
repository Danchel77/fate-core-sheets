const BASE = import.meta.env.BASE_URL;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

type Props = {
  src: string;
  alt: string;
};

/** Портрет в бронзовом паспарту с гравированными углами. */
export function PortraitPlate({ src, alt }: Props) {
  return (
    <div className="plate">
      <img className="plate__photo" src={src} alt={alt} />
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
