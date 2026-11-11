/**
 * Исходник внутристраничного заполнения конструктора.
 *
 * Подставляется в eval-шаг вместе с HELPERS. Конструктор — одна страница:
 * переходов «Далее» больше нет, все поля существуют одновременно, поэтому
 * заполнение идёт по id, а размещение навыков — по клику на имя в каталоге.
 */
export const WIZARD_SRC = String.raw`
async function fillWizard(t, options) {
  const opts = options || {};
  const skills = opts.skills || [
    'Атлетика', 'Ближний бой', 'Стрельба', 'Скрытность', 'Верховая езда',
    'Телосложение', 'Внимание', 'Бестиарий', 'Алхимия', 'Магия'
  ];
  const aspects = opts.aspects || [
    'Нашёл ребёнка в разорённой деревне',
    'Держу слово, данное ведьмаку из Скеллиге',
    'В Новиграде у меня есть свой человек'
  ];
  const stuntName = opts.stuntName || 'Кошмарный удар';
  const text = () => document.body.textContent || '';

  if (opts.enterWizard !== false) {
    t.click('Создать персонажа');
  }

  await t.until(() => document.querySelector('#wizard-name'), 10000, 'конструктор');
  t.setValue('#wizard-name', opts.name || 'Лето из Скеллиге');
  if (opts.stopAt === 'name') return;

  t.setValue('#wizard-high-concept', opts.concept || 'Ведьмак Школы Кота');
  t.setValue('#wizard-trouble', opts.trouble || 'За мной охотятся за долги');
  t.setValue('#wizard-aspect-3', aspects[0]);
  t.setValue('#wizard-aspect-4', aspects[1]);
  t.setValue('#wizard-aspect-5', aspects[2]);
  if (opts.stopAt === 'aspects') return;

  if (opts.stopAt === 'skills') return;

  if (opts.placeSkills !== false) {
    for (const skill of skills) {
      t.click(skill);
      await t.until(() => t.placed(skill), 8000, 'размещение навыка ' + skill);
    }
  }

  t.click(opts.pattern || 'Бонус +2');
  await t.until(() => document.querySelector('#wizard-stunt-name'), 8000, 'конструктор трюка');
  t.setValue('#wizard-stunt-name', stuntName);
  t.setValue('#wizard-stunt-situation', opts.stuntSituation || 'против чудовищ, когда бью первым');
  await t.until(() => t.enabled('Сохранить трюк'), 4000, 'кнопка «Сохранить трюк»');
  t.click('Сохранить трюк');
  await t.until(() => text().includes(stuntName), 8000, 'трюк в списке');
  if (opts.stopAt === 'stunts') return;

  if (opts.scrollTo) {
    document.getElementById(opts.scrollTo)?.scrollIntoView({ block: 'start' });
  }
}
`;
