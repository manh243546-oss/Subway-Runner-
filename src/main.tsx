// Suppress Vite HMR WebSocket warnings in AI Studio environment
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const message = args[0]?.toString() || '';
    if (message.includes('WebSocket') || message.includes('[vite]')) {
      return; // Ignore WebSocket/Vite errors
    }
    originalError.apply(console, args);
  };
}

// Handle unhandled promise rejections from HMR
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('WebSocket')) {
    event.preventDefault();
  }
});

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
