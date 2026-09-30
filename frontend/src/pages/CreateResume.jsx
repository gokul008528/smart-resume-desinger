import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TEMPLATE_META } from '../components/resume/ResumeRenderer';
import TemplateCard from '../components/resume/TemplateCard';

export default function CreateResume() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [templateId, setTemplateId] = useState(searchParams.get('template') || 'classic-ats');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Give your resume a name first.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/resumes', { title: title.trim(), targetRole: targetRole.trim(), templateId });
      toast.success('Resume created.');
      navigate(`/resumes/${data.data._id}/edit`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create resume.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Create a new resume</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Name it, pick a target role, and choose a starting template.</p>
      </div>

      <form onSubmit={handleCreate} className="card grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Resume name *</label>
          <input id="title" className="input" placeholder="e.g. Frontend Developer Resume" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="role">Target role</label>
          <input id="role" className="input" placeholder="e.g. Frontend Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} maxLength={120} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} Create & Start Editing <ArrowRight size={16} />
          </button>
        </div>
      </form>

      <div>
        <h2 className="font-bold">Choose a template</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">You can switch templates anytime without losing content.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_META.map((t) => (
            <TemplateCard key={t.templateId} template={t} selected={templateId === t.templateId} onSelect={(tpl) => setTemplateId(tpl.templateId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
