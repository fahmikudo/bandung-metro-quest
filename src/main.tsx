import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import App from './App';
import { initAnalytics } from './shared/lib/analytics';
import './index.css';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <ToastProvider placement="bottom-center" />
      <App />
    </HeroUIProvider>
  </StrictMode>
);
