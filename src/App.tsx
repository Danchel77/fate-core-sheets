import { useEffect, useState } from 'react';
import { AuthDialog } from './components/AuthDialog';
import CharactersScreen from './screens/CharactersScreen';
import CharactersLoading from './screens/CharactersLoading';
import GroupScreen from './screens/GroupScreen';
import JoinGroupScreen from './screens/JoinGroupScreen';
import NewCharacterScreen from './screens/NewCharacterScreen';
import SharedScreen from './screens/SharedScreen';
import SheetLoading from './screens/SheetLoading';
import SheetScreen from './screens/SheetScreen';
import { findCharacter, initStore, updateCharacter, useCharacters } from './data/store';

/** Адреса: #/ — список героев, #/hero/<id> — лист, #/s/<код> — чужой лист по ссылке, #/group — группа за столом, #/g/<код> — вход по приглашению, #/new — новый герой. */
function readHash() {
  return window.location.hash.replace(/^#/, '');
}

export default function App() {
  const [hash, setHash] = useState(readHash);
  const { ready } = useCharacters();

  useEffect(() => {
    initStore();
  }, []);

  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  const match = /^\/hero\/([^/]+)$/.exec(hash);
  const shareMatch = /^\/s\/([^/]+)$/.exec(hash);
  const joinMatch = /^\/g\/([^/]+)$/.exec(hash);

  /* Чужая ссылка не зависит от своего списка: показываем её сразу,
     а «Добавить себе» внизу дождётся хранилища. */
  if (shareMatch) {
    return (
      <>
        <SharedScreen
          key={shareMatch[1]}
          token={decodeURIComponent(shareMatch[1])}
        />
        <AuthDialog />
      </>
    );
  }

  /* Группа и приглашение не зависят от списка героев: показываем их сразу,
     а вход в аккаунт окно дождётся само. */
  if (joinMatch) {
    return (
      <>
        <JoinGroupScreen key={joinMatch[1]} token={decodeURIComponent(joinMatch[1])} />
        <AuthDialog />
      </>
    );
  }

  if (hash === '/group') {
    return (
      <>
        <GroupScreen />
        <AuthDialog />
      </>
    );
  }

  /* Пока хранилище не ответило, показываем ту страницу, куда шли:
     список — свой список, лист — свой фолиант. Пустая страница и
     отдельная заставка не мелькают. */
  if (!ready) {
    return (
      <>
        {match ? <SheetLoading /> : <CharactersLoading />}
        <AuthDialog />
      </>
    );
  }

  if (hash === '/new') {
    return (
      <>
        <NewCharacterScreen />
        <AuthDialog />
      </>
    );
  }

  const hero = match ? findCharacter(decodeURIComponent(match[1])) : undefined;

  return (
    <>
      {hero ? (
        <SheetScreen
          key={hero.id}
          character={hero.sheet}
          setting={hero.setting}
          record={hero}
          onPatch={(patch) => void updateCharacter(hero.id, patch)}
        />
      ) : (
        <CharactersScreen />
      )}
      <AuthDialog />
    </>
  );
}
