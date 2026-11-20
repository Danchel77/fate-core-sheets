import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/app';
import { newId } from './storage';
import type { CharacterRecord, SettingId } from './types';

/**
 * Группа за столом.
 * users/{uid}/group — где я состою (одна группа на человека).
 * groups/{id} — название и мастер.
 * groups/{id}/members/{uid} — карточка героя, которую видит стол.
 * groupLinks/{token} — публичная ссылка-приглашение: только id группы и имя.
 */

export type Group = {
  id: string;
  name: string;
  masterId: string;
  inviteToken: string;
  createdAt: number;
};

export type GroupCard = {
  name: string;
  setting: SettingId;
  concept: string;
  level: number;
};

export type GroupMember = {
  uid: string;
  playerName: string;
  heroId: string | null;
  card: GroupCard | null;
  portrait: string | null;
  joinedAt: number;
};

export type GroupLink = { groupId: string; name: string; masterId: string };

export type GroupFeed =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'ready'; group: Group; members: GroupMember[] };

type UserLike = { uid: string; displayName?: string | null; email?: string | null };

function database() {
  if (!db) throw new Error('Firebase не настроен');
  return db;
}

const pointerRef = (uid: string) => doc(database(), 'users', uid, 'group');
const groupRef = (id: string) => doc(database(), 'groups', id);
const membersCol = (id: string) => collection(database(), 'groups', id, 'members');
const memberRef = (groupId: string, uid: string) =>
  doc(database(), 'groups', groupId, 'members', uid);
const linkRef = (token: string) => doc(database(), 'groupLinks', token);

function newToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
}

/** Имя за столом: из аккаунта, иначе — часть почты до «@». */
export function playerName(user: UserLike): string {
  const name = user.displayName?.trim();
  if (name) return name;
  const email = user.email ?? '';
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : 'Игрок';
}

function toGroup(id: string, data: Record<string, unknown>): Group | null {
  if (typeof data.name !== 'string' || typeof data.masterId !== 'string') return null;
  return {
    id,
    name: data.name,
    masterId: data.masterId,
    inviteToken: typeof data.inviteToken === 'string' ? data.inviteToken : '',
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
  };
}

function toMember(uid: string, data: Record<string, unknown>): GroupMember {
  const card = data.card as GroupCard | null | undefined;
  const validCard =
    card && typeof card === 'object' && typeof card.name === 'string'
      ? {
          name: card.name,
          setting: (card.setting === 'fate' ? 'fate' : 'witcher') as SettingId,
          concept: typeof card.concept === 'string' ? card.concept : '',
          level: typeof card.level === 'number' ? card.level : 1,
        }
      : null;
  return {
    uid,
    playerName: typeof data.playerName === 'string' ? data.playerName : 'Игрок',
    heroId: typeof data.heroId === 'string' ? data.heroId : null,
    card: validCard,
    portrait: typeof data.portrait === 'string' ? data.portrait : null,
    joinedAt: typeof data.joinedAt === 'number' ? data.joinedAt : 0,
  };
}

/** Слежение за своей группой. Пока группа не пришла — тишина, без пустого экрана. */
export function subscribeMyGroup(
  uid: string,
  next: (feed: GroupFeed) => void,
  onLost: () => void,
): () => void {
  let stopInner: (() => void) | null = null;
  let currentGroupId: string | null = null;

  const stop = () => {
    stopInner?.();
    stopInner = null;
    currentGroupId = null;
  };

  const dropPointer = () => {
    void deleteDoc(pointerRef(uid)).catch(() => undefined);
  };

  const watch = (groupId: string) => {
    currentGroupId = groupId;
    let group: Group | null = null;
    let members: GroupMember[] | null = null;
    let lost = false;

    const emit = () => {
      if (lost) return;
      if (!group || !members) return;
      next({ status: 'ready', group, members });
    };

    const lose = () => {
      if (lost) return;
      lost = true;
      stop();
      dropPointer();
      onLost();
    };

    const unsubGroup = onSnapshot(
      groupRef(groupId),
      (snapshot) => {
        if (!snapshot.exists()) {
          if (currentGroupId === groupId) lose();
          return;
        }
        group = toGroup(snapshot.id, snapshot.data());
        if (!group) {
          lose();
          return;
        }
        emit();
      },
      () => {
        if (currentGroupId === groupId) lose();
      },
    );

    const unsubMembers = onSnapshot(
      membersCol(groupId),
      (snapshot) => {
        const list = snapshot.docs.map((item) => toMember(item.id, item.data()));
        list.sort((a, b) => a.joinedAt - b.joinedAt);
        members = list;
        /* Меня убрали из группы: моей записи больше нет. */
        if (!list.some((member) => member.uid === uid)) {
          lose();
          return;
        }
        emit();
      },
      () => {
        if (currentGroupId === groupId) lose();
      },
    );

    stopInner = () => {
      unsubGroup();
      unsubMembers();
    };
  };

  const unsubPointer = onSnapshot(
    pointerRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        stop();
        next({ status: 'none' });
        return;
      }
      const groupId = snapshot.data().groupId;
      if (typeof groupId !== 'string' || !groupId) {
        stop();
        next({ status: 'none' });
        return;
      }
      if (groupId === currentGroupId) return;
      stop();
      next({ status: 'loading' });
      watch(groupId);
    },
    () => {
      next({ status: 'none' });
    },
  );

  return () => {
    stop();
    unsubPointer();
  };
}

/** Ссылка-приглашение: открывается кем угодно, данных героев в ней нет. */
export async function readGroupLink(token: string): Promise<GroupLink | null> {
  try {
    const snapshot = await getDoc(linkRef(token));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (typeof data.groupId !== 'string' || typeof data.name !== 'string') return null;
    return {
      groupId: data.groupId,
      name: data.name,
      masterId: typeof data.masterId === 'string' ? data.masterId : '',
    };
  } catch {
    return null;
  }
}

/** Новая группа: мастер — создатель; сразу же его пустая карточка за столом. */
export async function createGroup(user: UserLike, name: string): Promise<string> {
  const groupId = newId();
  const token = newToken();
  const now = Date.now();

  await setDoc(groupRef(groupId), {
    name,
    masterId: user.uid,
    inviteToken: token,
    createdAt: now,
  });

  const batch = writeBatch(database());
  batch.set(linkRef(token), { groupId, name, masterId: user.uid });
  batch.set(memberRef(groupId, user.uid), {
    playerName: playerName(user),
    heroId: null,
    card: null,
    portrait: null,
    joinedAt: now,
  });
  batch.set(pointerRef(user.uid), { groupId, heroId: null });
  await batch.commit();
  return groupId;
}

/** Вход по ссылке: меняем только своё место за столом. */
export async function joinGroup(user: UserLike, link: GroupLink): Promise<void> {
  const batch = writeBatch(database());
  batch.set(
    memberRef(link.groupId, user.uid),
    {
      playerName: playerName(user),
      heroId: null,
      card: null,
      portrait: null,
      joinedAt: Date.now(),
    },
    { merge: true },
  );
  batch.set(pointerRef(user.uid), { groupId: link.groupId, heroId: null }, { merge: true });
  await batch.commit();
}

/** Выйти: сначала указатель (экран сразу чистый), потом место за столом. */
export async function leaveGroup(uid: string, groupId: string): Promise<void> {
  await deleteDoc(pointerRef(uid));
  await deleteDoc(memberRef(groupId, uid));
}

/** Мастер убирает игрока: его указатель подчистит его же браузер. */
export async function removeMember(groupId: string, memberUid: string): Promise<void> {
  await deleteDoc(memberRef(groupId, memberUid));
}

/** Мастер закрывает группу: стол, места, приглашение. */
export async function closeGroup(group: Group): Promise<void> {
  const snapshot = await getDocs(membersCol(group.id));
  const batch = writeBatch(database());
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  batch.delete(groupRef(group.id));
  if (group.inviteToken) batch.delete(linkRef(group.inviteToken));
  await batch.commit();
  await deleteDoc(pointerRef(group.masterId)).catch(() => undefined);
}

/** Карточка для стола: миниатюра портрета, чтобы чужие листы не читать целиком. */
async function makePortraitThumb(portrait: string): Promise<string | null> {
  if (!portrait || typeof document === 'undefined') return null;
  try {
    const image = new Image();
    image.src = portrait;
    await image.decode();
    const width = 192;
    const height = 236;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(
      image,
      (image.naturalWidth - sourceWidth) / 2,
      (image.naturalHeight - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );
    const url = canvas.toDataURL('image/jpeg', 0.82);
    return url.length <= 60000 ? url : null;
  } catch {
    return null;
  }
}

function cardFrom(record: CharacterRecord): GroupCard {
  return {
    name: record.sheet.name.trim() || 'Безымянный герой',
    setting: record.setting,
    concept: record.sheet.aspects[0]?.text ?? '',
    level: record.sheet.level,
  };
}

/** Привязать или сменить своего героя. Портрет переносим уменьшенной копией. */
export async function setMyHero(
  uid: string,
  groupId: string,
  record: CharacterRecord | null,
): Promise<void> {
  const portrait = record ? await makePortraitThumb(record.sheet.portrait) : null;
  const batch = writeBatch(database());
  batch.update(memberRef(groupId, uid), {
    heroId: record?.id ?? null,
    card: record ? cardFrom(record) : null,
    portrait,
  });
  batch.update(pointerRef(uid), { heroId: record?.id ?? null });
  await batch.commit();
}

/* Карточка за столом подтягивается, пока лист правят: в облако пишется
   только текст, портрет — при привязке героя. */
type Membership = { uid: string; groupId: string; heroId: string | null };

let membership: Membership | null = null;

export function rememberMembership(value: Membership | null): void {
  membership = value;
}

/** Если страница группы не открыта, место за столом добираем из указателя. */
async function ensureMembership(uid: string): Promise<Membership | null> {
  if (membership?.uid === uid) return membership;
  try {
    const snapshot = await getDoc(pointerRef(uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (typeof data.groupId !== 'string' || !data.groupId) return null;
    membership = {
      uid,
      groupId: data.groupId,
      heroId: typeof data.heroId === 'string' ? data.heroId : null,
    };
    return membership;
  } catch {
    return null;
  }
}

export async function syncGroupCard(uid: string, record: CharacterRecord): Promise<void> {
  const known = await ensureMembership(uid);
  if (!known || known.heroId !== record.id) return;
  try {
    await updateDoc(memberRef(known.groupId, uid), { card: cardFrom(record) });
  } catch {
    /* без сети карточка догонит в следующий раз */
  }
}

/** Героя удалили: со стола убираем только карточку, место игрока остаётся. */
export async function clearAttachedHero(uid: string, heroId: string): Promise<void> {
  const known = await ensureMembership(uid);
  if (!known || known.heroId !== heroId) return;
  try {
    await setMyHero(uid, known.groupId, null);
  } catch {
    /* группа уже закрыта или игрока убрали */
  }
}

export function inviteLink(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/g/${token}`;
}

/** Из вставленной ссылки достаём код; голый код тоже принимаем. */
export function parseInviteToken(text: string): string | null {
  const value = text.trim();
  if (!value) return null;
  const fromLink = /#\/g\/([^/\s?#]+)/.exec(value);
  if (fromLink) return decodeURIComponent(fromLink[1]);
  if (/^[a-z0-9]{8,64}$/i.test(value)) return value;
  return null;
}
