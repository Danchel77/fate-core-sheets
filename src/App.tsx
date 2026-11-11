import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CharacterProvider, useCharacters } from './context/CharacterContext';
import { Header } from './components/common/Header';
import { CharacterList } from './components/dashboard/CharacterList';
import { CharacterSheet } from './components/sheet/CharacterSheet';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeCharacter, loading } = useCharacters();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-[#171D27] border border-[#252E3E] text-slate-400 flex items-center justify-center animate-pulse mb-3">
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
  return (
    <AuthProvider>
      <CharacterProvider>
        <div className="min-h-screen bg-[#0F141C] text-slate-100 flex flex-col justify-between selection:bg-slate-700 selection:text-white">
          <Header />
          <MainContent />

          {/* Minimalist, clean footer */}
          <footer className="border-t border-[#1C212B] bg-[#0B0E14] py-3 mt-auto">
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
