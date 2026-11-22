import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { masterRules, playerRules, type RulesBlock, type RulesItem, type RulesSection } from '../data/rules';
import { IconBookOpen, IconClose } from './icons';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

type TabId = 'player' | 'master';

const TABS: { id: TabId; label: string }[] = [
  { id: 'player', label: 'Игроку' },
  { id: 'master', label: 'Мастеру' },
];

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

/** Жирный, курсив и код внутри абзацев: разметки в данных немного. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function ListItem({ item }: { item: RulesItem }) {
  const text = typeof item === 'string' ? item : item.text;
  const sub = typeof item === 'string' ? false : Boolean(item.sub);
  return (
    <li className={sub ? 'rules__item rules__item--sub' : 'rules__item'}>
      <Rich text={text} />
    </li>
  );
}

function Block({ block }: { block: RulesBlock }) {
  switch (block.kind) {
    case 'h':
      return <h4 className="rules__subhead">{block.text}</h4>;
    case 'p':
      return (
        <p className={block.lead ? 'rules__lead' : undefined}>
          <Rich text={block.text} />
        </p>
      );
    case 'list': {
      const items = block.items.map((item, index) => <ListItem key={index} item={item} />);
      return block.ordered ? (
        <ol className="rules__list">{items}</ol>
      ) : (
        <ul className="rules__list">{items}</ul>
      );
    }
    case 'table':
      return (
        <div className="rules__tablewrap">
          <table className="rules__table">
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <span className="rules__cell-label">{block.columns[cellIndex]}</span>
                      <Rich text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'formula':
      return (
        <p className="rules__callout">
          <Rich text={block.text} />
        </p>
      );
    case 'example':
      return (
        <p className="rules__example">
          <Rich text={block.text} />
        </p>
      );
    default:
      return null;
  }
}

function Section({ section }: { section: RulesSection }) {
  return (
    <section className="rules__section">
      <h3 className="rules__section-title">{section.title}</h3>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </section>
  );
}

type Props = { onClose: () => void };

/**
 * Большое окно шпаргалки: две вкладки, прокручивается только текст.
 * Каркас и крестик — те же, что у остальных окон.
 */
export function RulesDialog({ onClose }: Props) {
  const [tab, setTab] = useState<TabId>('player');
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const tabRefs = {
    player: useRef<HTMLButtonElement>(null),
    master: useRef<HTMLButtonElement>(null),
  };

  const rawId = useId().replace(/:/g, '');
  const titleId = `rules-title-${rawId}`;
  const tabId = (id: TabId) => `rules-tab-${id}-${rawId}`;
  const panelId = `rules-panel-${rawId}`;

  useBodyScrollLock();
  useDialogKeys({ panel: panelRef, onClose, trap: true });

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      const previous = previousFocus.current;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, []);

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const chooseTab = (next: TabId) => {
    setTab(next);
    bodyRef.current?.scrollTo({ top: 0 });
    tabRefs[next].current?.focus();
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const index = TABS.findIndex((item) => item.id === tab);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? TABS.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    chooseTab(TABS[nextIndex].id);
  };

  const sections = tab === 'player' ? playerRules : masterRules;

  return createPortal(
    <div className="sm rules" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className="rules__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="rules__head">
          <span
            className="rules__texture"
            aria-hidden="true"
            style={{ backgroundImage: `url(${PAPER})` }}
          />
          <h2 className="rules__title" id={titleId}>
            Правила Fate Core
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="sm__close rules__close"
            aria-label="Закрыть правила"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </header>

        <div className="rules__tabs" role="tablist" aria-label="Раздел правил">
          {TABS.map((item) => (
            <button
              key={item.id}
              ref={tabRefs[item.id]}
              id={tabId(item.id)}
              className="rules__tab"
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={panelId}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => chooseTab(item.id)}
              onKeyDown={onTabKeyDown}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          ref={bodyRef}
          className="rules__body"
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(tab)}
          tabIndex={0}
        >
          <div className="rules__inner">
            {sections.map((section) => (
              <Section key={section.title} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Кнопка с раскрытой книгой: открывает шпаргалку из шапки списка или листа. */
export function RulesButton({ variant = 'list' }: { variant?: 'list' | 'sheet' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={variant === 'sheet' ? 'sheet-nav__btn rules-open rules-open--sheet' : 'rules-open rules-open--list'}
        aria-label="Правила"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Правила"
        onClick={() => setOpen(true)}
      >
        <IconBookOpen />
        <span className="rules-open__label">Правила</span>
      </button>
      {open && (
        <RulesDialog
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
