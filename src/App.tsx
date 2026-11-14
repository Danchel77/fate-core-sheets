import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';
import SkillsVariants from './preview/SkillsVariants';

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  if (window.location.hash === '#skills') {
    return <SkillsVariants />;
  }

  return <SheetScreen />;
}
