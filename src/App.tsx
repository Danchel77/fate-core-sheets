import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';
import StuntsVariants from './preview/StuntsVariants';
import ExtrasVariants from './preview/ExtrasVariants';

/** Старые ссылки #skills и #stress теперь ведут на собранный лист в корне. */
if (window.location.hash === '#skills' || window.location.hash === '#stress') {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  if (window.location.hash === '#stunts') {
    return <StuntsVariants />;
  }

  if (window.location.hash === '#extras') {
    return <ExtrasVariants />;
  }

  return <SheetScreen />;
}
