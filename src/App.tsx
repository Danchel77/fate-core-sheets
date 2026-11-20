import { useEffect, useState } from 'react';
import { AuthDialog } from './components/AuthDialog';
import { SplashScreen } from './components/SplashScreen';
import CharactersScreen from './screens/CharactersScreen';
import NewCharacterScreen from './screens/NewCharacterScreen';
import SheetScreen from './screens/SheetScreen';
import { findCharacter, initStore, updateCharacter, useCharacters } from './data/store';

/** Адреса: #/ — список героев, #/hero/<id> — лист, #/new — новый герой. */
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

  if (!ready) return <SplashScreen />;

  if (hash === '/new') {
    return (
      <>
        <NewCharacterScreen />
        <AuthDialog />
      </>
    );
  }

  const match = /^\/hero\/([^/]+)$/.exec(hash);
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
