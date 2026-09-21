import { Component } from 'react';
import { logError } from '../../utils/errors';

/** Last-resort boundary so a rendering bug never leaves a blank white page. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    logError('render', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-ink-600">We’re sorry — this page couldn’t be displayed. Please refresh, or try again in a moment.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-md bg-ink-900 px-5 py-2.5 text-sm font-medium text-white">
          Refresh page
        </button>
      </div>
    );
  }
}
