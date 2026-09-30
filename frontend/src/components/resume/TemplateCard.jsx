import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import ResumeRenderer from './ResumeRenderer';
import { DEMO_RESUME } from './demoResume';

export default function TemplateCard({ template, selected = false, onSelect = null }) {
  const inner = (
    <>
      <div className={`relative overflow-hidden rounded-t-xl border-b border-slate-200 dark:border-slate-800 ${selected ? 'ring-2 ring-inset ring-primary-500' : ''}`}>
        <div className="pointer-events-none h-64 origin-top scale-[0.62] overflow-hidden" style={{ width: '161%', transformOrigin: 'top left' }}>
          <ResumeRenderer resume={DEMO_RESUME} templateId={template.templateId} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
        {template.isAtsFriendly && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <BadgeCheck size={13} /> ATS Friendly
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{template.name}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{template.category}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button onClick={() => onSelect(template)} className="card block w-full overflow-hidden text-left transition-all hover:-translate-y-1 hover:shadow-lg">
        {inner}
      </button>
    );
  }
  return (
    <Link to={`/resumes/create?template=${template.templateId}`} className="card group block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      {inner}
      <div className="flex items-center gap-1.5 px-4 pb-4 text-sm font-semibold text-primary-500">
        Use this template <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
