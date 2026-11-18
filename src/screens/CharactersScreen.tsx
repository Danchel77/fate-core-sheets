import { useEffect, useMemo, useRef, useState } from 'react';
import { BlockMenu } from '../components/BlockMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
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
import { deleteCharacter, useCharacters } from '../data/store';
import type { CharacterRecord, SettingId } from '../data/types';
import { buildCharacterPdf } from '../pdf/sheetPdf';
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

/** Имя файла: без символов, которые запрещены в именах файлов. */
function pdfFileName(hero: CharacterRecord): string {
  const base = hero.sheet.name
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return `${base || 'Лист персонажа'}.pdf`;
}

function saveView(view: SavedView) {
  try {
    window.localStorage.setItem(VIEW_KEY, JSON.stringify(view));
  } catch {
    /* приватный режим — фильтр просто не запомнится */
  }
}

/** Имя для карточки: без имени герой всё равно должен быть узнаваем. */
function heroName(hero: CharacterRecord) {
  return hero.sheet.name.trim() || 'Безымянный герой';
}

function HeroPortrait({ hero }: { hero: CharacterRecord }) {
  const photo = hero.sheet.portrait;
  return (
    <span className={`hero-photo${photo ? '' : ' hero-photo--empty'}`}>
      {photo ? (
        <img src={photo} alt="" />
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
  const { records } = useCharacters();
  const saved = useMemo(readView, []);
  const [filter, setFilter] = useState<Filter>(saved.filter);
  const [sort, setSort] = useState<SortMode>(saved.sort);
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CharacterRecord | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [sortOpen]);

  useEffect(() => {
    saveView({ filter, sort });
  }, [filter, sort]);

  const counts = useMemo(
    () => ({
      all: records.length,
      witcher: records.filter((hero) => hero.setting === 'witcher').length,
      fate: records.filter((hero) => hero.setting === 'fate').length,
    }),
    [records],
  );

  const [pdfBusy, setPdfBusy] = useState<string | null>(null);

  const downloadPdf = async (hero: CharacterRecord) => {
    if (pdfBusy) return;
    setPdfBusy(hero.id);
    try {
      const bytes = await buildCharacterPdf(hero.sheet);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFileName(hero);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (error) {
      console.error('Не удалось собрать PDF', error);
      window.alert('Не удалось собрать PDF. Попробуйте ещё раз.');
    } finally {
      setPdfBusy(null);
    }
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    return records
      .filter((hero) => filter === 'all' || hero.setting === filter)
      .filter((hero) => !needle || heroName(hero).toLocaleLowerCase('ru').includes(needle))
      .sort((a, b) =>
        sort === 'name'
          ? heroName(a).localeCompare(heroName(b), 'ru')
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [records, filter, query, sort]);

  const menuItems = (hero: CharacterRecord) => [
    {
      label: pdfBusy === hero.id ? 'Собираем PDF…' : 'Скачать PDF',
      icon: <IconFileDown />,
      disabled: pdfBusy !== null,
      onSelect: () => void downloadPdf(hero),
      title: 'Скачать лист персонажа в PDF',
    },
    {
      label: 'Ссылка на PDF',
      icon: <IconExternalLink />,
      disabled: true,
      onSelect: () => {},
      title: '«Ссылка на PDF» появится на следующем шаге',
    },
    {
      label: 'Скачать JSON',
      icon: <IconBraces />,
      disabled: true,
      onSelect: () => {},
      title: '«Скачать JSON» появится на следующем шаге',
    },
    {
      label: 'Клонировать',
      icon: <IconCopy />,
      disabled: true,
      onSelect: () => {},
      title: '«Клонировать» появится на следующем шаге',
    },
    {
      label: 'Удалить',
      icon: <IconTrash />,
      danger: true,
      onSelect: () => setPendingDelete(hero),
      title: 'Удалить героя вместе с листом',
    },
  ];

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
            Мои персонажи <span className="heroes__count">({records.length})</span>
          </h1>

          {records.length > 0 && (
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
                  placeholder="Поиск по имени…"
                  aria-label="Поиск по имени"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="sort" ref={sortRef}>
                <button
                  className="sort__btn"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-label="Сортировка"
                  onClick={() => setSortOpen((open) => !open)}
                >
                  {SORTS.find((mode) => mode.id === sort)?.label}
                  <IconChevronDown />
                </button>
                {sortOpen && (
                  <ul className="sort__menu" role="listbox" aria-label="Сортировка">
                    {SORTS.map((mode) => (
                      <li key={mode.id}>
                        <button
                          className="sort__opt"
                          type="button"
                          role="option"
                          aria-selected={sort === mode.id}
                          onClick={() => {
                            setSort(mode.id);
                            setSortOpen(false);
                          }}
                        >
                          {mode.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button className="iconbtn" type="button" aria-label="Настройки" title="Настройки">
                <IconSettings />
              </button>
            </div>
          )}
        </header>

        {records.length === 0 ? (
          <section className="heroes__empty">
            <h2 className="heroes__empty-title">Пока никого нет</h2>
            <p className="heroes__empty-text">
              Создайте первого героя — он появится здесь и сразу откроется готовым листом.
            </p>
            <a className="heroes__empty-action" href="#/new">
              Создать героя
            </a>
          </section>
        ) : visible.length === 0 ? (
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
                  aria-label={`Открыть лист: ${heroName(hero)}`}
                >
                  <HeroPortrait hero={hero} />
                  <span className="hero-card__body">
                    <span className="hero-card__name">{heroName(hero)}</span>
                    <span className="hero-card__concept">{hero.sheet.aspects[0]?.text ?? ''}</span>
                    <span className="hero-card__level">
                      уровень <b>{hero.sheet.level}</b>
                    </span>
                  </span>
                </a>
                <BlockMenu label={`Действия: ${heroName(hero)}`} items={menuItems(hero)} />
              </article>
            ))}

            <a className="hero-card hero-card--new" href="#/new">
              <span className="hero-card__plus" aria-hidden="true">
                +
              </span>
              <span className="hero-card__newlabel">Создать героя</span>
            </a>
          </div>
        )}
      </main>

      <footer className="heroes__foot">
        <p>
          Fate Core Sheets — неофициальный инструмент. Fate Core © Evil Hat Productions, «Ведьмак» ©
          CD Projekt Red. Права на сеттинги и торговые марки принадлежат их правообладателям.
        </p>
      </footer>

      {pendingDelete && (
        <ConfirmDialog
          title="Удалить героя?"
          text={`Лист героя «${heroName(pendingDelete)}» и все правки исчезнут. Вернуть их будет нельзя.`}
          confirmLabel="Удалить"
          onConfirm={() => {
            void deleteCharacter(pendingDelete.id);
            setPendingDelete(null);
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
