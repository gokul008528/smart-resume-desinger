import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function ErrorPage({ title = 'Something went wrong', message = 'We ran into a problem loading this page. Please try again.', showHome = true }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="text-red-600 dark:text-red-400" size={28} />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
        {showHome && (
          <button className="btn-primary" onClick={() => navigate('/')}>
            <Home size={16} /> Home
          </button>
        )}
      </div>
    </div>
  );
}
