const MESSAGES = {
  'permission-denied': 'You don’t have permission to do that.',
  unavailable: 'Can’t reach the server. Check your internet connection and try again.',
  'deadline-exceeded': 'The request took too long. Please try again.',
  'resource-exhausted': 'Too many requests. Please wait a moment and try again.',
  'not-found': 'That record could not be found. It may have been deleted.',
  'failed-precondition': 'This view needs a database index that hasn’t been created yet. See the README (Firestore indexes).',
  'invalid-credential': 'Incorrect email or password.',
  'wrong-password': 'Incorrect email or password.',
  'user-not-found': 'Incorrect email or password.',
  'invalid-email': 'Enter a valid email address.',
  'user-disabled': 'This account has been disabled.',
  'too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'network-request-failed': 'Network error. Check your internet connection and try again.',
  'email-already-in-use': 'An account with this email already exists.',
  'weak-password': 'Password must be at least 8 characters.',
  'storage/unauthorized': 'You don’t have permission to upload files.',
  'storage/canceled': 'Upload cancelled.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/retry-limit-exceeded': 'Upload failed due to a poor connection. Please try again.',
};

/** Error whose message is safe and meant to be shown to the admin user. */
export class AppError extends Error {
  constructor(message, code = 'app-error', details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error instanceof AppError) return error.message;
  const raw = String(error.code || '');
  const short = raw.replace(/^(firestore|auth)\//, '');
  if (MESSAGES[raw]) return MESSAGES[raw];
  if (MESSAGES[short]) return MESSAGES[short];
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return MESSAGES.unavailable;
  return fallback;
}

export function logError(context, error) {
  if (import.meta.env.DEV) console.error(`[${context}]`, error);
}
