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
      {/* Top action bar: Title + Count on left, Filters, Create button on right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Title and Filter tabs together */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Мои персонажи <span className="text-slate-400 font-normal text-lg">({characters.length})</span>
          </h1>

          {/* Setting filter tabs (no icons, clean text pills) */}
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

        {/* New Character button (aligned to the right, matching header edge) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-medium text-xs shadow-sm hover:shadow transition self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Новый герой</span>
        </button>
      </div>

      {/* Grid of characters */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onSelect={() => selectChar(char.id)}
              onDuplicate={() => duplicateChar(char.id)}
              onDelete={() => deleteChar(char.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#141A23] border border-[#252E3E] rounded-2xl p-10 text-center max-w-lg mx-auto my-12 shadow-sm">
          <h2 className="font-semibold text-lg text-slate-100 mb-1.5">
            В пуле пока нет героев
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Создайте персонажа для сеттинга Ведьмака или классического Fate Core, либо загрузите готовых героев.
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
