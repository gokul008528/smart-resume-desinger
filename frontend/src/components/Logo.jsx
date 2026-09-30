import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Logo({ to = '/', compact = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm">
        <FileText size={20} />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Smart Resume <span className="text-primary-500">Designer</span>
        </span>
      )}
    </Link>
  );
}
