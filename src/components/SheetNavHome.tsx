import { AccountButton } from './AccountButton';
import { IconArrowLeft } from './icons';

/** Шапка листа до его загрузки: возврат к списку и вход в аккаунт. */
export function SheetNavHome() {
  return (
    <nav className="sheet-nav">
      <a href="#/">
        <IconArrowLeft />
        <span className="sheet-nav__label">Мои персонажи</span>
        <span className="sheet-nav__label-short">Персонажи</span>
      </a>
      <div className="sheet-nav__actions">
        <AccountButton variant="sheet" />
      </div>
    </nav>
  );
}
