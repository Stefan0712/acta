import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router-dom'
import { NotificationProvider } from './Notification/NotificationContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
    <NotificationProvider>
      <App />
    </NotificationProvider>
    </HashRouter>
  </StrictMode>,
)


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker.register(swUrl)
      .then((reg) => console.log('SW Registered!', reg.scope))
      .catch((err) => console.log('SW Failed:', err));
  });
}