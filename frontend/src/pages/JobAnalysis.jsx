import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Loader2, FileText } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import { resumeToText } from '../utils/resume';

export default function JobAnalysis() {
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
    if (!jobDescription.trim()) {
      toast.warning('Paste a job description first.');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      let resumeText = '';
      if (resumeId) {
        const { data } = await api.get(`/resumes/${resumeId}`);
        resumeText = resumeToText(data.data);
      }
      const { data } = await api.post('/ai/job-analysis', { jobDescription, resumeText });
      setResult(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Job analysis failed.'));
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
        title="No resumes to compare"
        message="Create a resume first, then compare it against any job description."
        action={<Link to="/resumes/create" className="btn-primary">Create Resume</Link>}
      />
    );
  }

  const chip = (text, i, color) => (
    <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>{text}</span>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Job Description Analysis</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Paste any job posting — AI extracts skills, keywords, and requirements, then compares them with your resume.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="resume">Compare with resume</label>
          <select id="resume" className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>{r.title}{r.targetRole ? ` — ${r.targetRole}` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="jd">Job description</label>
          <textarea
            id="jd"
            className="input min-h-40"
            rows={8}
            placeholder="Paste the full job description here…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        <button onClick={analyze} className="btn-primary" disabled={analyzing}>
          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
          {analyzing ? 'Analyzing…' : 'Analyze Job Fit'}
        </button>
      </div>

      {analyzing && (
        <div className="card flex items-center gap-3 p-6">
          <Loader2 size={22} className="animate-spin text-primary-500" />
          <p className="text-sm text-slate-500">AI is reading the job description and comparing it with your resume…</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-up space-y-5">
          {typeof result.matchScore === 'number' && (
            <div className="card flex items-center gap-5 p-6">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10">
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{result.matchScore}</span>
                <span className="text-[10px] text-slate-500">MATCH</span>
              </div>
              <div>
                <h2 className="font-bold">Resume-to-job match</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {result.matchScore >= 75 ? 'Strong match — fine-tune with the recommendations below.'
                    : result.matchScore >= 50 ? 'Decent foundation — address the gaps to stand out.'
                      : 'Notable gaps — use the recommendations to tailor your resume.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-bold">Required Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(result.requiredSkills || []).map((s, i) => chip(s, i, 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'))}
                {(!result.requiredSkills || result.requiredSkills.length === 0) && <span className="text-xs text-slate-400">None detected</span>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-bold">Preferred Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(result.preferredSkills || []).map((s, i) => chip(s, i, 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300'))}
                {(!result.preferredSkills || result.preferredSkills.length === 0) && <span className="text-xs text-slate-400">None detected</span>}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold">Keywords</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(result.keywords || []).map((s, i) => chip(s, i, 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold">Key Responsibilities</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {(result.responsibilities || []).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            {result.experienceRequirements && (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                <strong>Experience required:</strong> {result.experienceRequirements}
              </p>
            )}
          </div>

          {(result.gaps || []).length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-amber-600">Gaps in your resume</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-bold text-green-600">Recommendations</h3>
            <ul className="mt-2 space-y-2">
              {(result.recommendations || []).map((r, i) => (
                <li key={i} className="rounded-lg bg-green-50 p-3 text-sm text-slate-700 dark:bg-green-900/20 dark:text-slate-200">{r}</li>
              ))}
            </ul>
            <Link to={`/resumes/${resumeId}/edit`} className="btn-primary mt-4">Apply Improvements in Editor</Link>
          </div>
        </div>
      )}
    </div>
  );
}
