import Button from '../components/ui/Button';
import Seo from '../components/ui/Seo';

export default function NotFoundPage({ title = 'Page not found', message = 'The page you’re looking for doesn’t exist or has moved.', backTo = '/', backLabel = 'Back to home' }) {
  return (
    <div className="container-page py-24 text-center">
      <Seo title={title} noindex />
      <p className="mb-2 text-sm font-semibold tracking-widest text-ink-500 uppercase">404</p>
      <h1 className="text-4xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-600">{message}</p>
      <Button to={backTo} className="mt-8">{backLabel}</Button>
    </div>
  );
}
