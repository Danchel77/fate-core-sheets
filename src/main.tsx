import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/cyrillic-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/pt-serif/cyrillic-400.css';
import '@fontsource/pt-serif/cyrillic-700.css';
import '@fontsource/pt-serif/latin-400.css';
import '@fontsource/pt-serif/latin-700.css';
import '@fontsource/cormorant-sc/cyrillic-700.css';
import '@fontsource/cormorant-sc/latin-700.css';
import '@fontsource/prata/cyrillic-400.css';
import '@fontsource/prata/latin-400.css';
import './styles/global.css';
import './styles/characters.css';
import './styles/sheet.css';
import './styles/character-block.css';
import './styles/portrait-plate.css';
import './styles/aspect-block.css';
import './styles/stress-block.css';
import './styles/extras-block.css';
import './styles/skills-editor.css';
import './styles/stunt-block.css';
import './styles/block-menu.css';
import './styles/hint.css';
import './styles/stunt-modal.css';
import './styles/skill-picker.css';
import './styles/portrait-dialog.css';
import './styles/wizard.css';
import './styles/auth.css';
import './styles/name-generator.css';
import './styles/loading.css';
import './styles/shared.css';
import './styles/group.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден элемент #root в index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
