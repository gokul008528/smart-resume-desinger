import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Pencil, Eye, Copy, Trash2, FileDown, Search } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { completionPercent, timeAgo } from '../utils/resume';
import { templateName } from '../components/resume/ResumeRenderer';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/resumes');
      setResumes(data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not load resumes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = resumes.filter((r) =>
    `${r.title} ${r.targetRole}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/resumes/${id}/duplicate`);
      toast.success('Resume duplicated.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not duplicate resume.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/resumes/${deleteTarget._id}`);
      toast.success('Resume deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete resume.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Resumes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep a tailored resume for every role you target.</p>
        </div>
        <Link to="/resumes/create" className="btn-primary"><Plus size={17} /> New Resume</Link>
      </div>

      <div className="relative max-w-md">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input !pl-10" placeholder="Search resumes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={query ? 'No matching resumes' : 'No resumes yet'}
          message={query ? 'Try a different search.' : 'Create your first resume to get started.'}
          action={!query && <Link to="/resumes/create" className="btn-primary"><Plus size={16} /> Create Resume</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const pct = completionPercent(r);
            return (
              <div key={r._id} className="card flex flex-col p-5 transition-all hover:shadow-md">
                <h3 className="truncate font-bold">{r.title}</h3>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{r.targetRole || 'No target role'}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p>Template: <span className="font-medium text-slate-700 dark:text-slate-200">{templateName(r.templateId)}</span></p>
                  <p>Updated {timeAgo(r.updatedAt)}</p>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Completion</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button onClick={() => navigate(`/resumes/${r._id}/edit`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs"><Pencil size={14} /> Edit</button>
                  <button onClick={() => navigate(`/resumes/${r._id}/preview`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs"><Eye size={14} /> Preview</button>
                  <button onClick={() => handleDuplicate(r._id)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Duplicate"><Copy size={14} /></button>
                  <button onClick={() => navigate(`/resumes/${r._id}/preview`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Download PDF"><FileDown size={14} /></button>
                  <button onClick={() => setDeleteTarget(r)} className="btn-secondary !px-2.5 !py-1.5 !text-xs !text-red-600" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete resume?"
        message={`"${deleteTarget?.title}" and all its versions will be permanently deleted. This cannot be undone.`}
      />
    </div>
  );
}
