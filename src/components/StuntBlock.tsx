import type { Stunt } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import '../styles/stunt-block.css';

export type StuntVariant = 'scroll' | 'cards' | 'register';

type Props = {
  stunts: Stunt[];
  variant?: StuntVariant;
};

/**
 * Блок «Трюки»: постоянные способности героя.
 * Три варианта подачи перечня живут здесь до выбора пользователя.
 */
export function StuntBlock({ stunts, variant = 'scroll' }: Props) {
  return (
    <section className={`stk stk--${variant}`}>
      <BlockHeader title="Трюки" />

      {variant === 'scroll' && (
        <ul className="stk__scroll">
          {stunts.map((stunt) => (
            <li className="stk__scroll-row" key={stunt.name}>
              <p className="stk__scroll-text">
                <b className="stk__scroll-name">{stunt.name}.</b> {stunt.text}
              </p>
            </li>
          ))}
        </ul>
      )}

      {variant === 'cards' && (
        <div className="stk__cards">
          {stunts.map((stunt) => (
            <article className="stk__card" key={stunt.name}>
              <h3 className="stk__card-name">{stunt.name}</h3>
              <p className="stk__card-text">{stunt.text}</p>
            </article>
          ))}
        </div>
      )}

      {variant === 'register' && (
        <dl className="stk__reg">
          {stunts.map((stunt) => (
            <div className="stk__reg-row" key={stunt.name}>
              <dt className="stk__reg-name">{stunt.name}</dt>
              <dd className="stk__reg-text">{stunt.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
