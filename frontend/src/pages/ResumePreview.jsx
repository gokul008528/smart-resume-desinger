import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Printer, FileDown, Share2, Link2, Loader2, ArrowLeft } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import ResumeRenderer, { templateName } from '../components/resume/ResumeRenderer';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';

export default function ResumePreview() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/resumes/${id}`)
      .then(({ data }) => setResume(data.data))
      .catch((err) => setError(getErrorMessage(err, 'Could not load resume.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    // Browser print preserves the template layout with selectable text.
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.info('Use the print dialog to “Save as PDF” — your template layout and selectable text are preserved.');
    window.print();
  };

  const toggleSharing = async () => {
    setSharing(true);
    try {
      if (resume.isPublic) {
        await api.delete(`/resumes/${id}/share`);
        setResume({ ...resume, isPublic: false, publicSlug: '' });
        toast.success('Public sharing disabled.');
      } else {
        const { data } = await api.post(`/resumes/${id}/share`, {});
        setResume({ ...resume, isPublic: true, publicSlug: data.data.publicSlug });
        toast.success('Public link created.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update sharing.'));
    } finally {
      setSharing(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/resume/${resume.publicSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Public link copied.');
    } catch {
      toast.error('Could not copy. Select and copy the link manually.');
    }
  };

  if (loading) return <LoadingPage message="Loading preview…" />;
  if (error || !resume) return <ErrorPage title="Resume not found" message={error || 'This resume does not exist or you do not have access to it.'} />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/resumes" className="btn-ghost !px-2"><ArrowLeft size={17} /> All Resumes</Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/resumes/${id}/edit`} className="btn-secondary"><Pencil size={16} /> Edit</Link>
          <button onClick={handlePrint} className="btn-secondary"><Printer size={16} /> Print</button>
          <button onClick={handleDownloadPdf} className="btn-primary"><FileDown size={16} /> Download PDF</button>
        </div>
      </div>

      <div className="print:hidden">
        <h1 className="text-2xl font-extrabold tracking-tight">{resume.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {resume.targetRole || 'No target role'} • Template: {templateName(resume.templateId)}
        </p>
      </div>

      <div className="card p-4 print:hidden sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Share2 size={19} className="text-primary-500" />
            <div>
              <p className="text-sm font-bold">Public sharing {resume.isPublic ? 'is ON' : 'is OFF'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {resume.isPublic ? 'Anyone with the link can view this resume.' : 'Only you can see this resume.'}
              </p>
            </div>
          </div>
          <button onClick={toggleSharing} className={resume.isPublic ? 'btn-secondary' : 'btn-primary'} disabled={sharing}>
            {sharing && <Loader2 size={15} className="animate-spin" />}
            {resume.isPublic ? 'Disable Sharing' : 'Enable Sharing'}
          </button>
        </div>
        {resume.isPublic && resume.publicSlug && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <Link2 size={15} className="shrink-0 text-slate-400" />
            <code className="min-w-0 flex-1 truncate text-xs">{window.location.origin}/resume/{resume.publicSlug}</code>
            <button onClick={copyLink} className="btn-secondary !py-1.5 !text-xs">Copy Link</button>
            <a href={`/resume/${resume.publicSlug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-1.5 !text-xs">Open</a>
          </div>
        )}
      </div>

      <div id="resume-print-area">
        <ResumeRenderer resume={resume} templateId={resume.templateId} />
      </div>
    </div>
  );
}
