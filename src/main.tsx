// Polyfill/safe-guard window.fetch before any component render
try {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    let _fetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      get() {
        return _fetch;
      },
      set(val) {
        _fetch = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Pass
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
