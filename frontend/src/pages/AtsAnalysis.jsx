import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';

export default function AtsAnalysis() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/resumes')
      .then(({ data }) => {
        setResumes(data.data || []);
        if (data.data?.length) setResumeId(data.data[0]._id);
      })
      .catch((err) => toast.error(getErrorMessage(err, 'Could not load resumes.')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analyze = async () => {
    if (!resumeId) {
      toast.warning('Select a resume first.');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const { data } = await api.post('/ats/analyze', { resumeId, jobDescription });
      setResult(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'ATS analysis failed.'));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-56" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes to analyze"
        message="Create a resume first, then run ATS analysis on it."
        action={<Link to="/resumes/create" className="btn-primary">Create Resume</Link>}
      />
    );
  }

  const scoreColor = !result ? '' : result.score >= 80 ? 'text-green-500' : result.score >= 55 ? 'text-amber-500' : 'text-red-500';
  const ringColor = !result ? '' : result.score >= 80 ? 'stroke-green-500' : result.score >= 55 ? 'stroke-amber-500' : 'stroke-red-500';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">ATS Analysis</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Check structure, keywords, dates, and formatting. Optionally paste a job description for keyword matching.
        </p>
      </div>

      <div className="card grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="resume">Resume</label>
          <select id="resume" className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>{r.title}{r.targetRole ? ` — ${r.targetRole}` : ''}</option>
            ))}
          </select>
        </div>
        <button onClick={analyze} className="btn-primary" disabled={analyzing}>
          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
          {analyzing ? 'Analyzing…' : 'Run Analysis'}
        </button>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="jd">Job description (optional)</label>
          <textarea
            id="jd"
            className="input min-h-28"
            rows={5}
            placeholder="Paste the job description here to check keyword match…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {analyzing && (
        <div className="card flex items-center gap-3 p-6">
          <Loader2 size={22} className="animate-spin text-primary-500" />
          <p className="text-sm text-slate-500">Running 15+ checks on your resume…</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-up space-y-5">
          <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-8">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
                <circle
                  cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                  className={ringColor}
                  strokeDasharray={`${(result.score / 100) * 327} 327`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{result.score}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">{result.summary}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {result.checks.filter((c) => c.status === 'pass').length} of {result.checks.length} checks passed.
              </p>
              <Link to={`/resumes/${resumeId}/edit`} className="btn-secondary mt-3 !py-2 text-sm">Fix in Editor</Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold">ATS Checks</h2>
            <ul className="mt-4 space-y-3">
              {result.checks.map((c, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  {c.status === 'pass'
                    ? <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-green-500" />
                    : <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-500" />}
                  <div>
                    <p className="text-sm font-semibold">{c.status === 'pass' ? '✓' : '⚠'} {c.title}</p>
                    {c.detail && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{c.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {(result.keywords.matched.length > 0 || result.keywords.missing.length > 0) && (
            <div className="card grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-green-600">Matched keywords ({result.keywords.matched.length})</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.keywords.matched.map((k, i) => (
                    <span key={i} className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-600">Missing keywords ({result.keywords.missing.length})</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.keywords.missing.map((k, i) => (
                    <span key={i} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
