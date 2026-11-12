import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CharacterProvider, useCharacters } from './context/CharacterContext';
import { Header } from './components/common/Header';
import { CharacterList } from './components/dashboard/CharacterList';
import { CharacterSheet } from './components/sheet/CharacterSheet';
import { Shield } from 'lucide-react';
import { UiKit } from './components/common/UiKit';

const MainContent: React.FC = () => {
  const { activeCharacter, loading } = useCharacters();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Shield className="size-5 animate-pulse text-gold" strokeWidth={1.5} aria-hidden="true" />
        <p className="font-sans text-sm text-text-muted">Загрузка персонажей...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 pb-4">
      {activeCharacter ? <CharacterSheet /> : <CharacterList />}
    </main>
  );
};

export const App: React.FC = () => {
  const view = new URLSearchParams(window.location.search).get('view');

  if (view === 'kit') {
    return <UiKit />;
  }

  // Изолированный экран каталога: без шапки и подвала, только сам список.
  if (view === 'list') {
    return (
      <AuthProvider>
        <CharacterProvider>
          <div className="min-h-screen bg-ink text-text">
            <CharacterList />
          </div>
        </CharacterProvider>
      </AuthProvider>
    );
  }

  // Изолированный экран листа: без шапки и подвала, только сам лист.
  if (view === 'sheet') {
    return (
      <AuthProvider>
        <CharacterProvider>
          <div className="min-h-screen bg-ink text-text">
            <CharacterSheet />
          </div>
        </CharacterProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CharacterProvider>
        <div className="flex min-h-screen flex-col justify-between bg-ink text-text">
          <Header />
          <MainContent />

          <footer className="border-t border-line py-4 text-xs text-text-muted">
            <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
              <span>© 2026. Все права на сеттинги принадлежат их законным правообладателям.</span>
            </div>
          </footer>
        </div>
      </CharacterProvider>
    </AuthProvider>
  );
};

export default App;
