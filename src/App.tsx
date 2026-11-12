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
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gray border border-gray text-slate-400 flex items-center justify-center animate-pulse mb-3">
          <Shield className="w-5 h-5 stroke-[1.5]" />
        </div>
        <p className="text-sm text-slate-400">Загрузка персонажей...</p>
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
        <div className="min-h-screen bg-ink text-text flex flex-col justify-between selection:bg-slate-700 selection:text-white">
          <Header />
          <MainContent />

          <footer className="border-t border-gray bg-ink py-3 mt-auto">
            <div className="max-w-[1380px] mx-auto px-4 sm:px-6 text-xs text-slate-500">
              <span>© 2026. Все права на сеттинги принадлежат их законным правообладателям.</span>
            </div>
          </footer>
        </div>
      </CharacterProvider>
    </AuthProvider>
  );
};

export default App;
