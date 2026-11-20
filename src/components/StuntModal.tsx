import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { refreshWithStunts } from '../data/characters';
import { IconClose } from './icons';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

type Draft = { name: string; text: string };

type Props = {
  mode: 'new' | 'edit';
  initial: Draft;
  count: number;
  baseRefresh: number;
  onSave: (value: Draft) => void;
  onDelete?: () => void;
  onClose: () => void;
};


/** Предупреждение о цене четвёртого и пятого трюка. */
function buildWarning(
  mode: 'new' | 'edit',
  countAfter: number,
  baseRefresh: number,
): string | null {
  if (mode !== 'new' || countAfter <= 3) return null;

  const refreshBefore = refreshWithStunts(baseRefresh, countAfter - 1);
  const refreshAfter = refreshWithStunts(baseRefresh, countAfter);
  if (refreshAfter >= refreshBefore) return null;

  const ordinal = countAfter === 4 ? 'четвёртый' : 'пятый';
  const tail = countAfter >= 5 ? ' Больше пяти трюков взять нельзя.' : '';
  return `Это ${ordinal} трюк. Обновление уменьшится на 1: ${refreshBefore} → ${refreshAfter}.${tail}`;
}

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

function Hint() {
  return (
    <details className="sm__hint">
      <summary className="sm__hint-summary">Как придумать трюк</summary>
      <div className="sm__hint-body">
        <p>
          <strong>Что такое трюк.</strong> Трюк — это приём персонажа, который даёт
          преимущество в конкретном случае. Вы можете использовать трюк, когда выполнены его
          условия.
        </p>
        <p>
          <strong>Хороший трюк.</strong> Он не работает всегда: помогает в конкретной
          ситуации, которая реально случается в игре, и не заменяет навык. Если условие
          слишком широкое, Мастер попросит его сузить.
        </p>
        <p>
          <strong>Шаблоны.</strong> Ниже три шаблона с примерами. Это не обязательные правила:
          можно написать свой вариант.
        </p>
        <ol className="sm__hint-list">
          <li>
            <span className="sm__hint-pattern">+2 к [Навык], когда [условие].</span>
            <span className="sm__hint-example">
              Пример: «Серебряный меч» — +2 к Драке, когда вы сражаетесь против чудовища.
            </span>
          </li>
          <li>
            <span className="sm__hint-pattern">
              Использую [Навык А] вместо [Навык Б], когда [условие].
            </span>
            <span className="sm__hint-example">
              Пример: «Парирую стрелы» — использую Драку вместо Атлетики, когда защищаюсь от
              стрел и метательного оружия.
            </span>
          </li>
          <li>
            <span className="sm__hint-pattern">Раз за сцену или сессию могу [эффект].</span>
            <span className="sm__hint-example">
              Пример: «Знак Игни» — раз за сцену поджигаю всё в одном секторе.
            </span>
          </li>
        </ol>
      </div>
    </details>
  );
}

/**
 * Окно трюка: название, описание, подсказка и цена сверх трёх трюков.
 * Строка блока и меню «Добавить трюк» открывают его.
 */
export function StuntModal({
  mode,
  initial,
  count,
  baseRefresh,
  onSave,
  onDelete,
  onClose,
}: Props) {
  useBodyScrollLock();
  const [name, setName] = useState(initial.name);
  const [text, setText] = useState(initial.text);
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const titleId = `stunt-modal-title-${id}`;
  const formId = `stunt-modal-form-${id}`;
  const nameId = `stunt-modal-name-${id}`;
  const textId = `stunt-modal-text-${id}`;

  const previousFocus = useRef<HTMLElement | null>(null);
  useDialogKeys({ panel: panelRef, onClose, trap: true });

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => {
      const previous = previousFocus.current;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, []);

  /* Описание ровно в две строки, а дальше растёт под текст. */
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const valid = name.trim().length > 0 && text.trim().length > 0;
  const title = mode === 'new' ? 'Новый трюк' : 'Трюк';
  const countAfter = mode === 'new' ? count + 1 : count;
  const warning = buildWarning(mode, countAfter, baseRefresh);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    onSave({ name: name.trim(), text: text.trim() });
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="sm" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className="sm__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sm__head">
          <span
            className="sm__texture"
            aria-hidden="true"
            style={{ backgroundImage: `url(${PAPER})` }}
          />
          <span className="sm__head-title" id={titleId}>
            {title}
          </span>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body">
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
                placeholder="Например: Ведьмачьи чувства…"
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
                ref={textRef}
                id={textId}
                className="sm__input sm__textarea"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Например: +2 к Внимательности, когда выслеживаю чудовище."
                rows={2}
                maxLength={240}
                required
              />
            </div>

            <Hint />
          </form>

          {warning && <p className="sm__note sm__note--warn">{warning}</p>}
        </div>

        <footer className="sm__footer">
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
              Сохранить
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
