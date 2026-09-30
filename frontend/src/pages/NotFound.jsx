import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/10">
        <FileQuestion size={40} />
      </span>
      <h1 className="mt-6 text-5xl font-extrabold">404</h1>
      <p className="mt-2 text-lg font-semibold">Page not found</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary"><Home size={16} /> Home</Link>
        <button onClick={() => window.history.back()} className="btn-secondary"><ArrowLeft size={16} /> Go Back</button>
      </div>
    </div>
  );
}
