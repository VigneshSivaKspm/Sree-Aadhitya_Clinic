import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { logError } from './utils/errors';
import './index.css';

/** Last-resort boundary so a rendering bug never leaves a blank page. */
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { logError('render', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Something went wrong</h1>
        <p className="max-w-md text-sm text-ink-600">The admin panel hit an unexpected error. Refresh the page to continue.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white">Refresh</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
