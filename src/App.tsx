import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  return <SheetScreen />;
}
