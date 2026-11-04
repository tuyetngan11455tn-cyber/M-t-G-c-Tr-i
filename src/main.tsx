import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Handle ViewTransition skipped rejections gracefully (standard browser behavior when transitions overlap)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || (typeof event?.reason === 'string' ? event.reason : '');
    if (msg.includes('Transition was skipped') || msg.includes('ViewTransition')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
