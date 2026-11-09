import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CharacterProvider, useCharacters } from './context/CharacterContext';
import { Header } from './components/common/Header';
import { CharacterList } from './components/dashboard/CharacterList';
import { CharacterSheet } from './components/sheet/CharacterSheet';
import { Shield, BookOpen, ExternalLink } from 'lucide-react';

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
    <main className="flex-1 pb-16">
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

          {/* Calm, cohesive footer */}
          <footer className="border-t border-[#1E2634] bg-[#0C1017] text-slate-400 py-10 px-6 lg:px-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
              {/* Brand & info */}
              <div className="max-w-sm">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#18202C] border border-[#2B3648] flex items-center justify-center text-slate-300">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-fantasy font-bold text-slate-200 text-sm tracking-wide">
                    Fate Core Sheets
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Веб-приложение для ведения персонажей в НРИ по системе Fate Core. Поддержка сеттингов Ведьмака и универсального листа, экспорт в PDF для печати и Tabletop Simulator.
                </p>
              </div>

              {/* Links columns */}
              <div className="flex flex-wrap gap-10 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
                    Материалы
                  </h4>
                  <ul className="space-y-2 text-slate-400">
                    <li>
                      <a 
                        href="https://fate-srd.com/fate-core" 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-slate-200 flex items-center gap-1 transition"
                      >
                        <span>Правила Fate SRD</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://evilhat.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-slate-200 flex items-center gap-1 transition"
                      >
                        <span>Evil Hat Productions</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
                    Возможности
                  </h4>
                  <ul className="space-y-2 text-slate-400">
                    <li>Пирамида навыков и трюки</li>
                    <li>Экспорт в PDF (A4 / TTS)</li>
                    <li>ИИ-генератор аспектов Gemini</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-3">
                    Сеттинги
                  </h4>
                  <ul className="space-y-2 text-slate-400">
                    <li>Ведьмак (The Witcher)</li>
                    <li>Классический Fate Core</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom copyright line */}
            <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#18202C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
              <p>© 2026 Fate Core Sheets. Все права на сеттинги принадлежат их законным правообладателям.</p>
              <p>Работает офлайн с сохранением в браузере</p>
            </div>
          </footer>
        </div>
      </CharacterProvider>
    </AuthProvider>
  );
};

export default App;
