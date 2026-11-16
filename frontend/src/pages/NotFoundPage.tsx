import { Link } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-primary-800" />
        </div>
        <h1 className="text-4xl font-bold text-text mb-2">404</h1>
        <p className="text-text-secondary mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
