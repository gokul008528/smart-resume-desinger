import { FileDown } from 'lucide-react';
import { TERMS_SECTIONS, legalToText } from '../utils/legal';
import { downloadTextFile } from '../utils/resume';

export default function Terms() {
  const download = () => {
    downloadTextFile('smart-resume-designer-terms.txt', legalToText('Terms & Conditions', TERMS_SECTIONS));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">Legal</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={download} className="btn-secondary"><FileDown size={16} /> Download Terms &amp; Conditions</button>
      </div>
      <div className="card mt-8 space-y-6 p-6 sm:p-8">
        <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          This document explains the terms of using Smart Resume Designer. It is structured for clarity and is not professional legal advice.
        </p>
        {TERMS_SECTIONS.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold">{i + 1}. {s.title}</h2>
            <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
