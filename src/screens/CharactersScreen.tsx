import { useEffect, useMemo, useRef, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { BlockMenu } from '../components/BlockMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SettingMark } from '../components/SettingMark';
import {
  IconBraces,
  IconChevronDown,
  IconCopy,
  IconDownload,
  IconFileDown,
  IconSearch,
  IconTrash,
} from '../components/icons';
import { downloadFile, fileText, jsonFileName, parseFile, pdfFileName } from '../data/exchange';
import { downloadBlob } from '../data/download';
import { createCharacter, deleteCharacter, useCharacters } from '../data/store';
import { openAuthDialog, useAuth } from '../firebase/authStore';
import type { CharacterRecord, SettingId } from '../data/types';
import { buildCharacterPdf } from '../pdf/sheetPdf';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

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
    </span>
  );
}

export default function CharactersScreen() {
  const { records, notice } = useCharacters();
  const { ready: authReady, user } = useAuth();
  const saved = useMemo(readView, []);
  const [filter, setFilter] = useState<Filter>(saved.filter);
  const [sort, setSort] = useState<SortMode>(saved.sort);
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  const [importError, setImportError] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* На телефоне поиск спрятан за лупу: место в тулбаре дорого. */
  const toggleSearch = () => {
    if (searchOpen) {
      setQuery('');
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const downloadPdf = async (hero: CharacterRecord) => {
    if (pdfBusy) return;
    setPdfBusy(hero.id);
    try {
      const bytes = await buildCharacterPdf(hero.sheet);
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), pdfFileName(hero));
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

  const downloadJson = (hero: CharacterRecord) => {
    downloadFile(fileText(hero), jsonFileName(hero));
  };

  const cloneHero = (hero: CharacterRecord) => {
    const name = hero.sheet.name.trim();
    void createCharacter(hero.setting, {
      ...hero.sheet,
      name: name ? `${name} (копия)` : 'Копия героя',
    });
  };

  const importHero = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const text = await file.text().catch(() => '');
    const parsed = parseFile(text);
    if (!parsed) {
      setImportError('Не получилось прочитать файл. Нужен файл героя, скачанный отсюда.');
      return;
    }
    setImportError(null);
    setFilter('all');
    setQuery('');
    await createCharacter(parsed.setting, parsed.sheet);
  };

  const menuItems = (hero: CharacterRecord) => [
    {
      label: pdfBusy === hero.id ? 'Собираем PDF…' : 'Скачать PDF',
      icon: <IconFileDown />,
      disabled: pdfBusy !== null,
      onSelect: () => void downloadPdf(hero),
      title: 'Скачать лист персонажа в PDF',
    },
    {
      label: 'Скачать JSON',
      icon: <IconBraces />,
      onSelect: () => downloadJson(hero),
      title: 'Скачать героя файлом — портрет в файл не входит',
    },
    {
      label: 'Клонировать',
      icon: <IconCopy />,
      onSelect: () => cloneHero(hero),
      title: 'Сделать копию героя',
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
    <div className="heroes" style={{ '--sheet-texture': PAPER_TEXTURE } as React.CSSProperties}>
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <AccountButton />
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

              <label className={`search${searchOpen ? ' is-open' : ''}`}>
                <IconSearch />
                <input
                  ref={searchRef}
                  id="heroes-search"
                  type="search"
                  value={query}
                  placeholder="Поиск по имени…"
                  aria-label="Поиск по имени"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="heroes__row">
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

                <button
                  className="heroes__import"
                  type="button"
                  aria-label="Загрузить героя из файла"
                  title="Загрузить героя из файла"
                  onClick={() => importRef.current?.click()}
                >
                  <IconDownload />
                  <span className="heroes__import-label">Загрузить</span>
                </button>

                <button
                  className="iconbtn heroes__searchbtn"
                  type="button"
                  aria-label={searchOpen ? 'Скрыть поиск' : 'Поиск'}
                  aria-expanded={searchOpen}
                  aria-controls="heroes-search"
                  onClick={toggleSearch}
                >
                  <IconSearch />
                </button>
              </div>
            </div>
          )}

          <a className="heroes__create" href="#/new">
            Создать героя
          </a>
        </header>

        <input
          ref={importRef}
          className="heroes__file"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void importHero(event)}
        />

        {importError && (
          <p className="heroes__note" role="alert">
            {importError}
          </p>
        )}

        {notice && !importError && (
          <p className="heroes__note" role="status">
            {notice}
          </p>
        )}

        {records.length === 0 ? (
          <section className="heroes__empty">
            <h2 className="heroes__empty-title">Пока никого нет</h2>
            <p className="heroes__empty-text">
              Создайте первого героя — он появится здесь и сразу откроется готовым листом.
            </p>
            <div className="heroes__empty-actions">
              <a className="heroes__empty-action" href="#/new">
                Создать героя
              </a>
              <button
                className="heroes__empty-action heroes__empty-action--ghost"
                type="button"
                onClick={() => importRef.current?.click()}
              >
                Загрузить из файла
              </button>
            </div>
            {authReady && !user && (
              <p className="heroes__empty-login">
                Герои из аккаунта появятся после входа.{' '}
                <button className="heroes__empty-link" type="button" onClick={openAuthDialog}>
                  Войти
                </button>
              </p>
            )}
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
                    <span className="hero-card__rule" aria-hidden="true" />
                    <span className="hero-card__concept">{hero.sheet.aspects[0]?.text ?? ''}</span>
                    <span className="hero-card__level">
                      уровень <b>{hero.sheet.level}</b>
                    </span>
                  </span>
                  <SettingMark setting={hero.setting} />
                </a>
                <BlockMenu label={`Действия: ${heroName(hero)}`} items={menuItems(hero)} />
              </article>
            ))}
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
