import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import '../styles/stunt-modal.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

export type StuntModalVariant = 'plaque' | 'spread' | 'scroll';

type Draft = { name: string; text: string };

type Props = {
  variant: StuntModalVariant;
  mode: 'new' | 'edit';
  initial: Draft;
  count: number;
  baseRefresh: number;
  onSave: (value: Draft) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const TEMPLATES = [
  {
    n: 'I',
    label: '+2 к навыку',
    text: '«Потому что я …, я получаю +2 к [Навыку], когда [узкое условие]».',
  },
  {
    n: 'II',
    label: 'Навык вместо навыка',
    text: '«Потому что я …, я могу использовать [Навык А] вместо [Навыка Б], когда [условие]».',
  },
  {
    n: 'III',
    label: 'Раз за сцену',
    text: '«Раз за сцену или сессию я могу [эффект]».',
  },
] as const;

const ORDINAL = ['', 'первый', 'второй', 'третий', 'четвёртый', 'пятый'];

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Подтверждение удаления: живёт рядом с кнопкой, в каждом окне на своём месте. */
function DeleteControl({
  onDelete,
  variant,
}: {
  onDelete: () => void;
  variant: StuntModalVariant;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className={`sm__danger sm__danger--${variant}`}
        onClick={() => setConfirming(true)}
      >
        Удалить
      </button>
    );
  }

  return (
    <div className={`sm__confirm sm__confirm--${variant}`} role="group" aria-label="Удалить трюк?">
      <span className="sm__confirm-text">Удалить трюк?</span>
      <button type="button" className="sm__confirm-yes" onClick={onDelete}>
        Да
      </button>
      <button type="button" className="sm__confirm-no" onClick={() => setConfirming(false)}>
        Нет
      </button>
    </div>
  );
}

/** Три хода из правил: подача меняется вместе с окном. */
function Templates({ variant }: { variant: StuntModalVariant }) {
  if (variant === 'spread') {
    return (
      <ol className="sm__tpl sm__tpl--spread">
        {TEMPLATES.map((item) => (
          <li className="sm__tpl-item" key={item.n}>
            <span className="sm__tpl-num" aria-hidden="true">
              {item.n}
            </span>
            <div className="sm__tpl-copy">
              <b className="sm__tpl-label">{item.label}</b>
              <span className="sm__tpl-text">{item.text}</span>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (variant === 'scroll') {
    return (
      <div className="sm__rule">
        <p className="sm__rule-title">Три хода</p>
        <ol className="sm__tpl sm__tpl--scroll">
          {TEMPLATES.map((item) => (
            <li className="sm__tpl-item" key={item.n}>
              <span className="sm__tpl-num" aria-hidden="true">
                {item.n}
              </span>
              <div className="sm__tpl-copy">
                <b className="sm__tpl-label">{item.label}</b>
                <span className="sm__tpl-text">{item.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="sm__example">Например: «+2 к Драке, когда противник — чудовище».</p>
      </div>
    );
  }

  return (
    <div className="sm__templates">
      <p className="sm__section-title">Три хода</p>
      <ul className="sm__tpl sm__tpl--plaque">
        {TEMPLATES.map((item) => (
          <li className="sm__tpl-item" key={item.n}>
            <i className="sm__tpl-mark" aria-hidden="true" />
            <div className="sm__tpl-copy">
              <b className="sm__tpl-label">{item.label}</b>
              <span className="sm__tpl-text">{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="sm__example">Например: «+2 к Драке, когда противник — чудовище».</p>
    </div>
  );
}

/**
 * Окно трюка: три подачи одной формы.
 * Карточка и «+» блока открывают его; текст и название правятся здесь.
 */
export function StuntModal({
  variant,
  mode,
  initial,
  count,
  baseRefresh,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [text, setText] = useState(initial.text);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const titleId = `stunt-modal-title-${id}`;
  const formId = `stunt-modal-form-${id}`;
  const nameId = `stunt-modal-name-${id}`;
  const textId = `stunt-modal-text-${id}`;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const previous = document.activeElement as HTMLElement | null;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    if (!panel.contains(document.activeElement)) {
      const firstInput = panel.querySelector<HTMLInputElement>('input');
      (firstInput ?? closeRef.current)?.focus();
    }

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [onClose]);

  const valid = name.trim().length > 0 && text.trim().length > 0;
  const title = mode === 'new' ? 'Новый трюк' : 'Трюк';
  const countAfter = mode === 'new' ? count + 1 : count;
  const overFree = countAfter > 3;
  const refreshAfter = Math.max(1, baseRefresh - Math.max(0, countAfter - 3));

  let note =
    'Три трюка бесплатны. Четвёртый и пятый уменьшают Обновление на 1.';

  if (overFree && mode === 'new') {
    note = `Это ${ORDINAL[countAfter]} трюк: сверх трёх Обновление уменьшится на 1 (${baseRefresh} → ${refreshAfter}).`;
  } else if (overFree) {
    note = `Этот трюк записан сверх трёх: Обновление ${refreshAfter} из ${baseRefresh}.`;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    onSave({ name: name.trim(), text: text.trim() });
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const fields = (
    <form id={formId} className="sm__form" onSubmit={handleSubmit} noValidate>
      <div className="sm__field">
        <label className="sm__label" htmlFor={nameId}>
          Название
        </label>
        <input
          id={nameId}
          className="sm__input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например: Ведьмачьи чувства"
          maxLength={48}
          autoComplete="off"
          required
        />
      </div>
      <div className="sm__field">
        <label className="sm__label" htmlFor={textId}>
          Описание
        </label>
        <textarea
          id={textId}
          className="sm__input sm__textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Например: +2 к Внимательности, когда выслеживаю чудовище по следам."
          rows={variant === 'spread' ? 5 : 4}
          maxLength={240}
          required
        />
      </div>
    </form>
  );

  const actions = (
    <div className="sm__actions">
      <button type="button" className="sm__ghost" onClick={onClose}>
        Отмена
      </button>
      <button type="submit" form={formId} className="sm__primary" disabled={!valid}>
        Сохранить
      </button>
    </div>
  );

  const deleteControl = onDelete ? (
    <DeleteControl onDelete={onDelete} variant={variant} />
  ) : null;

  const closeButton = (
    <button
      ref={closeRef}
      type="button"
      className="sm__close"
      aria-label="Закрыть окно"
      onClick={onClose}
    >
      <span aria-hidden="true">×</span>
    </button>
  );

  const texture = (
    <span
      className="sm__texture"
      aria-hidden="true"
      style={{ backgroundImage: `url(${PAPER})` }}
    />
  );

  return createPortal(
    <div className="sm" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className={`sm__panel sm__panel--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {closeButton}

        {variant === 'plaque' && (
          <>
            <div className="sm__head sm__head--plaque">
              {texture}
              <span className="sm__head-title" id={titleId}>
                {title}
              </span>
            </div>

            <div className="sm__body sm__body--plaque">
              <p className="sm__sub">Узкая способность, а не вторая профессия.</p>
              {fields}
              <Templates variant="plaque" />
              <p className={`sm__note${overFree ? ' sm__note--warn' : ''}`}>{note}</p>
            </div>

            <footer className="sm__footer sm__footer--plaque">
              <div className="sm__footer-left">
                {deleteControl ?? <span className="sm__count">{count} из 5</span>}
              </div>
              {actions}
            </footer>
          </>
        )}

        {variant === 'spread' && (
          <>
            <div className="sm__head sm__head--spread">
              {texture}
              <span className="sm__head-title" id={titleId}>
                {title}
              </span>
            </div>

            <div className="sm__body sm__body--spread">
              <aside className="sm__margin">
                <p className="sm__section-title">Три хода</p>
                <p className="sm__margin-hint">
                  Трюк — узкая способность, а не вторая профессия.
                </p>
                <Templates variant="spread" />
                <p className="sm__example">Например: «+2 к Драке, когда противник — чудовище».</p>
              </aside>

              <div className="sm__main">
                {fields}
                <p className="sm__main-hint">
                  Пиши коротко: одно условие, один навык, один эффект.
                </p>
                <p className={`sm__note sm__note--spread${overFree ? ' sm__note--warn' : ''}`}>
                  {note}
                </p>
                {deleteControl && <div className="sm__delete-row">{deleteControl}</div>}
              </div>
            </div>

            <footer className="sm__footer sm__footer--spread">
              <span className="sm__count">Трюков: {count} из 5</span>
              {actions}
            </footer>
          </>
        )}

        {variant === 'scroll' && (
          <>
            <header className="sm__head sm__head--scroll">
              <p className="sm__eyebrow">Трюки</p>
              <h2 className="sm__display" id={titleId}>
                {title}
              </h2>
              <i className="sm__ornament" aria-hidden="true" />
            </header>

            <div className="sm__body sm__body--scroll">
              <p className="sm__sub sm__sub--scroll">
                Узкая способность, а не вторая профессия.
              </p>
              <Templates variant="scroll" />
              {fields}
              <p className={`sm__note${overFree ? ' sm__note--warn' : ''}`}>{note}</p>
              {deleteControl && <div className="sm__delete-row">{deleteControl}</div>}
            </div>

            <footer className="sm__footer sm__footer--scroll">
              <button
                type="submit"
                form={formId}
                className="sm__primary sm__primary--wide"
                disabled={!valid}
              >
                Сохранить
              </button>
              <button type="button" className="sm__cancel-link" onClick={onClose}>
                Отмена
              </button>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
