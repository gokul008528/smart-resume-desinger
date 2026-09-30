import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Plus, ScanSearch, Sparkles, LayoutTemplate, Pencil,
  Eye, Copy, Trash2, Share2, FileDown, CheckCircle2, BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { completionPercent, timeAgo } from '../utils/resume';
import { templateName } from '../components/resume/ResumeRenderer';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [versionCounts, setVersionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { profile, firebaseUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const displayName = profile?.name || firebaseUser?.displayName || 'there';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/resumes');
      setResumes(data.data || []);
      // Fetch version counts per resume for the stats row.
      const counts = {};
      await Promise.all(
        (data.data || []).map(async (r) => {
          try {
            const v = await api.get(`/resumes/${r._id}/versions`);
            counts[r._id] = (v.data.data || []).length;
          } catch {
            counts[r._id] = 0;
          }
        })
      );
      setVersionCounts(counts);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not load your resumes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = resumes.length;
    const completed = resumes.filter((r) => completionPercent(r) >= 80).length;
    const scores = resumes.map((r) => r.lastAtsScore || 0).filter((s) => s > 0);
    const avgAts = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const versions = Object.values(versionCounts).reduce((a, b) => a + b, 0);
    return [
      { label: 'Total Resumes', value: total, icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' },
      { label: 'Resume Versions', value: versions, icon: Copy, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300' },
      { label: 'Completed Resumes', value: completed, icon: CheckCircle2, color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300' },
      { label: 'Average ATS Score', value: scores.length ? `${avgAts}` : '—', icon: BarChart3, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' },
    ];
  }, [resumes, versionCounts]);

  const chartData = useMemo(
    () => resumes.slice(0, 8).map((r) => ({
      name: (r.title || 'Untitled').slice(0, 14),
      completion: completionPercent(r),
      ats: r.lastAtsScore || 0,
    })),
    [resumes]
  );

  const userInsights = useMemo(() => {
    const skills = new Set(resumes.flatMap(r => r.skills || []).map(s => String(s).trim()).filter(Boolean));
    const roles = resumes.reduce((acc, r) => { const role = r.targetRole?.trim() || 'Not specified'; acc[role] = (acc[role] || 0) + 1; return acc; }, {});
    const roleData = Object.entries(roles).map(([name, value]) => ({ name, value }));
    const complete = resumes.filter(r => completionPercent(r) >= 80).length;
    const inProgress = resumes.filter(r => { const p = completionPercent(r); return p > 0 && p < 80; }).length;
    const empty = Math.max(resumes.length - complete - inProgress, 0);
    const timeline = [...resumes].sort((a,b) => new Date(a.updatedAt)-new Date(b.updatedAt)).slice(-8).map((r, i) => ({ name: i + 1, completion: completionPercent(r), ats: r.lastAtsScore || 0 }));
    return { skills: skills.size, roleData, statusData: [{name:'80%+ complete', value:complete}, {name:'In progress', value:inProgress}, {name:'Started', value:empty}], timeline };
  }, [resumes]);

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back, {displayName.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s an overview of your resumes and progress.</p>
        </div>
        <Link to="/resumes/create" className="btn-primary"><Plus size={17} /> Create Resume</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)
        ) : (
          stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-3 p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon size={22} />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { to: '/resumes/create', label: 'Create Resume', icon: Plus },
          { to: '/ats-analysis', label: 'Analyze Resume', icon: ScanSearch },
          { to: '/resumes', label: 'Improve with AI', icon: Sparkles },
          { to: '/templates', label: 'View Templates', icon: LayoutTemplate },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={label} to={to} className="card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-500/10">
              <Icon size={20} />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Progress chart */}
      {!loading && resumes.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold">Resume Progress</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Completion and ATS scores per resume.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="completion" name="Completion %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ats" name="ATS Score" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* User analytics */}
      {!loading && resumes.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-start justify-between"><div><h2 className="font-bold">Resume Status</h2><p className="text-sm text-slate-500">How your resume collection is progressing.</p></div><span className="text-2xl font-extrabold">{userInsights.skills}</span></div>
            <p className="text-xs text-slate-500">Unique skills across your resumes</p>
            <div className="mt-3 h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={userInsights.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3}>{userInsights.statusData.map((entry,index)=><Cell key={entry.name} fill={["#2563eb","#f59e0b","#94a3b8"][index]} />)}</Pie><Tooltip/><Legend verticalAlign="bottom" height={32}/></PieChart></ResponsiveContainer></div>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Target Role Distribution</h2><p className="text-sm text-slate-500">Roles you are preparing resumes for.</p>
            <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={userInsights.roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} label={({name,value}) => `${name}: ${value}`}>{userInsights.roleData.map((entry,index)=><Cell key={entry.name} fill={["#7c3aed","#2563eb","#0f766e","#ea580c","#db2777"][index % 5]} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Progress Flow</h2><p className="text-sm text-slate-500">Completion and ATS movement across recent resumes.</p>
            <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={userInsights.timeline}><CartesianGrid strokeDasharray="3 3" opacity={0.25}/><XAxis dataKey="name"/><YAxis domain={[0,100]}/><Tooltip/><Legend/><Line type="monotone" dataKey="completion" stroke="#2563eb" strokeWidth={2} dot={{r:3}} name="Completion"/><Line type="monotone" dataKey="ats" stroke="#16a34a" strokeWidth={2} dot={{r:3}} name="ATS"/></LineChart></ResponsiveContainer></div>
          </div>
        </div>
      )}

      {/* Resume cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Your Resumes</h2>
          {resumes.length > 0 && <Link to="/resumes" className="text-sm font-semibold text-primary-500 hover:underline">View all</Link>}
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-52" />)}
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            message="Create your first resume to get started. It only takes a few minutes."
            action={<Link to="/resumes/create" className="btn-primary"><Plus size={16} /> Create Resume</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.slice(0, 6).map((r) => {
              const pct = completionPercent(r);
              return (
                <div key={r._id} className="card flex flex-col p-5 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{r.title}</h3>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{r.targetRole || 'No target role'}</p>
                    </div>
                    {r.isPublic && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        <Share2 size={12} /> Public
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p>Template: <span className="font-medium text-slate-700 dark:text-slate-200">{templateName(r.templateId)}</span></p>
                    <p>Updated {timeAgo(r.updatedAt)}</p>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Completion</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button onClick={() => navigate(`/resumes/${r._id}/edit`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Edit"><Pencil size={14} /> Edit</button>
                    <button onClick={() => navigate(`/resumes/${r._id}/preview`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Preview"><Eye size={14} /> Preview</button>
                    <button onClick={() => handleDuplicate(r._id)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Duplicate"><Copy size={14} /></button>
                    <button onClick={() => navigate(`/resumes/${r._id}/preview`)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" title="Download PDF"><FileDown size={14} /></button>
                    <button onClick={() => setDeleteTarget(r)} className="btn-secondary !px-2.5 !py-1.5 !text-xs !text-red-600" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
