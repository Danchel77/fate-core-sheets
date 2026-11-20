import { useMemo, useRef, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { BlockMenu } from '../components/BlockMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CreateGroupDialog, HeroPickerDialog, JoinLinkDialog } from '../components/GroupDialogs';
import { ListTabs } from '../components/ListTabs';
import { LoadingMark } from '../components/LoadingMark';
import { SettingMark } from '../components/SettingMark';
import { IconLink, IconTrash } from '../components/icons';
import { useGroup } from '../hooks/useGroup';
import { useCharacters } from '../data/store';
import { openAuthDialog, useAuth } from '../firebase/authStore';
import {
  closeGroup,
  inviteLink,
  leaveGroup,
  removeMember,
  type Group,
  type GroupMember,
} from '../data/groups';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

/** Портрет из миниатюры группы; если его нет — та же фигура, что в списке. */
function MemberPhoto({ member }: { member: GroupMember }) {
  return (
    <span className={`hero-photo${member.portrait ? '' : ' hero-photo--empty'}`}>
      {member.portrait ? (
        <img src={member.portrait} alt="" />
      ) : (
        <svg className="hero-photo__figure" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="23" r="11.5" />
          <path d="M32 38c-11.4 0-19.6 7.4-21.6 18.4-.2 1.2.8 2.2 2 2.2h39.2c1.2 0 2.2-1 2-2.2C51.6 45.4 43.4 38 32 38Z" />
        </svg>
      )}
    </span>
  );
}

/** Карточка игрока без героя: за столом он есть, листа ещё нет. */
function GhostCard({
  member,
  canRemove,
  onRemove,
}: {
  member: GroupMember;
  canRemove: boolean;
  onRemove: (member: GroupMember) => void;
}) {
  return (
    <article className="hero-card">
      <div className="hero-card__link">
        <MemberPhoto member={member} />
        <span className="hero-card__body">
          <span className="hero-card__name">{member.playerName}</span>
          <span className="hero-card__rule" />
          <span className="hero-card__concept">Герой не выбран</span>
          <span className="hero-card__level">без героя</span>
        </span>
      </div>
      {canRemove && (
        <BlockMenu
          label="Действия с игроком"
          items={[
            {
              label: 'Убрать игрока',
              icon: <IconTrash />,
              danger: true,
              onSelect: () => onRemove(member),
            },
          ]}
        />
      )}
    </article>
  );
}

/** Карточка героя — те же экслибрисы, что в списке, без ссылки на чужой лист. */
function HeroCard({
  member,
  canRemove,
  onRemove,
}: {
  member: GroupMember;
  canRemove: boolean;
  onRemove: (member: GroupMember) => void;
}) {
  const card = member.card;
  if (!card) return null;
  return (
    <article className="hero-card">
      <div className="hero-card__link">
        <MemberPhoto member={member} />
        <span className="hero-card__body">
          <span className="hero-card__name">{card.name}</span>
          <span className="hero-card__rule" />
          <span className="hero-card__concept">{card.concept || 'Без концепции'}</span>
          <span className="hero-card__level">
            уровень <b>{card.level}</b>
          </span>
        </span>
        <SettingMark setting={card.setting} />
      </div>
      {canRemove && (
        <BlockMenu
          label="Действия с игроком"
          items={[
            {
              label: 'Убрать игрока',
              icon: <IconTrash />,
              danger: true,
              onSelect: () => onRemove(member),
            },
          ]}
        />
      )}
    </article>
  );
}

export default function GroupScreen() {
  const { ready: authReady, user } = useAuth();
  const { records } = useCharacters();
  const { feed, lost } = useGroup(user?.uid ?? null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<GroupMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const group: Group | null = feed.status === 'ready' ? feed.group : null;
  const members = feed.status === 'ready' ? feed.members : [];
  const me = user ? members.find((member) => member.uid === user.uid) : undefined;
  const isMaster = !!group && !!user && group.masterId === user.uid;
  const ordered = useMemo(
    () => [...members].sort((a, b) => Number(b.uid === group?.masterId) - Number(a.uid === group?.masterId)),
    [members, group?.masterId],
  );

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const copyInvite = async () => {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(inviteLink(group.inviteToken));
      showToast('Ссылка-приглашение скопирована');
    } catch {
      showToast('Не удалось скопировать ссылку');
    }
  };

  const confirmLeave = async () => {
    if (!user || !group || busy) return;
    setBusy(true);
    try {
      await leaveGroup(user.uid, group.id);
      setLeaveOpen(false);
      showToast('Вы вышли из группы');
    } finally {
      setBusy(false);
    }
  };

  const confirmClose = async () => {
    if (!group || !user || busy) return;
    setBusy(true);
    try {
      await closeGroup(group);
      setCloseOpen(false);
      showToast('Группа закрыта');
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget || busy) return;
    setBusy(true);
    try {
      await removeMember(group?.id ?? '', removeTarget.uid);
      setRemoveTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const groupActions = group && user && (
    <div className="group__actions">
      <button type="button" className="group__invite" onClick={() => void copyInvite()}>
        <IconLink />
        Пригласить
      </button>
      <button type="button" className="group__hero" onClick={() => setPickerOpen(true)}>
        {me?.heroId ? 'Поменять персонажа' : 'Добавить персонажа'}
      </button>
      <div className="group__more">
        <BlockMenu
          label="Управление группой"
          items={
            isMaster
              ? [
                  {
                    label: 'Закрыть группу',
                    icon: <IconTrash />,
                    danger: true,
                    onSelect: () => setCloseOpen(true),
                  },
                ]
              : [
                  {
                    label: 'Покинуть группу',
                    icon: <IconTrash />,
                    danger: true,
                    onSelect: () => setLeaveOpen(true),
                  },
                ]
          }
        />
      </div>
    </div>
  );

  return (
    <div className="heroes group" style={{ '--sheet-texture': PAPER_TEXTURE } as React.CSSProperties}>
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <AccountButton />
      </header>

      <main className="heroes__page">
        <header className="heroes__head">
          <div className="heroes__lead">
            <ListTabs active="group" count={records.length} />
            {group && <p className="heroes__groupname">{group.name}</p>}
          </div>
          {groupActions}
        </header>

        {!authReady ? (
          <div className="group__loading">
            <LoadingMark />
          </div>
        ) : !user ? (
          <section className="heroes__empty">
            <h2 className="heroes__empty-title">Группа за столом</h2>
            <p className="heroes__empty-text">
              Войдите, чтобы собрать игроков и пригласить их ссылкой.
            </p>
            <div className="heroes__empty-actions">
              <button
                className="heroes__empty-action"
                type="button"
                onClick={openAuthDialog}
              >
                Войти
              </button>
            </div>
          </section>
        ) : feed.status === 'loading' ? (
          <div className="group__loading">
            <LoadingMark />
          </div>
        ) : !group ? (
          <>
            {lost && (
              <p className="heroes__note" role="status">
                Вы больше не участник этой группы.
              </p>
            )}
            <section className="heroes__empty">
              <h2 className="heroes__empty-title">Соберите героев за одним столом</h2>
              <p className="heroes__empty-text">
                Создайте группу или присоединитесь по ссылке от мастера.
              </p>
              <div className="heroes__empty-actions">
                <button
                  className="heroes__empty-action"
                  type="button"
                  onClick={() => setCreateOpen(true)}
                >
                  Создать группу
                </button>
                <button
                  className="heroes__empty-action heroes__empty-action--ghost"
                  type="button"
                  onClick={() => setJoinOpen(true)}
                >
                  Присоединиться по ссылке
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="group__grid heroes__grid">
            {ordered.map((member) => (
              <div className="group__item" key={member.uid}>
                {member.card ? (
                  <HeroCard
                    member={member}
                    canRemove={isMaster && member.uid !== user.uid}
                    onRemove={setRemoveTarget}
                  />
                ) : (
                  <GhostCard
                    member={member}
                    canRemove={isMaster && member.uid !== user.uid}
                    onRemove={setRemoveTarget}
                  />
                )}
                <p className="group__owner">
                  {member.uid === group.masterId ? 'Мастер' : 'Игрок'}:{' '}
                  <b>
                    {member.playerName}
                    {member.uid === user.uid && ' (вы)'}
                  </b>
                </p>
              </div>
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

      {createOpen && <CreateGroupDialog onClose={() => setCreateOpen(false)} />}
      {joinOpen && (
        <JoinLinkDialog
          current={group}
          onClose={() => setJoinOpen(false)}
          onJoined={(name) => showToast(`Вы в группе «${name}»`)}
        />
      )}
      {pickerOpen && group && user && (
        <HeroPickerDialog
          group={group}
          currentHeroId={me?.heroId ?? null}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {leaveOpen && (
        <ConfirmDialog
          title="Покинуть группу?"
          text="Ваша карточка исчезнет со стола. Вернуться можно по новой ссылке от мастера."
          confirmLabel="Покинуть"
          onConfirm={() => void confirmLeave()}
          onClose={() => setLeaveOpen(false)}
        />
      )}
      {closeOpen && (
        <ConfirmDialog
          title="Закрыть группу?"
          text="Все игроки выйдут из группы, а ссылка-приглашение перестанет работать."
          confirmLabel="Закрыть группу"
          onConfirm={() => void confirmClose()}
          onClose={() => setCloseOpen(false)}
        />
      )}
      {removeTarget && (
        <ConfirmDialog
          title="Убрать игрока?"
          text={`${removeTarget.playerName} исчезнет из группы вместе со своей карточкой.`}
          confirmLabel="Убрать"
          onConfirm={() => void confirmRemove()}
          onClose={() => setRemoveTarget(null)}
        />
      )}

      {toast && (
        <div className="sheet-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
