import React, { useState } from 'react';
import { SectionRibbon } from './SectionRibbon';
import { CornerFrame } from './CornerFrame';
import { FieldLabel } from './FieldLabel';
import { StatTable } from './StatTable';
import { StressBox } from './StressBox';
import { Bar } from './Bar';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { Input } from './Input';

// Витрина общих элементов. На ней живут все компоненты из src/components/common/,
// чтобы сценарий foundation проверял их в одном месте, а не по разным экранам.
const SWATCHES = [
  { token: 'bg-ink-raised', box: 'bg-ink-raised' },
  { token: 'bg-ink-frame', box: 'bg-ink-frame' },
  { token: 'border-line', box: 'border-line' },
  { token: 'bg-gold', box: 'bg-gold' },
  { token: 'bg-gold-light', box: 'bg-gold-light' },
  { token: 'border-gold-dim', box: 'border-gold-dim' },
  { token: 'bg-wine', box: 'bg-wine' },
];

const STATS = [
  { label: 'Атлетика', value: '+3' },
  { label: 'Внимание', value: '+2' },
  { label: 'Воля', value: '+1' },
  { label: 'Обман', value: '+1' },
];

const TABS = ['Обзор', 'Навыки', 'Трюки'];

export const UiKit: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="min-h-screen w-full bg-ink font-sans text-text">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
        <header className="pb-6">
          <h1 className="font-fantasy text-2xl tracking-wide text-gold">UI Kit</h1>
          <p className="pt-2 text-sm text-text-muted">
            Общие элементы системы Fate: ленты, угловые рамки, подписи, таблица, стресс, полоса,
            кнопки, вкладки и поле ввода.
          </p>
        </header>

        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <div className="space-y-8 pt-8">
          <section>
            <SectionRibbon>Рамки и подписи</SectionRibbon>
            <div className="flex flex-wrap gap-4 pt-4">
              <CornerFrame>
                <div className="min-w-[220px] space-y-2">
                  <FieldLabel>Концепция</FieldLabel>
                  <p className="font-fantasy text-base text-text">Следопыт из Каэр Морхена</p>
                </div>
              </CornerFrame>
              <CornerFrame>
                <div className="min-w-[220px] space-y-2">
                  <FieldLabel>Проблема</FieldLabel>
                  <p className="font-fantasy text-base text-text">
                    Слово ведьмака ничего не стоит при дворе
                  </p>
                </div>
              </CornerFrame>
            </div>
          </section>

          <section>
            <SectionRibbon>Таблица и полоса</SectionRibbon>
            <div className="space-y-5 pt-4">
              <StatTable stats={STATS} />
              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm text-text">Слоты трюков</span>
                  <span className="text-sm tabular-nums text-gold-light">7 / 10</span>
                </div>
                <Bar value={7} max={10} />
              </div>
            </div>
          </section>

          <section>
            <SectionRibbon>Стресс</SectionRibbon>
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="pb-2 text-xs uppercase tracking-wider text-text-muted">
                  Физический
                </div>
                <div className="flex gap-1.5" data-stress-state="filled">
                  {[0, 1, 2, 3].map((index) => (
                    <StressBox key={index} filled />
                  ))}
                </div>
              </div>
              <div>
                <div className="pb-2 text-xs uppercase tracking-wider text-text-muted">
                  Ментальный
                </div>
                <div className="flex gap-1.5" data-stress-state="empty">
                  {[0, 1, 2, 3].map((index) => (
                    <StressBox key={index} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionRibbon>Кнопки и поля</SectionRibbon>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="primary">Основная</Button>
              <Button variant="secondary">Вторичная</Button>
              <Button disabled>Недоступна</Button>
            </div>
            <p className="pt-3 text-xs text-warn">
              Предупреждение: персонаж сильнее обычного старта
            </p>
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Имя персонажа</FieldLabel>
                <Input data-kit="input" defaultValue="Геральт из Ривии" aria-label="Имя персонажа" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Прошлое</FieldLabel>
                <Input data-kit="input" placeholder="Откуда ты пришёл" aria-label="Прошлое" />
              </div>
            </div>
          </section>

          <section>
            <SectionRibbon>Палитра токенов</SectionRibbon>
            <div className="flex flex-wrap gap-4 pt-4">
              {SWATCHES.map((swatch) => (
                <div key={swatch.token} className="flex items-center gap-2">
                  <div className={`h-8 w-14 border-2 border-line ${swatch.box}`} />
                  <span className="text-xs text-text-muted">{swatch.token}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
