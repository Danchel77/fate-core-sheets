import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';
import StuntsVariants from './preview/StuntsVariants';
import StressVariants from './preview/StressVariants';

/** Старая ссылка #skills теперь ведёт на собранный лист в корне. */
if (window.location.hash === '#skills') {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  if (window.location.hash === '#stunts') {
    return <StuntsVariants />;
  }

  if (window.location.hash === '#stress') {
    return <StressVariants />;
  }

  return <SheetScreen />;
}
