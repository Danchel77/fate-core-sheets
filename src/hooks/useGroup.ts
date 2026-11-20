import { useEffect, useState } from 'react';
import { rememberMembership, subscribeMyGroup, type GroupFeed } from '../data/groups';

/**
 * Своя группа: «loading» → «none» или «ready».
 * lost — группу закрыли или меня из неё убрали: показываем пустое состояние с пояснением.
 */
export function useGroup(uid: string | null): { feed: GroupFeed; lost: boolean } {
  const [feed, setFeed] = useState<GroupFeed>({ status: uid ? 'loading' : 'none' });
  const [lost, setLost] = useState(false);

  useEffect(() => {
    setLost(false);
    if (!uid) {
      setFeed({ status: 'none' });
      rememberMembership(null);
      return;
    }

    let alive = true;
    setFeed({ status: 'loading' });

    const stop = subscribeMyGroup(
      uid,
      (next) => {
        if (!alive) return;
        setFeed(next);
        if (next.status === 'ready') {
          const mine = next.members.find((member) => member.uid === uid);
          rememberMembership({ uid, groupId: next.group.id, heroId: mine?.heroId ?? null });
        } else if (next.status === 'none') {
          rememberMembership(null);
        }
      },
      () => {
        if (!alive) return;
        setLost(true);
        setFeed({ status: 'none' });
        rememberMembership(null);
      },
    );

    return () => {
      alive = false;
      stop();
    };
  }, [uid]);

  return { feed, lost };
}
