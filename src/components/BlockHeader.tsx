import type { ReactNode } from 'react';

const BASE = import.meta.env.BASE_URL;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;

type Props = {
  title: string;
  /** Небольшая группа справа в плашке (меню ступеней). */
  aside?: ReactNode;
};

/** Заголовок блока листа: плашка с текстурой и ромбами на концах. */
export function BlockHeader({ title, aside }: Props) {
  return (
    <div className="bh">
      <span
        className="bh__texture"
        aria-hidden="true"
        style={{ backgroundImage: `url(${TEXTURE})` }}
      />
      <i className="bh__lozenge bh__lozenge--l" aria-hidden="true" />
      <i className="bh__lozenge bh__lozenge--r" aria-hidden="true" />
      <span className="bh__title">{title}</span>
      {aside && <span className="bh__aside">{aside}</span>}
    </div>
  );
}
