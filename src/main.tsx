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
import '@fontsource/playfair-display/cyrillic-700-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден элемент #root в index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
