import { useEffect, useState } from 'react';
import TemplateCard from '../components/resume/TemplateCard';
import { TEMPLATE_META } from '../components/resume/ResumeRenderer';
import api from '../services/api';

export default function Templates() {
  const [templates, setTemplates] = useState(TEMPLATE_META);

  useEffect(() => {
    // Prefer the live catalog from the backend; fall back to the bundled list.
    api.get('/templates').then(({ data }) => {
      if (data?.data?.length) setTemplates(data.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">Templates</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Pick a design that fits the role</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Every template works with the same content — switch anytime without losing a word. Look for the ATS Friendly badge for strict applicant systems.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <TemplateCard key={t.templateId} template={t} />
        ))}
      </div>
    </div>
  );
}
