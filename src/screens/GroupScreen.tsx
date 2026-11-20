import { useMemo, useRef, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { BlockMenu } from '../components/BlockMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CreateGroupDialog, HeroPickerDialog, JoinLinkDialog } from '../components/GroupDialogs';
import { ListTabs } from '../components/ListTabs';
import { LoadingMark } from '../components/LoadingMark';
import { SettingMark } from '../components/SettingMark';
import { IconLink, IconTrash } from '../components/icons';
import { useGroups } from '../hooks/useGroup';
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
  mine,
  onPick,
  canRemove,
  onRemove,
}: {
  member: GroupMember;
  mine: boolean;
  onPick: () => void;
  canRemove: boolean;
  onRemove: (member: GroupMember) => void;
}) {
  const body = (
    <>
      <MemberPhoto member={member} />
      <span className="hero-card__body">
        <span className="hero-card__name">{member.playerName}</span>
        <span className="hero-card__rule" />
        <span className="hero-card__concept">Герой не выбран</span>
      </span>
    </>
  );
  return (
    <article className="hero-card">
      {mine ? (
        <button
          type="button"
          className="hero-card__link hero-card__link--button"
          onClick={onPick}
        >
          {body}
        </button>
      ) : (
        <div className="hero-card__link">{body}</div>
      )}
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

/** Карточка мастера без листа героя. */
function MasterCard({
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
          <span className="hero-card__concept">Мастер игры</span>
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

/** Карточка героя — те же экслибрисы, что в списке. Свой лист открывается. */
function HeroCard({
  member,
  mine,
  canRemove,
  onRemove,
}: {
  member: GroupMember;
  mine: boolean;
  canRemove: boolean;
  onRemove: (member: GroupMember) => void;
}) {
  const card = member.card;
  if (!card) return null;
  const body = (
    <>
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
    </>
  );
  return (
    <article className="hero-card">
      {mine && member.heroId ? (
        <a className="hero-card__link" href={`#/hero/${member.heroId}`}>
          {body}
        </a>
      ) : (
        <div className="hero-card__link">{body}</div>
      )}
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

function GroupHead({
  records,
  group,
  refs,
  activeId,
  onSwitch,
  onInvite,
  onPickHero,
  isMaster,
  hasSeat,
  onCloseGroup,
  onLeave,
  onCreateGroup,
  onJoin,
}: {
  records: number;
  group: Group | null;
  refs: { id: string; name: string }[];
  activeId: string | null;
  onSwitch: (id: string) => void;
  onInvite: () => void;
  onPickHero: () => void;
  isMaster: boolean;
  hasSeat: boolean;
  onCloseGroup: () => void;
  onLeave: () => void;
  onCreateGroup: () => void;
  onJoin: () => void;
}) {
  return (
    <header className="heroes__head">
      <div className="heroes__lead">
        <ListTabs active="group" count={records} />
        {refs.length > 0 && (
          <div className="group__switch" role="tablist" aria-label="Мои группы">
            {refs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeId}
                className={`group__switch-item${item.id === activeId ? ' is-active' : ''}`}
                onClick={() => onSwitch(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {group && (
        <div className="group__actions">
          <button type="button" className="group__invite" onClick={onInvite}>
            <IconLink />
            Пригласить
          </button>
          <button type="button" className="group__hero" onClick={onPickHero}>
            {hasSeat ? 'Поменять персонажа' : 'Добавить персонажа'}
          </button>
          <div className="group__more">
            <BlockMenu
              label="Управление группой"
              items={[
                { label: 'Создать группу', onSelect: onCreateGroup },
                { label: 'Присоединиться по ссылке', onSelect: onJoin },
                isMaster
                  ? {
                      label: 'Закрыть группу',
                      icon: <IconTrash />,
                      danger: true,
                      onSelect: onCloseGroup,
                    }
                  : {
                      label: 'Покинуть группу',
                      icon: <IconTrash />,
                      danger: true,
                      onSelect: onLeave,
                    },
              ]}
            />
          </div>
        </div>
      )}
    </header>
  );
}

export default function GroupScreen() {
  const { ready: authReady, user } = useAuth();
  const { records } = useCharacters();
  const { refs, feed, lost, evicted, activeId, setActiveId } = useGroups(user?.uid ?? null);
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
    () =>
      [...members].sort(
        (a, b) => Number(b.uid === group?.masterId) - Number(a.uid === group?.masterId),
      ),
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

  const hasSeat = !!me && (!!me.heroId || me.gameMaster);

  return (
    <div
      className="heroes group"
      style={{ '--sheet-texture': PAPER_TEXTURE } as React.CSSProperties}
    >
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <AccountButton />
      </header>

      <main className="heroes__page">
        <GroupHead
          records={records.length}
          group={group}
          refs={refs ?? []}
          activeId={activeId}
          onSwitch={setActiveId}
          onInvite={() => void copyInvite()}
          onPickHero={() => setPickerOpen(true)}
          isMaster={isMaster}
          hasSeat={hasSeat}
          onCloseGroup={() => setCloseOpen(true)}
          onLeave={() => setLeaveOpen(true)}
          onCreateGroup={() => setCreateOpen(true)}
          onJoin={() => setJoinOpen(true)}
        />

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
              <button className="heroes__empty-action" type="button" onClick={openAuthDialog}>
                Войти
              </button>
            </div>
          </section>
        ) : refs === null || (refs.length > 0 && !group) ? (
          <div className="group__loading">
            <LoadingMark />
          </div>
        ) : !group ? (
          <>
            {(lost || evicted) && (
              <p className="heroes__note" role="status">
                {lost
                  ? 'Не получилось загрузить группы. Проверьте связь и обновите страницу.'
                  : 'Эта группа закрыта или вас из неё убрали.'}
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
                    mine={member.uid === user.uid}
                    canRemove={isMaster && member.uid !== user.uid}
                    onRemove={setRemoveTarget}
                  />
                ) : member.gameMaster ? (
                  <MasterCard
                    member={member}
                    canRemove={isMaster && member.uid !== user.uid}
                    onRemove={setRemoveTarget}
                  />
                ) : (
                  <GhostCard
                    member={member}
                    mine={member.uid === user.uid}
                    onPick={() => setPickerOpen(true)}
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

      {createOpen && (
        <CreateGroupDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(id, name) => {
            setActiveId(id);
            showToast(`Группа «${name}» создана`);
          }}
        />
      )}
      {joinOpen && (
        <JoinLinkDialog
          groups={refs ?? []}
          onClose={() => setJoinOpen(false)}
          onJoined={(id, name) => {
            setActiveId(id);
            showToast(`Вы в группе «${name}»`);
          }}
        />
      )}
      {pickerOpen && group && user && (
        <HeroPickerDialog
          group={group}
          isMaster={isMaster}
          currentHeroId={me?.heroId ?? null}
          gameMaster={me?.gameMaster ?? false}
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
