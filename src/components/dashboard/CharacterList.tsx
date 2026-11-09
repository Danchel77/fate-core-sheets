import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Sparkles, Sword, Compass } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { CharacterCard } from './CharacterCard';
import { SettingType, Character } from '../../types/character';
import { createNewCharacter } from '../../utils/fateMath';

export const CharacterList: React.FC = () => {
  const { characters, selectChar, createChar, duplicateChar, deleteChar, updateChar } = useCharacters();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | SettingType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCharacters = useMemo(() => {
    return characters.filter(c => {
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.aspects.high_concept || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.aspects.trouble || '').toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === 'all' || c.setting === filter;

      return matchesSearch && matchesFilter;
    });
  }, [characters, search, filter]);

  const handleCreate = async (setting: SettingType) => {
    setIsCreateModalOpen(false);
    const defaultName = setting === 'witcher' ? 'Новый ведьмак / герой' : 'Новый искатель приключений';
    await createChar(setting, defaultName);
  };

  const handleAddSampleGeralt = async () => {
    const geralt: Character = {
      ...createNewCharacter('witcher', 'Геральт из Ривии'),
      aspects: {
        high_concept: 'Опытный ведьмак Школы Волка',
        trouble: '«Зло — это зло. Меньшее, большее, среднее...»',
        aspect_3: 'Серебряный меч для чудовищ, стальной — для людей',
        aspect_4: 'Связан Предназначением с Цири',
        aspect_5: 'Тяжелый вздох и ворчание скрывают доброе сердце',
      },
      skills: {
        4: ['fight'], // +4 Фехтование
        3: ['notice', 'physique'], // +3 Ведьмачье чутьё, Сложение
        2: ['lore', 'crafts', 'athletics'], // +2 Бестиарий, Алхимия, Атлетика
        1: ['stealth', 'ride', 'will', 'investigate'], // +1 Скрытность, Верховая езда, Воля, Расследование
      },
      stunts: [
        {
          id: 'stunt_igni',
          name: 'Знак Игни',
          template: 'bonus',
          description: 'Потому что я владею Знаком Игни, я получаю +2 к созданию преимущества с помощью Бестиария и Магии, когда поджигаю врагов или окружение.',
        },
        {
          id: 'stunt_quen',
          name: 'Знак Квен',
          template: 'swap',
          description: 'Потому что я использую защитный щит Квен, я могу использовать Бестиарий и Магию вместо Атлетики для защиты от мощных физических ударов монстров.',
        },
        {
          id: 'stunt_potions',
          name: 'Ведьмачья фармакопея (Эликсиры)',
          template: 'special',
          description: 'Раз за сцену я могу принять токсичный эликсир («Ласточка» или «Гром») и сразу очистить одну коробку стресса либо получить бесплатный призыв аспекта «Ведьмачий транс».',
        }
      ],
      description: 'Белый Волк, Мясник из Блавикена. Мутант с желтыми кошачьими глазами.',
      refresh: 3,
      currentFatePoints: 3,
    };

    updateChar(geralt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Top action bar: Search, Filters, New Character button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или аспектам..."
            className="w-full bg-[#161B22] border border-[#2E3440] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3">
          {/* Setting tabs */}
          <div className="flex items-center bg-[#161B22] border border-[#2E3440] p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filter === 'all'
                  ? 'bg-amber-600 text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('witcher')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                filter === 'witcher'
                  ? 'bg-amber-600 text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sword className="w-3 h-3" />
              Ведьмак
            </button>
            <button
              onClick={() => setFilter('universal')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                filter === 'universal'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3 h-3" />
              Fate Core
            </button>
          </div>

          {/* New Character button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-900/30 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать героя</span>
          </button>
        </div>
      </div>

      {/* Grid of characters */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="bg-[#161B22]/60 border border-[#2E3440] border-dashed rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Sword className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-fantasy font-bold text-xl text-slate-100 mb-2">
            В вашем пуле пока нет героев
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Создайте своего первого персонажа для мрачного Неверленда или классической игры Fate Core. Либо загрузите готового тестового героя.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold text-sm transition"
            >
              + Создать нового персонажа
            </button>
            <button
              onClick={handleAddSampleGeralt}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-[#2E3440] hover:border-amber-500/40 text-slate-300 hover:text-white text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Добавить Геральта из Ривии (Пример)
            </button>
          </div>
        </div>
      )}

      {/* Setting Choice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-fantasy font-bold text-xl text-amber-400 mb-1">
              Выберите сеттинг персонажа
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Сеттинг определяет список адаптированных навыков и характер подсказок ИИ.
            </p>

            <div className="space-y-3 mb-6">
              {/* Witcher Option */}
              <button
                onClick={() => handleCreate('witcher')}
                className="w-full text-left p-4 rounded-xl bg-[#0B0E14] border border-[#2E3440] hover:border-amber-500 hover:bg-[#1C222B] transition group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                    <Sword className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-400 transition">
                      Ведьмак / Тёмное фэнтези
                    </h4>
                    <span className="text-[11px] text-amber-500/80 uppercase tracking-wider font-semibold">
                      Рекомендуемый сеттинг
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">
                  Адаптированные навыки: Фехтование, Знаки и Магия, Алхимия, Чутьё, Верховая езда.
                </p>
              </button>

              {/* Universal Fate Core Option */}
              <button
                onClick={() => handleCreate('universal')}
                className="w-full text-left p-4 rounded-xl bg-[#0B0E14] border border-[#2E3440] hover:border-indigo-500 hover:bg-[#1C222B] transition group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-fantasy font-bold text-slate-100 group-hover:text-indigo-400 transition">
                      Классический Fate Core
                    </h4>
                    <span className="text-[11px] text-indigo-400/80 uppercase tracking-wider font-semibold">
                      Универсальная система
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">
                  Официальный список из 18 стандартных навыков Fate Core для любых жанров и миров.
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
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
