import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { settingConfig } from '../data/settings';
import type { NameGender } from '../data/settings/types';
import type { SettingId } from '../data/types';
import { IconDices } from './icons';
import '../styles/stunt-modal.css';
import '../styles/name-generator.css';

/** Сколько предыдущих имён помнить: игрок часто перегенерирует и хочет вернуться. */
const HISTORY_LIMIT = 10;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [href], [tabindex]:not([tabindex="-1"])';

type GenderChoice = 'any' | NameGender;

type Props = {
  setting: SettingId;
  onPick: (name: string) => void;
  onClose: () => void;
};

const GENDERS: Array<{ id: GenderChoice; label: string }> = [
  { id: 'any', label: 'Любой' },
  { id: 'male', label: 'Мужской' },
  { id: 'female', label: 'Женский' },
];

/**
 * Собирает имя по выбранным полу и народу.
 *
 * У ведьмаков к имени добавляется королевство в родительном падеже —
 * «Геральт из Ривии». Список королевств лежит в конфигурации сеттинга,
 * там же наборы имён по народам.
 */
function pickName(
  setting: SettingId,
  gender: GenderChoice,
  groupId: string,
  avoid: string | null,
): string {
  const config = settingConfig(setting);

  let groups = config.nameGroups;
  if (gender !== 'any') {
    const byGender = groups.filter((group) => group.genders.includes(gender));
    if (byGender.length > 0) groups = byGender;
  }
  if (groupId !== 'any') {
    const only = groups.find((group) => group.id === groupId);
    if (only) groups = [only];
  }
  if (groups.length === 0) groups = config.nameGroups;

  const group = groups[Math.floor(Math.random() * groups.length)];
  const picked: NameGender =
    gender !== 'any' && group.genders.includes(gender)
      ? gender
      : group.genders[Math.floor(Math.random() * group.genders.length)];
  const pool = group.names[picked];
  if (pool.length === 0) return avoid ?? '';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const crown =
      group.kingdom && config.kingdoms.length > 0
        ? ` из ${config.kingdoms[Math.floor(Math.random() * config.kingdoms.length)]}`
        : '';
    const candidate = `${base}${crown}`;
    if (candidate !== avoid) return candidate;
  }
  return pool[0];
}

/**
 * Генератор имён для шага «Кто он».
 *
 * Окно живёт в каркасе окна трюка: те же плашка, поля и подвал. История
 * последних имён — чипами под кнопкой: клик возвращает вариант в результат.
 */
export function NameGenerator({ setting, onPick, onClose }: Props) {
  const config = settingConfig(setting);
  const [gender, setGender] = useState<GenderChoice>('any');
  const [groupId, setGroupId] = useState<string>('any');
  const [current, setCurrent] = useState<string>(() => pickName(setting, 'any', 'any', null));
  const [history, setHistory] = useState<string[]>([]);

  const panelRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<HTMLButtonElement>(null);

  /* Народы, у которых есть имена выбранного пола. */
  const groups = useMemo(() => {
    if (gender === 'any') return config.nameGroups;
    const byGender = config.nameGroups.filter((group) => group.genders.includes(gender));
    return byGender.length > 0 ? byGender : config.nameGroups;
  }, [config.nameGroups, gender]);

  /* Выбранный народ мог исчезнуть после смены пола — тогда «Любой». */
  const activeGroup = groups.some((group) => group.id === groupId) ? groupId : 'any';

  /* Пока окно открыто, страница под ним не прокручивается. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    goRef.current?.focus();
  }, []);

  /* Esc закрывает генератор, но не конструктор под ним: ловим в capture. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const trapTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null,
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const generate = () => {
    const previous = current;
    const next = pickName(setting, gender, activeGroup, previous);
    if (!next) return;
    setCurrent(next);
    if (previous && previous !== next) {
      setHistory((items) => [previous, ...items.filter((item) => item !== previous)].slice(0, HISTORY_LIMIT));
    }
  };

  const backdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="sm" role="presentation" onMouseDown={backdrop}>
      <div
        className="sm__panel ng"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ng-title"
        ref={panelRef}
        onKeyDown={trapTab}
      >
        <header className="sm__head">
          <span className="sm__texture" aria-hidden="true" />
          <h2 className="sm__head-title" id="ng-title">
            Генератор имён
          </h2>
        </header>

        <div className="sm__body ng__body">
          <p className="ng__lead">Выберите пол и народ — имя появится ниже.</p>

          <div className="ng__row">
            <span className="ng__label">Пол</span>
            <div className="ng__chips" role="group" aria-label="Пол">
              {GENDERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ng__chip"
                  aria-pressed={gender === item.id}
                  onClick={() => setGender(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ng__row">
            <span className="ng__label">Кто он</span>
            <div className="ng__chips" role="group" aria-label="Кто он">
              <button
                type="button"
                className="ng__chip"
                aria-pressed={activeGroup === 'any'}
                onClick={() => setGroupId('any')}
              >
                Любой
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className="ng__chip"
                  aria-pressed={activeGroup === group.id}
                  onClick={() => setGroupId(group.id)}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ng__result" aria-live="polite">
            <span className="ng__name">{current || 'Имя не выбрано'}</span>
          </div>

          <button ref={goRef} type="button" className="ng__go" onClick={generate}>
            <IconDices />
            Сгенерировать
          </button>

          <div className="ng__history">
            <span className="ng__history-label">Предыдущие варианты</span>
            {history.length > 0 ? (
              <div className="ng__history-list">
                {history.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="ng__history-chip"
                    onClick={() => setCurrent(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              <p className="ng__history-empty">Появятся после первой генерации.</p>
            )}
          </div>
        </div>

        <footer className="sm__footer">
          <div className="sm__footer-left" />
          <div className="sm__actions">
            <button type="button" className="sm__ghost" onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className="sm__primary"
              disabled={!current}
              onClick={() => current && onPick(current)}
            >
              Подставить
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
