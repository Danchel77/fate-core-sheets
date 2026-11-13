import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';
import BlockVariants from './preview/BlockVariants';

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  if (window.location.hash === '#blocks') {
    return <BlockVariants />;
  }

  return <SheetScreen />;
}
