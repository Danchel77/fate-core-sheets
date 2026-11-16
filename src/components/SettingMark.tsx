import type { CSSProperties } from 'react';

const BASE = import.meta.env.BASE_URL;

const MARKS: Record<string, { url: string; label: string; className: string }> = {
  witcher: {
    url: `${BASE}assets/logos/wolf-head.svg`,
    label: 'Сеттинг «Ведьмак»',
    className: 'setting-mark--witcher',
  },
  fate: {
    url: `${BASE}assets/logos/fate-wordmark.svg`,
    label: 'Сеттинг Fate',
    className: 'setting-mark--fate',
  },
};

/** Знак сеттинга в левом нижнем углу портрета: один и тот же на фото и на заглушке. */
export function SettingMark({ setting }: { setting: string }) {
  const mark = MARKS[setting];
  if (!mark) return null;

  const style: CSSProperties = {
    WebkitMaskImage: `url(${mark.url})`,
    maskImage: `url(${mark.url})`,
  };

  return (
    <span className={`setting-mark ${mark.className}`} role="img" aria-label={mark.label} title={mark.label}>
      <i className="setting-mark__edge setting-mark__edge--l" style={style} aria-hidden="true" />
      <i className="setting-mark__edge setting-mark__edge--r" style={style} aria-hidden="true" />
      <i className="setting-mark__edge setting-mark__edge--t" style={style} aria-hidden="true" />
      <i className="setting-mark__edge setting-mark__edge--b" style={style} aria-hidden="true" />
      <i className="setting-mark__shape" style={style} aria-hidden="true" />
    </span>
  );
}
