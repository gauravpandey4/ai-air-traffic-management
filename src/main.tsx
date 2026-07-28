import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/globals.css';

const root = document.querySelector<HTMLDivElement>('#root');

if (root === null) {
  throw new Error('Application root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
