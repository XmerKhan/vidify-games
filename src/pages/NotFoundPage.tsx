import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container-content py-20 text-center">
      <h1 className="font-display font-extrabold text-6xl text-ink-300 mb-4">404</h1>
      <h2 className="font-display font-bold text-xl text-ink-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-ink-500 mb-6">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary">
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
