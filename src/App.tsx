import { useEffect, useState } from 'react';
import CharactersScreen from './screens/CharactersScreen';
import SheetScreen from './screens/SheetScreen';
import { findCharacter } from './data/characters';

/** Адреса: #/ — список героев, #/hero/<id> — лист персонажа. */
function readHash() {
  return window.location.hash.replace(/^#/, '');
}

export default function App() {
  const [hash, setHash] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  const match = /^\/hero\/([^/]+)$/.exec(hash);
  const hero = match ? findCharacter(decodeURIComponent(match[1])) : undefined;

  return hero ? <SheetScreen character={hero.sheet} /> : <CharactersScreen />;
}
