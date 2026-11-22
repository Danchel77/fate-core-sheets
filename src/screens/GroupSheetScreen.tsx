import { useEffect, useMemo, useState } from 'react';
import { NoteSheet } from '../components/notes/NoteSheet';
import { NotesProvider, type NotePeek, type NotesApi } from '../components/notes/NotesContext';
import { useGroups } from '../hooks/useGroup';
import { playerName, subscribeNotes, type BlockId, type GroupNote } from '../data/groups';
import { useAuth } from '../firebase/authStore';
import type { CharacterRecord } from '../data/types';
import SheetScreen from './SheetScreen';

type Props = { memberUid: string };

/** Чужой лист из группы: только чтение и заметки на блоки. */
export default function GroupSheetScreen({ memberUid }: Props) {
  const { ready: authReady, user } = useAuth();
  const { feed } = useGroups(user?.uid ?? null);
  const [notes, setNotes] = useState<GroupNote[]>([]);
  const [openId, setOpenId] = useState<BlockId | null>(null);

  const group = feed.group;
  const member = feed.members.find((item) => item.uid === memberUid) ?? null;

  /* Свой лист открываем в обычном редакторе — здесь только чужие. */
  useEffect(() => {
    if (user && member && member.uid === user.uid && member.heroId) {
      window.location.hash = `#/hero/${encodeURIComponent(member.heroId)}`;
    }
  }, [member, user]);

  useEffect(() => {
    if (!group || !member?.heroId) {
      setNotes([]);
      return;
    }
    return subscribeNotes(group.id, member.heroId, setNotes, () => setNotes([]));
  }, [group, member?.heroId]);

  const byBlock = useMemo(() => {
    const map = new Map<BlockId, GroupNote[]>();
    notes.forEach((note) => {
      const list = map.get(note.blockId) ?? [];
      list.push(note);
      map.set(note.blockId, list);
    });
    return map;
  }, [notes]);

  const api: NotesApi = useMemo(
    () => ({
      peek: (blockId: BlockId): NotePeek | null => {
        const list = byBlock.get(blockId);
        if (!list?.length) return null;
        const last = [...list].sort((a, b) => b.createdAt - a.createdAt)[0];
        return {
          count: list.length,
          author: last.authorName,
          text: last.text.length > 90 ? `${last.text.slice(0, 90)}…` : last.text,
        };
      },
      open: (blockId: BlockId) => setOpenId(blockId),
    }),
    [byBlock],
  );

  const isMaster = Boolean(group && user && group.masterId === user.uid);

  /* Экспорт чужого листа: файл собирается из того же снимка, что видит мастер.
     Своей записи в хранилище здесь нет, поэтому даём SheetScreen готовую запись.
     Портрет в снимке намеренно пустой — подставляем миниатюру из карточки. */
  const character = useMemo(() => {
    if (!member?.sheet) return null;
    return {
      ...member.sheet,
      portrait: member.sheet.portrait || member.portrait || '',
    };
  }, [member?.sheet, member?.portrait]);

  const record = useMemo<CharacterRecord | null>(() => {
    if (!character || !member?.setting) return null;
    return {
      id: member.heroId ?? member.uid,
      setting: member.setting,
      createdAt: '',
      updatedAt: '',
      sheet: character,
    };
  }, [character, member?.heroId, member?.setting, member?.uid]);

  if (!authReady || !user) {
    return (
      <div className="table group-sheet" data-theme="witcher">
        <div className="group-sheet__fallback">
          <p>{authReady ? 'Войдите, чтобы открыть лист игрока.' : 'Открываем лист…'}</p>
        </div>
      </div>
    );
  }

  if (!character || !member?.setting) {
    return (
      <div className="table group-sheet" data-theme="witcher">
        <div className="group-sheet__fallback">
          <p>Игрок или его герой больше не за столом.</p>
          <a className="group-sheet__back" href="#/group">
            Вернуться в группу
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotesProvider api={api}>
        <SheetScreen
          character={character}
          setting={member.setting}
          record={record ?? undefined}
          readOnly
          back={{ href: '#/group', label: 'Группа за столом', short: 'Группа' }}
          header={
            <span className="group-sheet__who">
              Лист игрока · {member.playerName}
            </span>
          }
        />
      </NotesProvider>
      {openId && group && user && (
        <NoteSheet
          groupId={group.id}
          heroId={member.heroId ?? ''}
          blockId={openId}
          notes={byBlock.get(openId) ?? []}
          me={{ uid: user.uid, name: playerName(user), isMaster }}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
