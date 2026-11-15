import SheetScreen from './screens/SheetScreen';

/** Единственная рабочая страница — собранный лист. Старые хэш-ссылки чистим. */
if (window.location.hash) {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  );
}

export default function App() {
  return <SheetScreen />;
}
