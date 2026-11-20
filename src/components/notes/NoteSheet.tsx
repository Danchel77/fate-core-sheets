import { useEffect, useRef, useState } from 'react';
import {
  addNote,
  deleteNote,
  updateNote,
  type BlockId,
  type GroupNote,
} from '../../data/groups';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useDialogKeys } from '../../hooks/useDialogKeys';

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

  return (
    <div className="note-sheet">
      <button
        type="button"
        className="note-sheet__scrim"
        aria-label="Закрыть заметки"
        onClick={onClose}
      />
      <div
        ref={panel}
        className="note-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-sheet-title"
      >
        <header className="note-sheet__head">
          <div>
            <p className="note-sheet__eyebrow">Заметки к блоку</p>
            <h2 className="note-sheet__title" id="note-sheet-title">
              {TITLES[blockId]}
            </h2>
          </div>
          <button type="button" className="note-sheet__close" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </header>

        {sorted.length > 0 ? (
          <ul className="note-sheet__list">
            {sorted.map((note) => {
              const mine = note.authorId === me.uid;
              const canDelete = mine || me.isMaster;
              return (
                <li className="note-sheet__note" key={note.id}>
                  <p className="note-sheet__meta">
                    <b>{note.authorName}</b>
                    <span>{ago(note.createdAt)}</span>
                  </p>
                  {editing?.id === note.id ? (
                    <div className="note-sheet__editor">
                      <textarea
                        className="note-sheet__input"
                        value={editing.text}
                        maxLength={MAX_TEXT}
                        rows={3}
                        onChange={(event) => setEditing({ id: note.id, text: event.target.value })}
                      />
                      <div className="note-sheet__row">
                        <button
                          type="button"
                          className="note-sheet__btn note-sheet__btn--primary"
                          disabled={busy || !editing.text.trim()}
                          onClick={() => void saveEdit()}
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          className="note-sheet__btn"
                          onClick={() => setEditing(null)}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="note-sheet__text">{note.text}</p>
                      {(mine || canDelete) && (
                        <div className="note-sheet__row">
                          {mine && (
                            <button
                              type="button"
                              className="note-sheet__linkbtn"
                              onClick={() => setEditing({ id: note.id, text: note.text })}
                            >
                              Изменить
                            </button>
                          )}
                          {canDelete &&
                            (confirming === note.id ? (
                              <>
                                <span className="note-sheet__confirm">Удалить?</span>
                                <button
                                  type="button"
                                  className="note-sheet__linkbtn note-sheet__linkbtn--danger"
                                  disabled={busy}
                                  onClick={() => void remove(note.id)}
                                >
                                  Да
                                </button>
                                <button
                                  type="button"
                                  className="note-sheet__linkbtn"
                                  onClick={() => setConfirming(null)}
                                >
                                  Нет
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="note-sheet__linkbtn note-sheet__linkbtn--danger"
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
          <p className="note-sheet__empty">
            Пока пусто. Заметка появится у всех за столом сразу.
          </p>
        )}

        <div className="note-sheet__composer">
          <textarea
            ref={field}
            className="note-sheet__input"
            value={draft}
            maxLength={MAX_TEXT}
            rows={3}
            placeholder="Что сказать по этому блоку?"
            aria-label="Новая заметка"
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="note-sheet__row">
            <button
              type="button"
              className="note-sheet__btn note-sheet__btn--primary"
              disabled={busy || !draft.trim()}
              onClick={() => void submit()}
            >
              Оставить заметку
            </button>
            <button type="button" className="note-sheet__btn" onClick={onClose}>
              Закрыть
            </button>
          </div>
          {error && <p className="note-sheet__error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
