const MESSAGES = {
  'permission-denied': 'You don’t have permission to do that. Please try again later or contact us.',
  unavailable: 'We can’t reach the server right now. Please check your internet connection and try again.',
  'deadline-exceeded': 'The request took too long. Please try again.',
  'resource-exhausted': 'We’re receiving too many requests right now. Please try again shortly.',
  'not-found': 'We couldn’t find what you were looking for.',
  unconfigured: 'This feature isn’t available yet because the site is still being set up.',
  unauthenticated: 'Please sign in and try again.',
};

/** App-level error with a message that is safe to show to visitors. */
export class AppError extends Error {
  constructor(message, code = 'app-error', details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

/** Converts any thrown value into a friendly message (never raw Firebase text). */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error instanceof AppError) return error.message;
  const code = String(error.code || '').replace(/^(firestore|storage|auth)\//, '');
  if (MESSAGES[code]) return MESSAGES[code];
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return MESSAGES.unavailable;
  return fallback;
}

/** Logs full diagnostic detail in development only. */
export function logError(context, error) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}
