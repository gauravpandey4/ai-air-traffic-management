import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { App } from './app/App';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/globals.css';

registerSW({
  immediate: false,
});

const root = document.querySelector<HTMLDivElement>('#root');

if (root === null) {
  throw new Error('Application root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
