import { useEffect, useState, type CSSProperties } from 'react';
import { AccountButton } from '../components/AccountButton';
import { IconArrowLeft } from '../components/icons';
import { readShare, type SharedHero } from '../data/cloud';
import { createCharacter, useCharacters } from '../data/store';
import type { CharacterRecord } from '../data/types';
import SheetLoading from './SheetLoading';
import SheetScreen from './SheetScreen';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

type Props = { token: string };
type Status =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'error' }
  | { kind: 'found'; hero: SharedHero };

/** Чужой лист по ссылке: показываем как есть, добавить можно только себе. */
export default function SharedScreen({ token }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const { ready } = useCharacters();
  const [adding, setAdding] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus({ kind: 'loading' });
    readShare(token)
      .then((hero) => {
        if (!alive) return;
        setStatus(hero ? { kind: 'found', hero } : { kind: 'missing' });
      })
      .catch(() => {
        if (alive) setStatus({ kind: 'error' });
      });
    return () => {
      alive = false;
    };
  }, [token]);

  if (status.kind === 'loading') return <SheetLoading />;

  if (status.kind !== 'found') {
    return (
      <div
        className="table"
        style={{ '--sheet-texture': PAPER_TEXTURE } as CSSProperties}
      >
        <nav className="sheet-nav">
          <a href="#/">
            <IconArrowLeft />
            <span className="sheet-nav__label">Мои персонажи</span>
            <span className="sheet-nav__label-short">Персонажи</span>
          </a>
          <div className="sheet-nav__actions">
            <AccountButton variant="sheet" />
          </div>
        </nav>
        <div className="shared-error">
          <p className="shared-error__title">
            {status.kind === 'missing' ? 'Ссылка не работает' : 'Не удалось открыть лист'}
          </p>
          <p className="shared-error__text">
            {status.kind === 'missing'
              ? 'Владелец отозвал её или скопировал адрес с ошибкой.'
              : 'Проверьте связь и попробуйте ещё раз.'}
          </p>
          <a className="shared-error__link" href="#/">
            К моим персонажам
          </a>
        </div>
      </div>
    );
  }

  const { hero } = status;

  const add = async () => {
    if (adding || !ready) return;
    setAdding(true);
    try {
      const record = await createCharacter(hero.setting, hero.sheet);
      setAddedId(record.id);
    } finally {
      setAdding(false);
    }
  };

  /* Запись нужна только для экспорта: страница показывает чужого героя без
     хранения, а PDF/JSON собираются из его листа и сеттинга. */
  const sharedRecord: CharacterRecord = {
    id: `shared-${token}`,
    setting: hero.setting,
    createdAt: '',
    updatedAt: '',
    sheet: hero.sheet,
  };

  return (
    <SheetScreen
      character={hero.sheet}
      setting={hero.setting}
      record={sharedRecord}
      readOnly
      header={
        <div className="shared-note">
          <span className="shared-note__text">
            Лист другого игрока · правки видит только владелец
          </span>
          {addedId ? (
            <a className="shared-note__btn" href={`#/hero/${addedId}`}>
              Открыть мой лист
            </a>
          ) : (
            <button
              type="button"
              className="shared-note__btn"
              onClick={() => void add()}
              disabled={adding || !ready}
            >
              {adding ? 'Добавляем…' : 'Добавить себе'}
            </button>
          )}
        </div>
      }
    />
  );
}
