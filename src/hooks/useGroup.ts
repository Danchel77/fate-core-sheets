import { useEffect, useState } from 'react';
import {
  forgetGroup,
  subscribeGroup,
  subscribeMyGroups,
  type GroupFeed,
  type GroupRef,
} from '../data/groups';

export type GroupsState = {
  /** Список групп; null — ещё читаем указатель. */
  refs: GroupRef[] | null;
  /** Стол активной группы. */
  feed: GroupFeed;
  /** Указатель не прочитался (сеть или правила). */
  lost: boolean;
  /** Группу закрыли или убрали игрока — карточка пропала со стола. */
  evicted: boolean;
  activeId: string | null;
  setActiveId: (id: string) => void;
};

const emptyFeed: GroupFeed = { status: 'loading', group: null, members: [] };

/** Группы за столом: список, активная и её стол. */
export function useGroups(uid: string | null): GroupsState {
  const [refs, setRefs] = useState<GroupRef[] | null>(null);
  const [lost, setLost] = useState(false);
  const [evicted, setEvicted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feed, setFeed] = useState<GroupFeed>(emptyFeed);

  useEffect(() => {
    setRefs(null);
    setLost(false);
    setEvicted(false);
    setActiveId(null);
    setFeed(emptyFeed);
    if (!uid) {
      setRefs([]);
      return;
    }
    return subscribeMyGroups(
      uid,
      (list) => {
        setRefs(list);
        setActiveId((current) =>
          current && list.some((item) => item.id === current) ? current : (list[0]?.id ?? null),
        );
      },
      () => {
        setLost(true);
        setRefs([]);
        setActiveId(null);
      },
    );
  }, [uid]);

  useEffect(() => {
    if (!activeId) return;
    setFeed(emptyFeed);
    return subscribeGroup(
      activeId,
      (next) => setFeed(next),
      () => {
        setEvicted(true);
        setRefs((list) => list?.filter((item) => item.id !== activeId) ?? list);
        if (uid) void forgetGroup(uid, activeId);
        setActiveId(null);
      },
    );
  }, [activeId, uid]);

  return { refs, feed, lost, evicted, activeId, setActiveId };
}
