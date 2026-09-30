import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';
import axios from 'axios';
import ResumeRenderer from '../components/resume/ResumeRenderer';
import LoadingPage from '../components/LoadingPage';
import Logo from '../components/Logo';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

export default function PublicResume() {
  const { username, resumeSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicApi.get(`/public/resume/${username}/${resumeSlug}`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username, resumeSlug]);

  if (loading) return <LoadingPage message="Loading resume…" />;

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800">
          <Lock size={30} />
        </span>
        <h1 className="text-2xl font-extrabold">Resume unavailable</h1>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          This link is invalid, or the owner has disabled public sharing for this resume.
        </p>
        <Link to="/" className="btn-primary"><Home size={16} /> Go Home</Link>
      </div>
    );
  }

  const { resume, owner } = data;

  return (
    <div className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <Link to="/signup" className="btn-secondary !py-2 text-sm">Create Your Own</Link>
        </div>
        {owner && <p className="mb-3 text-center text-sm text-slate-500">{owner.name}&apos;s resume • Shared via Smart Resume Designer</p>}
        <div id="resume-print-area">
          <ResumeRenderer resume={resume} templateId={resume.templateId} />
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">Built with Smart Resume Designer</p>
      </div>
    </div>
  );
}
