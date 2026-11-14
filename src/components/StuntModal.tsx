import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import '../styles/stunt-modal.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

export type StuntModalVariant = 'plaque' | 'margin' | 'ledger';

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

type Copy = {
  nameLabel: string;
  namePlaceholder: string;
  textLabel: string;
  textPlaceholder: string;
  help: string;
  example: string;
  note: string;
  saveLabel: string;
};

const COPY: Record<StuntModalVariant, Copy> = {
  plaque: {
    nameLabel: 'Название',
    namePlaceholder: 'Например: Ведьмачьи чувства',
    textLabel: 'Описание',
    textPlaceholder: 'Например: +2 к Внимательности, когда выслеживаю чудовище.',
    help: 'Коротко: одно условие и один эффект — этого достаточно.',
    example: 'Например: «+2 к Драке, когда противник — чудовище».',
    note: 'Первые три трюка бесплатны. Четвёртый и пятый снижают Обновление на 1.',
    saveLabel: 'Сохранить',
  },
  margin: {
    nameLabel: 'Имя',
    namePlaceholder: 'Например: Два меча',
    textLabel: 'Правило',
    textPlaceholder: 'Потому что я ведьмак, я получаю +2 к Драке против чудовищ.',
    help: 'Начни с «Потому что я…» — так сразу видно, откуда сила.',
    example: 'Например: «Потому что я ведьмак, я получаю +2 к Драке против чудовищ».',
    note: 'Три трюка входят в Обновление. Каждый следующий — минус 1.',
    saveLabel: 'Записать',
  },
  ledger: {
    nameLabel: 'Название',
    namePlaceholder: 'Например: Знак Игни',
    textLabel: 'Когда срабатывает',
    textPlaceholder: 'Раз за сцену я могу поджечь всё в одном секторе.',
    help: 'Опиши, что происходит и когда. Чем короче, тем легче держать в голове.',
    example: 'Например: «Раз за сцену я могу…».',
    note: 'Сверх трёх трюков Обновление уменьшается на 1 за каждый.',
    saveLabel: 'Сохранить',
  },
};

const ORDINAL = ['', 'первый', 'второй', 'третий', 'четвёртый', 'пятый'];

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Подтверждение удаления: два шага, чтобы не стереть трюк случайно. */
function DeleteControl({ onDelete }: { onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="sm__danger" onClick={() => setConfirming(true)}>
        Удалить
      </button>
    );
  }

  return (
    <div className="sm__confirm" role="group" aria-label="Удалить трюк?">
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

function buildNote(
  variant: StuntModalVariant,
  mode: 'new' | 'edit',
  countAfter: number,
  baseRefresh: number,
  refreshAfter: number,
) {
  if (countAfter <= 3) return COPY[variant].note;

  if (mode === 'new') {
    if (variant === 'plaque') {
      return `Это ${ORDINAL[countAfter]} трюк. Обновление: ${baseRefresh} → ${refreshAfter}.`;
    }
    if (variant === 'margin') {
      return `Сверх трёх: ${ORDINAL[countAfter]} трюк снизит Обновление на 1 (${baseRefresh} → ${refreshAfter}).`;
    }
    return `Сверх трёх: останется ${refreshAfter} Обновления.`;
  }

  if (variant === 'plaque') {
    return `Трюк записан сверх трёх: Обновление ${refreshAfter} из ${baseRefresh}.`;
  }
  if (variant === 'margin') {
    return `Сверх бесплатных: Обновление ${refreshAfter} из ${baseRefresh}.`;
  }
  return `Этот трюк сверх трёх: Обновление ${refreshAfter} из ${baseRefresh}.`;
}

/**
 * Окно трюка: три компактные подачи одной формы.
 * Строка блока и «+» открывают его; название и описание правятся здесь.
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
  const copy = COPY[variant];
  const note = buildNote(variant, mode, countAfter, baseRefresh, refreshAfter);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    onSave({ name: name.trim(), text: text.trim() });
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const fields = (
    <form
      id={formId}
      className={`sm__form sm__form--${variant}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="sm__field">
        <label className="sm__label" htmlFor={nameId}>
          {copy.nameLabel}
        </label>
        <input
          id={nameId}
          className="sm__input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={copy.namePlaceholder}
          maxLength={48}
          autoComplete="off"
          required
        />
      </div>
      <div className="sm__field">
        <label className="sm__label" htmlFor={textId}>
          {copy.textLabel}
        </label>
        <textarea
          id={textId}
          className="sm__input sm__textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={copy.textPlaceholder}
          rows={3}
          maxLength={240}
          required
        />
      </div>
    </form>
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
        <button
          ref={closeRef}
          type="button"
          className="sm__close"
          aria-label="Закрыть окно"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        {variant === 'plaque' && (
          <div className="sm__head sm__head--plaque">
            {texture}
            <span className="sm__head-title" id={titleId}>
              {title}
            </span>
          </div>
        )}

        {variant === 'margin' && (
          <header className="sm__head sm__head--margin">
            <span className="sm__head-title" id={titleId}>
              {title}
            </span>
          </header>
        )}

        {variant === 'ledger' && (
          <header className="sm__head sm__head--ledger">
            <h2 className="sm__display" id={titleId}>
              {title}
            </h2>
            <i className="sm__ornament" aria-hidden="true" />
          </header>
        )}

        <div className={`sm__body sm__body--${variant}`}>
          {fields}
          <p className="sm__help">
            {copy.help}
            <span className="sm__help-example">{copy.example}</span>
          </p>
          <p className={`sm__note${overFree ? ' sm__note--warn' : ''}`}>{note}</p>
        </div>

        <footer className={`sm__footer sm__footer--${variant}`}>
          <div className="sm__footer-left">
            {onDelete ? (
              <DeleteControl onDelete={onDelete} />
            ) : (
              <span className="sm__count">Трюков: {count} из 5</span>
            )}
          </div>
          <div className="sm__actions">
            <button type="button" className="sm__ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" form={formId} className="sm__primary" disabled={!valid}>
              {copy.saveLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
