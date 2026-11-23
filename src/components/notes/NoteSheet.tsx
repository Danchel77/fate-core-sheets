import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  addNote,
  deleteNote,
  updateNote,
  type BlockId,
  type GroupNote,
} from '../../data/groups';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useDialogKeys } from '../../hooks/useDialogKeys';
import { IconClose } from '../icons';

const TITLES: Record<BlockId, string> = {
  character: 'Персонаж',
  aspects: 'Аспекты',
  skills: 'Навыки',
  stunts: 'Трюки',
  stress: 'Стресс и последствия',
  extras: 'Дополнения',
};

const MAX_TEXT = 600;

function ago(ts: number): string {
  if (!ts) return '';
  const minutes = Math.round((Date.now() - ts) / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'вчера' : `${days} дн назад`;
}

type Props = {
  groupId: string;
  heroId: string;
  blockId: BlockId;
  notes: GroupNote[];
  me: { uid: string; name: string; isMaster: boolean };
  onClose: () => void;
};

/** Нижнее окно заметок блока: список, добавление, правка и удаление. */
export function NoteSheet({ groupId, heroId, blockId, notes, me, onClose }: Props) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useBodyScrollLock();
  useDialogKeys({ panel, onClose, trap: true, capture: true });

  useEffect(() => {
    field.current?.focus();
  }, []);

  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch {
      setError('Не получилось сохранить заметку. Проверьте связь и попробуйте ещё раз.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    const ok = await run(() =>
      addNote(groupId, {
        heroId,
        blockId,
        authorId: me.uid,
        authorName: me.name,
        text: text.slice(0, MAX_TEXT),
      }),
    );
    if (ok) setDraft('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const text = editing.text.trim();
    if (!text) return;
    const ok = await run(() => updateNote(groupId, editing.id, text.slice(0, MAX_TEXT)));
    if (ok) setEditing(null);
  };

  const remove = async (id: string) => {
    const ok = await run(() => deleteNote(groupId, id));
    if (ok) setConfirming(null);
  };

  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);

  return createPortal(
    <div
      className="sm note-dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className="sm__panel note-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-dialog-title"
      >
        <div className="sm__head">
          <p className="sm__head-title" id="note-dialog-title">
            Заметки · {TITLES[blockId]}
          </p>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body note-dialog__body">
          {sorted.length > 0 ? (
            <ul className="note-dialog__list">
              {sorted.map((note) => {
                const mine = note.authorId === me.uid;
                const canDelete = mine || me.isMaster;
                return (
                  <li className="note-dialog__item" key={note.id}>
                    <p className="note-dialog__meta">
                      <b>{note.authorName}</b>
                      <span>{ago(note.createdAt)}</span>
                    </p>
                    {editing?.id === note.id ? (
                      <div>
                        <textarea
                          className="sm__input note-dialog__input"
                          value={editing.text}
                          maxLength={MAX_TEXT}
                          rows={3}
                          aria-label="Изменить заметку"
                          onChange={(event) => setEditing({ id: note.id, text: event.target.value })}
                        />
                        <div className="note-dialog__actions">
                          <button
                            type="button"
                            className="sm__primary"
                            disabled={busy || !editing.text.trim()}
                            onClick={() => void saveEdit()}
                          >
                            Сохранить
                          </button>
                          <button type="button" className="sm__ghost" onClick={() => setEditing(null)}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="note-dialog__text">{note.text}</p>
                        {(mine || canDelete) && (
                          <div className="note-dialog__actions">
                            {mine && (
                              <button
                                type="button"
                                className="note-dialog__linkbtn"
                                onClick={() => setEditing({ id: note.id, text: note.text })}
                              >
                                Изменить
                              </button>
                            )}
                            {canDelete &&
                              (confirming === note.id ? (
                                <>
                                  <span className="note-dialog__confirm">Удалить?</span>
                                  <button
                                    type="button"
                                    className="note-dialog__linkbtn note-dialog__linkbtn--danger"
                                    disabled={busy}
                                    onClick={() => void remove(note.id)}
                                  >
                                    Да
                                  </button>
                                  <button
                                    type="button"
                                    className="note-dialog__linkbtn"
                                    onClick={() => setConfirming(null)}
                                  >
                                    Нет
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="note-dialog__linkbtn note-dialog__linkbtn--danger"
                                  onClick={() => setConfirming(note.id)}
                                >
                                  Удалить
                                </button>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="note-dialog__empty">
              Пока пусто. Заметка появится у всех за столом сразу.
            </p>
          )}

          <div className="note-dialog__composer">
            <label className="sm__label" htmlFor="note-draft">
              Новая заметка
            </label>
            <textarea
              ref={field}
              id="note-draft"
              className="sm__input note-dialog__input"
              value={draft}
              maxLength={MAX_TEXT}
              rows={3}
              placeholder="Что сказать по этому блоку…"
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="note-dialog__actions">
              <button
                type="button"
                className="sm__primary"
                disabled={busy || !draft.trim()}
                onClick={() => void submit()}
              >
                Оставить заметку
              </button>
              <button type="button" className="sm__ghost" onClick={onClose}>
                Закрыть
              </button>
            </div>
            {error && <p className="note-dialog__error">{error}</p>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
