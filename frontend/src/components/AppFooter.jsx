import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Logo from './Logo';
import { GITHUB_REPO_URL } from '../utils/resume';

export default function AppFooter() {
  const [githubUrl, setGithubUrl] = useState(GITHUB_REPO_URL);
  useEffect(() => {
    if (githubUrl) return;
    api.get('/config/public').then(({ data }) => {
      const raw = String(data?.githubRepositoryUrl || '').trim();
      if (raw) { try { const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`); if (url.protocol === 'https:') setGithubUrl(url.toString()); } catch {} }
    }).catch(() => {});
  }, [githubUrl]);
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2"><Logo /><p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">Create professional, ATS-friendly resumes with AI-powered writing and job analysis.</p></div>
        <div><h4 className="section-title mb-3">Product</h4><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300"><li><Link to="/dashboard">Dashboard</Link></li><li><Link to="/resumes">My Resumes</Link></li><li><Link to="/templates">Templates</Link></li><li><Link to="/ats-analysis">ATS Analysis</Link></li></ul></div>
        <div><h4 className="section-title mb-3">Legal</h4><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300"><li><Link to="/terms">Terms &amp; Conditions</Link></li><li><Link to="/privacy">Privacy Policy</Link></li></ul></div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-slate-500 dark:text-slate-400 sm:px-6"><p>© {new Date().getFullYear()} Smart Resume Designer. All rights reserved.</p>{githubUrl ? <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-medium hover:text-slate-900 dark:hover:text-white"><Github size={19}/>GitHub</a> : <span className="inline-flex items-center gap-2 opacity-50"><Github size={19}/>GitHub link not configured</span>}</div></div>
    </footer>
  );
}
