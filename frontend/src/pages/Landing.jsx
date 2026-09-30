import { Link } from 'react-router-dom';
import {
  Sparkles, ScanSearch, LayoutTemplate, Eye, Copy, FileDown,
  Briefcase, Share2, ArrowRight, Check, UserPlus, PencilLine, Wand2, Send,
} from 'lucide-react';
import ResumeRenderer from '../components/resume/ResumeRenderer';
import { DEMO_RESUME } from '../components/resume/demoResume';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Sparkles, title: 'AI Resume Writing', desc: 'Generate summaries, bullet points, and skills with Gemini AI assistance.' },
  { icon: ScanSearch, title: 'ATS Analysis', desc: 'Score your resume against parser-friendly checks and fix issues fast.' },
  { icon: LayoutTemplate, title: 'Professional Templates', desc: 'Ten polished templates — from strict ATS-safe to modern creative layouts.' },
  { icon: Eye, title: 'Real-Time Preview', desc: 'Watch your resume update live as you type, on any device.' },
  { icon: Copy, title: 'Multiple Versions', desc: 'Keep tailored versions for every role without losing history.' },
  { icon: FileDown, title: 'PDF Export', desc: 'Download crisp, selectable-text PDFs that preserve your layout.' },
  { icon: Briefcase, title: 'Job-Specific Suggestions', desc: 'Paste a job description and get keyword and gap analysis.' },
  { icon: Share2, title: 'Public Resume Sharing', desc: 'Share a clean public link with recruiters — toggle anytime.' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create your profile', desc: 'Sign up in seconds and tell us about your background.' },
  { icon: PencilLine, title: 'Add experience & skills', desc: 'Fill guided sections with live preview as you go.' },
  { icon: Wand2, title: 'Improve with AI', desc: 'Polish wording, add keywords, and run ATS checks.' },
  { icon: Send, title: 'Download & share', desc: 'Export PDF or share a public link with employers.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const cta = isAuthenticated ? '/dashboard' : '/signup';

  return (
    <div>
      {/* HERO */}
      <section className="overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              <Sparkles size={13} /> AI-Powered Resume Builder
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Build a Resume That <span className="text-primary-500">Gets Noticed.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Create professional, ATS-friendly resumes with AI assistance. Guided editing, real-time preview, smart suggestions, and one-click PDF export.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={cta} className="btn-primary !px-6 !py-3 !text-base">
                Create Your Resume <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              {['Free to start', 'ATS-friendly', 'No design skills needed'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={16} className="text-green-500" /> {t}
                </span>
              ))}
            </div>
          </div>
          <div className="animate-fade-up stagger-2 relative mx-auto w-full max-w-md">
            <div className="pointer-events-none max-h-[520px] overflow-hidden rounded-xl border border-slate-200 shadow-2xl dark:border-slate-700">
              <ResumeRenderer resume={DEMO_RESUME} templateId="modern-professional" />
            </div>
            <div className="card absolute -left-4 top-8 hidden animate-fade-up items-center gap-2 px-3 py-2 text-sm font-semibold shadow-lg stagger-3 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40">92</span>
              ATS Score
            </div>
            <div className="card absolute -right-3 bottom-10 hidden animate-fade-up items-center gap-2 px-3 py-2 text-sm font-semibold shadow-lg stagger-4 sm:flex">
              <Sparkles size={18} className="text-primary-500" /> AI Improved
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">Features</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Everything you need to stand out</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">A complete toolkit for building, improving, and sharing your resume.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`card animate-fade-up p-5 transition-all hover:-translate-y-1 hover:shadow-md stagger-${(i % 4) + 1}`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                <Icon size={22} />
              </span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">How It Works</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">From blank page to hired in 4 steps</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card relative p-5 pt-7">
                <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">{i + 1}</span>
                <Icon size={24} className="text-primary-500" />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">About Us</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Resumes that open doors</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Smart Resume Designer helps students, freshers, and professionals create better resumes — faster. Hiring systems filter most resumes before a human ever reads them, so we built guided editing, AI writing assistance, and ATS analysis into one simple workspace.
            </p>
            <ul className="mt-5 space-y-2.5">
              {['Guided sections for every part of your resume', 'AI that improves wording without inventing facts', 'Honest ATS feedback with actionable fixes'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check size={17} className="mt-0.5 shrink-0 text-green-500" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn-secondary mt-6">Learn More About Us</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '5+', label: 'Professional templates' },
              { value: '15+', label: 'ATS checks' },
              { value: '100%', label: 'Content stays yours' },
              { value: '24/7', label: 'Access anywhere' },
            ].map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <p className="text-3xl font-extrabold text-primary-500">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="card overflow-hidden bg-slate-900 !border-slate-900 p-8 text-white dark:!border-slate-800 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-300">
                <Sparkles size={13} /> Powered by Gemini AI
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Your personal resume coach</h2>
              <p className="mt-3 text-slate-300">
                Gemini AI helps you write stronger summaries, polish bullet points, discover missing skills, and tailor your resume to each job description.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-200">
                {['Professional summary generation', 'Bullet-point improvement that never invents facts', 'Skill & keyword suggestions per role', 'Job description match analysis'].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check size={17} className="mt-0.5 shrink-0 text-green-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white/5 p-5 font-mono text-sm leading-relaxed backdrop-blur">
              <p className="text-slate-400">You: “Worked on website frontend”</p>
              <div className="mt-3 rounded-lg bg-white/10 p-4 text-slate-100">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-300">
                  <Sparkles size={13} /> AI suggestion
                </p>
                <p>• Built responsive frontend pages with React and Tailwind CSS</p>
                <p>• Fixed UI bugs and improved cross-browser compatibility</p>
                <p>• Collaborated with the team using Git-based workflows</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-primary-500 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to build your professional resume?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100">Join thousands of job seekers creating standout resumes in minutes.</p>
          <Link to={cta} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-base font-bold text-primary-600 shadow-lg transition-transform hover:scale-105">
            Create My Resume <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
