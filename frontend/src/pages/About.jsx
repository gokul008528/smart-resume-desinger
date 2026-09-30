import { Target, Users, HeartHandshake, Mail } from 'lucide-react';
import { GITHUB_REPO_URL, openGithubRepo } from '../utils/resume';
import { Github } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">About Us</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Helping you get noticed</h1>
      </div>

      <div className="card mt-8 p-6 sm:p-8">
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-white">Smart Resume Designer</strong> was built with a simple goal: help students, freshers, and professionals create resumes that actually get read. Most applications are filtered by automated tracking systems before a human ever sees them — so we combined guided editing, honest AI writing assistance, and clear ATS feedback into one workspace anyone can use.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
          Whether you&apos;re applying for your first internship or your tenth role, Smart Resume Designer helps you present your real experience in the strongest possible light — without inventing facts, without design skills, and without the formatting headaches.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {[
          { icon: Target, title: 'Our Mission', desc: 'Make professional, ATS-friendly resumes accessible to every job seeker.' },
          { icon: Users, title: 'Who We Help', desc: 'Students, freshers, career switchers, and experienced professionals alike.' },
          { icon: HeartHandshake, title: 'Our Promise', desc: 'Your content stays yours. Honest AI, transparent checks, no dark patterns.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-500/10">
              <Icon size={20} />
            </span>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div id="contact" className="card mt-6 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Contact</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Questions, feedback, or support requests? Reach out — we&apos;d love to hear from you.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="mailto:support@smartresumedesigner.app" className="btn-secondary">
            <Mail size={16} /> support@smartresumedesigner.app
          </a>
          {GITHUB_REPO_URL && (
            <button onClick={openGithubRepo} className="btn-secondary">
              <Github size={16} /> GitHub Repository
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
