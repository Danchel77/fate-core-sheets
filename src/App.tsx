import SheetScreen from './screens/SheetScreen';
import Wireframe from './preview/Wireframe';
import SkillsVariants from './preview/SkillsVariants';
import StuntsVariants from './preview/StuntsVariants';

export default function App() {
  if (window.location.hash === '#print') {
    return <Wireframe />;
  }

  if (window.location.hash === '#skills') {
    return <SkillsVariants />;
  }

  if (window.location.hash === '#stunts') {
    return <StuntsVariants />;
  }

  return <SheetScreen />;
}
