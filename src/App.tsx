import { useEffect, useState } from 'react';
import CharactersScreen from './screens/CharactersScreen';
import NewCharacterScreen from './screens/NewCharacterScreen';
import SheetScreen from './screens/SheetScreen';
import { findCharacter, loadCharacters, updateCharacter, useCharacters } from './data/store';

/** Адреса: #/ — список героев, #/hero/<id> — лист, #/new — новый герой. */
function readHash() {
  return window.location.hash.replace(/^#/, '');
}

export default function App() {
  const [hash, setHash] = useState(readHash);
  const { ready } = useCharacters();

  useEffect(() => {
    void loadCharacters();
  }, []);

  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  if (!ready) return null;

  if (hash === '/new') return <NewCharacterScreen />;

  const match = /^\/hero\/([^/]+)$/.exec(hash);
  const hero = match ? findCharacter(decodeURIComponent(match[1])) : undefined;

  return hero ? (
    <SheetScreen
      key={hero.id}
      character={hero.sheet}
      setting={hero.setting}
      onPatch={(patch) => void updateCharacter(hero.id, patch)}
    />
  ) : (
    <CharactersScreen />
  );
}
