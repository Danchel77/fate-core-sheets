import Wireframe from './preview/Wireframe';
import WebSheet from './preview/WebSheet';

export default function App() {
  if (window.location.hash === '#wireframe') {
    return <Wireframe />;
  }

  if (window.location.hash === '#websheet') {
    return <WebSheet />;
  }

  return (
    <main className="app-shell">
      <p className="app-kicker">Fate Core</p>
      <h1>Листы персонажей</h1>
      <p className="app-lead">
        Каркас собран и работает. Следующий шаг — визуальный стиль и экраны.
      </p>
    </main>
  );
}
