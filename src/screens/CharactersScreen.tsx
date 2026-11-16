import { useEffect, useMemo, useState } from 'react';
import { BlockMenu } from '../components/BlockMenu';
import { SettingMark } from '../components/SettingMark';
import {
  IconBraces,
  IconChevronDown,
  IconCopy,
  IconExternalLink,
  IconFileDown,
  IconSearch,
  IconSettings,
  IconTrash,
} from '../components/icons';
import { characters, type CharacterRecord, type SettingId } from '../data/characters';
import '../styles/characters.css';

type Filter = 'all' | SettingId;
type SortMode = 'date' | 'name';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'witcher', label: 'Ведьмак' },
  { id: 'fate', label: 'Fate' },
];

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'date', label: 'Сначала новые' },
  { id: 'name', label: 'По имени' },
];

/** Что запоминаем между заходами: только фильтр и порядок. Поиск — на один раз. */
const VIEW_KEY = 'fate-core-sheets:list-view';

type SavedView = { filter: Filter; sort: SortMode };

function readView(): SavedView {
  try {
    const raw = window.localStorage.getItem(VIEW_KEY);
    if (!raw) return { filter: 'all', sort: 'date' };
    const parsed = JSON.parse(raw) as Partial<SavedView>;
    return {
      filter: FILTERS.some((item) => item.id === parsed.filter) ? parsed.filter! : 'all',
      sort: SORTS.some((item) => item.id === parsed.sort) ? parsed.sort! : 'date',
    };
  } catch {
    return { filter: 'all', sort: 'date' };
  }
}

function saveView(view: SavedView) {
  try {
    window.localStorage.setItem(VIEW_KEY, JSON.stringify(view));
  } catch {
    /* приватный режим — фильтр просто не запомнится */
  }
}

/** Меню карточки: пункты пока заглушки, работают на следующем шаге. */
const CARD_ACTIONS = [
  { label: 'Скачать PDF', icon: <IconFileDown /> },
  { label: 'Ссылка на PDF', icon: <IconExternalLink /> },
  { label: 'Скачать JSON', icon: <IconBraces /> },
  { label: 'Клонировать', icon: <IconCopy /> },
  { label: 'Удалить', icon: <IconTrash />, danger: true },
];

function HeroPortrait({ hero }: { hero: CharacterRecord }) {
  return (
    <span className={`hero-photo${hero.portrait ? '' : ' hero-photo--empty'}`}>
      {hero.portrait ? (
        <img src={hero.portrait} alt="" />
      ) : (
        <svg className="hero-photo__figure" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="23" r="11.5" />
          <path d="M32 38c-11.4 0-19.6 7.4-21.6 18.4-.2 1.2.8 2.2 2 2.2h39.2c1.2 0 2.2-1 2-2.2C51.6 45.4 43.4 38 32 38Z" />
        </svg>
      )}
      <SettingMark setting={hero.setting} />
    </span>
  );
}

export default function CharactersScreen() {
  const saved = useMemo(readView, []);
  const [filter, setFilter] = useState<Filter>(saved.filter);
  const [sort, setSort] = useState<SortMode>(saved.sort);
  const [query, setQuery] = useState('');

  useEffect(() => {
    saveView({ filter, sort });
  }, [filter, sort]);

  const counts = useMemo(
    () => ({
      all: characters.length,
      witcher: characters.filter((hero) => hero.setting === 'witcher').length,
      fate: characters.filter((hero) => hero.setting === 'fate').length,
    }),
    [],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    return characters
      .filter((hero) => filter === 'all' || hero.setting === filter)
      .filter((hero) => !needle || hero.name.toLocaleLowerCase('ru').includes(needle))
      .sort((a, b) =>
        sort === 'name'
          ? a.name.localeCompare(b.name, 'ru')
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [filter, query, sort]);

  const menuItems = () =>
    CARD_ACTIONS.map((action) => ({
      label: action.label,
      icon: action.icon,
      danger: action.danger,
      disabled: true,
      onSelect: () => {},
      title: `«${action.label}» появится на следующем шаге`,
    }));

  return (
    <div className="heroes">
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandmark" aria-hidden="true">
            F
          </span>
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <button className="heroes__login" type="button">
          Войти
        </button>
      </header>

      <main className="heroes__page">
        <header className="heroes__head">
          <h1 className="heroes__title">
            Мои персонажи <span className="heroes__count">({characters.length})</span>
          </h1>

          <div className="heroes__tools">
            <div className="seg" role="group" aria-label="Фильтр по сеттингу">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  className="seg__btn"
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  <span className="seg__count">{counts[item.id]}</span>
                </button>
              ))}
            </div>

            <label className="search">
              <IconSearch />
              <input
                type="search"
                value={query}
                placeholder="Поиск по имени"
                aria-label="Поиск по имени"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <label className="sort">
              <select
                value={sort}
                aria-label="Сортировка"
                onChange={(event) => setSort(event.target.value as SortMode)}
              >
                {SORTS.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <IconChevronDown />
            </label>

            <button className="iconbtn" type="button" aria-label="Настройки" title="Настройки">
              <IconSettings />
            </button>
          </div>
        </header>

        {visible.length === 0 ? (
          <section className="heroes__empty">
            <h2 className="heroes__empty-title">Никого не нашлось</h2>
            <p className="heroes__empty-text">
              Попробуйте другое имя или сбросьте фильтры сеттинга.
            </p>
            <button
              className="heroes__empty-action"
              type="button"
              onClick={() => {
                setFilter('all');
                setQuery('');
              }}
            >
              Сбросить фильтры
            </button>
          </section>
        ) : (
          <div className="heroes__grid">
            {visible.map((hero) => (
              <article className="hero-card" key={hero.id}>
                <a
                  className="hero-card__link"
                  href={`#/hero/${hero.id}`}
                  aria-label={`Открыть лист: ${hero.name}`}
                >
                  <HeroPortrait hero={hero} />
                  <span className="hero-card__body">
                    <span className="hero-card__name">{hero.name}</span>
                    <span className="hero-card__concept">{hero.concept}</span>
                    <span className="hero-card__level">
                      уровень <b>{hero.level}</b>
                    </span>
                  </span>
                </a>
                <BlockMenu label={`Действия: ${hero.name}`} items={menuItems()} />
              </article>
            ))}

            <button className="hero-card hero-card--new" type="button">
              <span className="hero-card__plus" aria-hidden="true">
                +
              </span>
              <span className="hero-card__newlabel">Создать героя</span>
            </button>
          </div>
        )}
      </main>

      <footer className="heroes__foot">
        <p>
          Fate Core Sheets — неофициальный инструмент. Fate Core © Evil Hat Productions, «Ведьмак» ©
          CD Projekt Red. Права на сеттинги и торговые марки принадлежат их правообладателям.
        </p>
      </footer>
    </div>
  );
}
