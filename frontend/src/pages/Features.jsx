import { Link } from 'react-router-dom';
import { Sparkles, ScanSearch, LayoutTemplate, Eye, Copy, FileDown, Briefcase, Share2, ArrowRight, History, MoonStar, ShieldCheck, Smartphone } from 'lucide-react';

const GROUPS = [
  {
    title: 'Create',
    features: [
      { icon: PencilIcon, title: 'Guided Resume Builder', desc: 'Structured sections for summary, skills, experience, education, projects, certifications, and more — with drag-and-drop ordering.' },
      { icon: LayoutTemplate, title: '5 Professional Templates', desc: 'Switch designs instantly without losing content — from strict ATS-safe layouts to creative styles.' },
      { icon: Eye, title: 'Real-Time Preview', desc: 'See exactly what recruiters see as you type, with a print-perfect layout.' },
    ],
  },
  {
    title: 'Improve',
    features: [
      { icon: Sparkles, title: 'AI Resume Writing', desc: 'Gemini-powered summaries, bullet improvements, skill suggestions, and rewrites — honest, never fabricated.' },
      { icon: ScanSearch, title: 'ATS Analysis', desc: '15+ structural checks with a clear score and fixes for keywords, dates, formatting, and readability.' },
      { icon: Briefcase, title: 'Job Description Analysis', desc: 'Paste any job post to extract required skills, keywords, and gaps versus your resume.' },
    ],
  },
  {
    title: 'Manage & Share',
    features: [
      { icon: Copy, title: 'Multiple Resumes', desc: 'Maintain tailored resumes for different roles — frontend, backend, internship, and more.' },
      { icon: History, title: 'Version History', desc: 'Snapshot versions before big edits and restore any of them with one click. Auto-backups included.' },
      { icon: FileDown, title: 'PDF Export & Print', desc: 'Download crisp PDFs with selectable text that preserve your template exactly.' },
      { icon: Share2, title: 'Public Sharing', desc: 'Publish a clean public resume link for recruiters; disable it anytime.' },
    ],
  },
  {
    title: 'Experience',
    features: [
      { icon: MoonStar, title: 'Light, Dark & System Themes', desc: 'A polished interface that adapts to your preference across every page.' },
      { icon: Smartphone, title: 'Fully Responsive', desc: 'Build and edit resumes comfortably on desktop, tablet, or mobile.' },
      { icon: ShieldCheck, title: 'Secure by Design', desc: 'Firebase authentication, verified API access, and validated uploads keep your data safe.' },
    ],
  },
];

import { PencilLine as PencilIcon } from 'lucide-react';

export default function Features() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">Features</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">A complete resume workspace</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Everything from first draft to final PDF — powered by AI and built for results.</p>
      </div>
      {GROUPS.map((group) => (
        <div key={group.title} className="mt-12">
          <h2 className="text-xl font-bold">{group.title}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 transition-all hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                  <Icon size={22} />
                </span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-14 text-center">
        <Link to="/signup" className="btn-primary !px-7 !py-3 !text-base">Get Started Free <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}
