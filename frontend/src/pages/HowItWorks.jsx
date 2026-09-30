import { Link } from 'react-router-dom';
import { UserPlus, PencilLine, Wand2, Send, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: UserPlus, title: '1. Create your profile', desc: 'Sign up with email or Google in under a minute. Add your background once — name, title, skills, and links — and reuse it across every resume you create.' },
  { icon: PencilLine, title: '2. Add your experience and skills', desc: 'Use the guided builder to add your summary, experience, education, projects, and more. Drag-and-drop to reorder sections and watch the live preview update instantly.' },
  { icon: Wand2, title: '3. Improve your resume with AI', desc: 'Generate a professional summary, polish bullet points, discover missing skills, and run ATS analysis. Paste a job description to tailor keywords for each application.' },
  { icon: Send, title: '4. Download and share your resume', desc: 'Export a crisp PDF, print directly, or publish a public link for recruiters. Keep versions for every role and update anytime.' },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">How It Works</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Four steps to a standout resume</h1>
      </div>
      <div className="mt-10 space-y-5">
        {STEPS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card flex gap-5 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
              <Icon size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link to="/signup" className="btn-primary !px-7 !py-3 !text-base">Start Step 1 — It&apos;s Free <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}
