import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CharacterProvider, useCharacters } from './context/CharacterContext';
import { Header } from './components/common/Header';
import { CharacterList } from './components/dashboard/CharacterList';
import { CharacterSheet } from './components/sheet/CharacterSheet';
import { Shield, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeCharacter, loading } = useCharacters();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-pulse mb-4">
          <Shield className="w-6 h-6 stroke-[2]" />
        </div>
        <p className="font-fantasy text-amber-400 font-bold text-base">Загрузка пула персонажей...</p>
      </div>
    );
  }

  return (
    <main className="pb-16">
      {activeCharacter ? <CharacterSheet /> : <CharacterList />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CharacterProvider>
        <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between selection:bg-amber-600 selection:text-white">
          <div>
            <Header />
            <MainContent />
          </div>

          {/* Footer */}
          <footer className="border-t border-[#2E3440] py-6 px-4 text-center text-xs text-slate-500 bg-[#0B0E14]/80">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-fantasy font-bold text-amber-400">Fate Core Sheets</span>
                <span>— веб-приложение для Мастеров и игроков</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Fate Core © Evil Hat Productions</span>
                <span>•</span>
                <span>The Witcher Universe © Andrzej Sapkowski</span>
                <span>•</span>
                <span className="text-amber-500">Gemini 3.5 AI Ready</span>
              </div>
            </div>
          </footer>
        </div>
      </CharacterProvider>
    </AuthProvider>
  );
};

export default App;
