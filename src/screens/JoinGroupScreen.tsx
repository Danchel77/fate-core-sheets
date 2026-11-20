import { useEffect, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { LoadingMark } from '../components/LoadingMark';
import { useGroup } from '../hooks/useGroup';
import {
  joinGroup,
  leaveGroup,
  readGroupLink,
  type GroupLink,
} from '../data/groups';
import { openAuthDialog, useAuth } from '../firebase/authStore';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

type Answer = 'loading' | GroupLink | 'missing';

/** Вход по ссылке-приглашению: сначала показываем, куда зовут, потом пускаем. */
export default function JoinGroupScreen({ token }: { token: string }) {
  const { ready: authReady, user } = useAuth();
  const [answer, setAnswer] = useState<Answer>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feed } = useGroup(user?.uid ?? null);

  useEffect(() => {
    let alive = true;
    setAnswer('loading');
    void readGroupLink(token).then((link) => {
      if (alive) setAnswer(link ?? 'missing');
    });
    return () => {
      alive = false;
    };
  }, [token]);

  const link = answer !== 'loading' && answer !== 'missing' ? answer : null;
  const already = !!link && feed.status === 'ready' && feed.group.id === link.groupId;

  const join = async () => {
    if (!user) {
      openAuthDialog();
      return;
    }
    if (!link || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (feed.status === 'ready' && feed.group.id !== link.groupId) {
        await leaveGroup(user.uid, feed.group.id);
      }
      await joinGroup(user, link);
      window.location.hash = '#/group';
    } catch {
      setError('Не получилось присоединиться. Проверьте связь и попробуйте ещё раз.');
      setBusy(false);
    }
  };

  return (
    <div className="join" style={{ '--sheet-texture': PAPER_TEXTURE } as React.CSSProperties}>
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <AccountButton />
      </header>

      <main className="join__main">
        <section className="join__card">
          {answer === 'loading' || !authReady ? (
            <LoadingMark />
          ) : answer === 'missing' ? (
            <>
              <p className="join__kicker">Приглашение</p>
              <h1 className="join__title">Ссылка не работает</h1>
              <p className="join__text">
                Мастер мог её отозвать. Попросите новую — и откройте ещё раз.
              </p>
              <a className="heroes__empty-action" href="#/">
                На главную
              </a>
            </>
          ) : (
            <>
              <p className="join__kicker">Вас зовут за стол</p>
              <h1 className="join__title">{answer.name}</h1>
              <p className="join__text">
                Присоединитесь и выберите героя — его карточку увидят остальные. Без героя тоже
                можно: за столом вы будете, а лист добавите позже.
              </p>
              {already ? (
                <>
                  <p className="join__already">Вы уже в этой группе.</p>
                  <a className="heroes__empty-action" href="#/group">
                    Открыть группу
                  </a>
                </>
              ) : (
                <button
                  className="heroes__empty-action"
                  type="button"
                  onClick={() => void join()}
                  disabled={busy}
                >
                  {busy
                    ? 'Присоединяемся…'
                    : user
                      ? 'Присоединиться'
                      : 'Войти и присоединиться'}
                </button>
              )}
              {error && <p className="join__error">{error}</p>}
              <p className="join__note">Нужен вход в аккаунт — так видно, кто за столом.</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
