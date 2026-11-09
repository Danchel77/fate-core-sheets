import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, Sword, Compass } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { CharacterCard } from './CharacterCard';
import { SettingType } from '../../types/character';
import { SAMPLE_CHARACTERS } from '../../config/sampleCharacters';

export const CharacterList: React.FC = () => {
  const { characters, selectChar, createChar, duplicateChar, deleteChar, updateChar } = useCharacters();
  const [filter, setFilter] = useState<'all' | SettingType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const witcherCount = useMemo(() => characters.filter(c => c.setting === 'witcher').length, [characters]);
  const universalCount = useMemo(() => characters.filter(c => c.setting === 'universal').length, [characters]);

  const filteredCharacters = useMemo(() => {
    if (filter === 'all') return characters;
    return characters.filter(c => c.setting === filter);
  }, [characters, filter]);

  const handleCreate = async (setting: SettingType) => {
    setIsCreateModalOpen(false);
    const defaultName = setting === 'witcher' ? 'Новый ведьмак' : 'Новый искатель приключений';
    await createChar(setting, defaultName);
  };

  const handleLoadSamples = () => {
    SAMPLE_CHARACTERS.forEach(char => updateChar(char));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Top bar: Title + Count on left, Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Мои персонажи <span className="text-slate-400 font-normal text-lg">({characters.length})</span>
          </h1>

          {/* Setting filter tabs */}
          <div className="flex items-center bg-[#141A23] border border-[#252E3E] p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                filter === 'all'
                  ? 'bg-[#252E3E] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('witcher')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                filter === 'witcher'
                  ? 'bg-[#252E3E] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ведьмак {witcherCount > 0 && <span className="text-slate-500 ml-1">({witcherCount})</span>}
            </button>
            <button
              onClick={() => setFilter('universal')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                filter === 'universal'
                  ? 'bg-[#252E3E] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fate Core {universalCount > 0 && <span className="text-slate-500 ml-1">({universalCount})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of characters + Large Add Character Card */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onSelect={() => selectChar(char.id)}
              onDuplicate={() => duplicateChar(char.id)}
              onDelete={() => deleteChar(char.id)}
            />
          ))}

          {/* Large "+ Create Character" Card Button (Long Story Short style) */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative bg-[#141A23]/40 hover:bg-[#171D27] border border-dashed border-[#2B3648] hover:border-slate-500 rounded-xl p-5 min-h-[100px] sm:min-h-[110px] flex items-center justify-center transition-all duration-150 cursor-pointer text-slate-400 hover:text-slate-200"
            title="Создать нового персонажа"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#18202C] border border-[#2B3648] group-hover:border-slate-500 flex items-center justify-center text-slate-400 group-hover:text-white transition">
                <Plus className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition">
                Создать персонажа
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* Empty State when 0 characters */
        <div className="bg-[#141A23] border border-[#252E3E] rounded-2xl p-10 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#18202C] border border-[#2B3648] text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="font-semibold text-lg text-slate-100 mb-1.5">
            В пуле пока нет героев
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Создайте своего первого героя для Ведьмака или классического Fate Core, либо загрузите готовых персонажей.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-medium text-xs transition shadow-sm"
            >
              + Создать героя
            </button>
            <button
              onClick={handleLoadSamples}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1B2330] border border-[#2A364A] hover:bg-[#222C3D] text-slate-300 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Загрузить примеры</span>
            </button>
          </div>
        </div>
      )}

      {/* Setting Choice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#171D27] border border-[#2B3648] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-lg text-slate-100 mb-1">
              Выберите сеттинг персонажа
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Сеттинг задает список адаптированных навыков и характер генерации ИИ-помощника.
            </p>

            <div className="space-y-3 mb-6">
              {/* Witcher Option */}
              <button
                onClick={() => handleCreate('witcher')}
                className="w-full text-left p-3.5 rounded-xl bg-[#10141C] border border-[#252E3E] hover:border-slate-500 hover:bg-[#151B25] transition group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-[#1D2533] text-amber-400/90 border border-white/5">
                    <Sword className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-100 group-hover:text-white transition">
                      Ведьмак / Тёмное фэнтези
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Рекомендуемый сеттинг
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-11 leading-relaxed">
                  Адаптированные навыки: Фехтование, Знаки и Магия, Алхимия, Чутьё, Верховая езда.
                </p>
              </button>

              {/* Universal Fate Core Option */}
              <button
                onClick={() => handleCreate('universal')}
                className="w-full text-left p-3.5 rounded-xl bg-[#10141C] border border-[#252E3E] hover:border-slate-500 hover:bg-[#151B25] transition group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-[#1D2533] text-indigo-400/90 border border-white/5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-100 group-hover:text-white transition">
                      Классический Fate Core
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Универсальная система
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-11 leading-relaxed">
                  Официальный список из 18 стандартных навыков Fate Core для любых жанров.
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#252E3E] transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
