import { useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { useAuth } from '../firebase/authStore';
import { useCharacters } from '../data/store';
import {
  createGroup,
  joinGroup,
  MAX_GROUPS,
  parseInviteToken,
  readGroupLink,
  setMyHero,
  type Group,
  type GroupRef,
} from '../data/groups';
import { IconClose } from './icons';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

type ShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

/** Общая оболочка трёх окон группы: шапка с крестиком, тело, подвал. */
function GroupModal({ title, onClose, children, footer }: ShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useBodyScrollLock();
  useDialogKeys({ panel: panelRef, onClose, trap: true });

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="sm" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className="sm__panel sm__panel--confirm"
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
        <div className="sm__body">{children}</div>
        <footer className="sm__footer">{footer}</footer>
      </div>
    </div>,
    document.body,
  );
}

/** Новая группа: только название. */
export function CreateGroupDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (id: string, name: string) => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const clean = name.trim();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clean || !user || busy) return;
    setBusy(true);
    setError(null);
    try {
      const id = await createGroup(user, clean);
      onCreated?.(id, clean);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error && error.message === 'GROUP_LIMIT'
          ? `В одном аккаунте можно быть в ${MAX_GROUPS} группах. Покиньте одну, чтобы создать новую.`
          : 'Не получилось создать группу. Проверьте связь и попробуйте ещё раз.',
      );
      setBusy(false);
    }
  };

  return (
    <GroupModal
      title="Новая группа"
      onClose={onClose}
      footer={
        <div className="sm__actions">
          <button type="button" className="sm__ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" form={fieldId} className="sm__primary" disabled={!clean || busy}>
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </div>
      }
    >
      <form id={fieldId} className="sm__form" onSubmit={submit}>
        <div className="sm__field">
          <label className="sm__label" htmlFor={`${fieldId}-name`}>
            Название группы
          </label>
          <input
            id={`${fieldId}-name`}
            className="sm__input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Проклятые земли"
            maxLength={40}
            autoComplete="off"
            autoFocus
          />
        </div>
        {error && <p className="sm__note sm__note--warn">{error}</p>}
      </form>
    </GroupModal>
  );
}

/** Вход по ссылке-приглашению: добавляем группу к своим. */
export function JoinLinkDialog({
  groups,
  onClose,
  onJoined,
}: {
  groups: GroupRef[];
  onClose: () => void;
  onJoined?: (id: string, name: string) => void;
}) {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !user) return;
    const token = parseInviteToken(value);
    if (!token) {
      setError('Это не похоже на ссылку-приглашение. Вставьте её целиком.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const link = await readGroupLink(token);
      if (!link) {
        setError('Приглашение не найдено. Проверьте, что мастер его не отозвал.');
        setBusy(false);
        return;
      }
      if (groups.some((item) => item.id === link.groupId)) {
        onJoined?.(link.groupId, link.name);
        onClose();
        return;
      }
      await joinGroup(user, link);
      onJoined?.(link.groupId, link.name);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error && error.message === 'GROUP_LIMIT'
          ? `В одном аккаунте можно быть в ${MAX_GROUPS} группах. Покиньте одну, чтобы вступить в новую.`
          : 'Не получилось присоединиться. Проверьте связь и попробуйте ещё раз.',
      );
      setBusy(false);
    }
  };

  return (
    <GroupModal
      title="Присоединиться"
      onClose={onClose}
      footer={
        <div className="sm__actions">
          <button type="button" className="sm__ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" form={fieldId} className="sm__primary" disabled={busy || !value.trim()}>
            {busy ? 'Проверяем…' : 'Присоединиться'}
          </button>
        </div>
      }
    >
      <form id={fieldId} className="sm__form" onSubmit={submit}>
        <div className="sm__field">
          <label className="sm__label" htmlFor={`${fieldId}-link`}>
            Ссылка-приглашение
          </label>
          <input
            id={`${fieldId}-link`}
            className="sm__input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Вставьте ссылку от мастера"
            autoComplete="off"
            autoFocus
          />
        </div>
        {error && <p className="sm__note sm__note--warn">{error}</p>}
      </form>
    </GroupModal>
  );
}

/** Выбор героя: свой лист, «Мастер игры» (мастеру) или «без героя». */
export function HeroPickerDialog({
  group,
  isMaster,
  currentHeroId,
  gameMaster,
  onClose,
}: {
  group: Group;
  isMaster: boolean;
  currentHeroId: string | null;
  gameMaster: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { records } = useCharacters();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (id: string | null, gm = false) => {
    if (!user || busyId) return;
    setBusyId(id ?? (gm ? 'gm' : 'none'));
    setError(null);
    try {
      const record = id ? records.find((item) => item.id === id) ?? null : null;
      await setMyHero(user.uid, group.id, record, gm);
      onClose();
    } catch {
      setError('Не получилось поставить героя за стол. Попробуйте ещё раз.');
      setBusyId(null);
    }
  };

  return (
    <GroupModal
      title="Герой за столом"
      onClose={onClose}
      footer={
        <div className="sm__actions">
          <button type="button" className="sm__ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      }
    >
      <div className="pick">
        {isMaster && (
          <button
            type="button"
            className={`pick__row pick__row--gm${!currentHeroId && gameMaster ? ' is-active' : ''}`}
            onClick={() => void choose(null, true)}
            disabled={busyId !== null}
          >
            <span className="pick__gm-mark" aria-hidden="true" />
            <span className="pick__body">
              <span className="pick__name">Мастер игры</span>
            </span>
          </button>
        )}
        <button
          type="button"
          className={`pick__row pick__row--none${!currentHeroId && !gameMaster ? ' is-active' : ''}`}
          onClick={() => void choose(null)}
          disabled={busyId !== null}
        >
          <span className="pick__none-mark" aria-hidden="true">
            —
          </span>
          <span className="pick__body">
            <span className="pick__name">Без героя</span>
          </span>
        </button>

        {records.map((record) => {
          const active = record.id === currentHeroId;
          return (
            <button
              key={record.id}
              type="button"
              className={`pick__row${active ? ' is-active' : ''}`}
              onClick={() => void choose(record.id)}
              disabled={busyId !== null}
            >
              <span className={`pick__photo${record.sheet.portrait ? '' : ' pick__photo--empty'}`}>
                {record.sheet.portrait ? (
                  <img src={record.sheet.portrait} alt="" />
                ) : (
                  <svg viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="23" r="11.5" />
                    <path d="M32 38c-11.4 0-19.6 7.4-21.6 18.4-.2 1.2.8 2.2 2 2.2h39.2c1.2 0 2.2-1 2-2.2C51.6 45.4 43.4 38 32 38Z" />
                  </svg>
                )}
              </span>
              <span className="pick__body">
                <span className="pick__name">{record.sheet.name.trim() || 'Безымянный герой'}</span>
                <span className="pick__concept">{record.sheet.aspects[0]?.text || 'Без концепции'}</span>
                {active && <span className="pick__mark">За столом</span>}
              </span>
            </button>
          );
        })}
      </div>

      {records.length === 0 && (
        <p className="sm__note">
          Своих героев пока нет. <a href="#/new">Создайте героя</a> — и возвращайтесь.
        </p>
      )}
      {error && <p className="sm__note sm__note--warn">{error}</p>}
      <p className="sm__note">Героя можно менять в любой момент.</p>
    </GroupModal>
  );
}
