type Props = {
  className?: string;
};

/** Силуэт героя для пустого портрета: размеры и заливку задаёт родитель. */
export function HeroSilhouette({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="23" r="11.5" />
      <path d="M32 38c-11.4 0-19.6 7.4-21.6 18.4-.2 1.2.8 2.2 2 2.2h39.2c1.2 0 2.2-1 2-2.2C51.6 45.4 43.4 38 32 38Z" />
    </svg>
  );
}
