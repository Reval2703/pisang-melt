import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

const rootElement =
  document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Elemen root tidak ditemukan.'
  );
}

createRoot(rootElement).render(
  <App />
);