import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <p className="text-sm font-semibold tracking-widest text-ink-500 uppercase">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-600">The page you’re looking for doesn’t exist.</p>
      <Button to="/" className="mt-6">Back to dashboard</Button>
    </div>
  );
}
