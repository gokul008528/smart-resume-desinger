import { useState } from 'react';
import { Plus, Trash2, X, Sparkles, Wand2, Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { uid } from '../../utils/resume';


export function AddButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="btn-secondary !py-2 text-sm">
      <Plus size={15} /> {label}
    </button>
  );
}

function ItemCard({ children, onDelete, label }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" aria-label={`Delete ${label}`}>
          <Trash2 size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

const grid2 = 'grid gap-3 sm:grid-cols-2';

// ---------- Personal info ----------

function DateField({ label, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="date" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
      <p className="mt-1 text-[11px] text-slate-400">Select date — DD/MM/YY</p>
    </div>
  );
}

export function PersonalInfoForm({ value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  const field = (key, label, placeholder, span = false) => (
    <div key={key} className={span ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      <input className="input" value={value[key] || ''} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} />
    </div>
  );
  return (
    <div className={grid2}>
      {field('fullName', 'Full Name', 'Jane Doe')}
      {field('title', 'Professional Title', 'e.g. Frontend Developer')}
      {field('email', 'Email', 'you@example.com')}
      {field('phone', 'Phone', '+1 (555) 000-0000')}
      {field('location', 'Location', 'City, Country')}
      {field('linkedin', 'LinkedIn URL', 'https://linkedin.com/in/you')}
      {field('github', 'GitHub URL', 'https://github.com/you')}
      {field('portfolio', 'Portfolio URL', 'https://your-site.com')}
      {field('linkedinLabel', 'LinkedIn display name', 'LinkedIn')}
      {field('githubLabel', 'GitHub display name', 'GitHub')}
      {field('portfolioLabel', 'Portfolio display name', 'Portfolio')}
    </div>
  );
}

// ---------- Summary ----------

export function SummaryForm({ value, onChange, onGenerateAI }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="label !mb-0">Professional Summary</label>
        <button type="button" onClick={onGenerateAI} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10">
          <Sparkles size={13} /> Generate with AI
        </button>
      </div>
      <textarea
        className="input min-h-28"
        rows={5}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="2–4 sentences highlighting your experience, strengths, and target role…"
        maxLength={3000}
      />
      <p className="mt-1 text-right text-xs text-slate-400">{(value || '').trim().split(/\s+/).filter(Boolean).length} words</p>
    </div>
  );
}

// ---------- Skills / Languages (tag inputs) ----------

export function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const toast = useToast();
  const add = () => {
    const s = input.trim();
    if (!s) return;
    if (value.includes(s)) {
      toast.warning('Already added.');
      return;
    }
    onChange([...value, s]);
    setInput('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="btn-secondary shrink-0"><Plus size={16} /> Add</button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {value.map((s) => (
          <span key={s} className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
            {s}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
              <X size={13} />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-slate-400">Nothing added yet.</span>}
      </div>
    </div>
  );
}

// ---------- Education ----------

const blankEducation = () => ({ id: uid(), school: '', degree: '', field: '', startDate: '', endDate: '', description: '' });

export function EducationForm({ value = [], onChange }) {
  const update = (id, patch) => onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  return (
    <div className="space-y-3">
      {value.map((e, i) => (
        <ItemCard key={e.id} label={`Education ${i + 1}`} onDelete={() => onChange(value.filter((x) => x.id !== e.id))}>
          <div className={grid2}>
            <div><label className="label">School / University</label><input className="input" value={e.school || ''} onChange={(ev) => update(e.id, { school: ev.target.value })} placeholder="State University" /></div>
            <div><label className="label">Degree</label><input className="input" value={e.degree || ''} onChange={(ev) => update(e.id, { degree: ev.target.value })} placeholder="B.S., M.S., Diploma…" /></div>
            <div><label className="label">Field of Study</label><input className="input" value={e.field || ''} onChange={(ev) => update(e.id, { field: ev.target.value })} placeholder="Computer Science" /></div>
            <div className="grid grid-cols-2 gap-3">
              <DateField label="Start" value={e.startDate} onChange={(v) => update(e.id, { startDate: v })} />
              <DateField label="End" value={e.endDate} onChange={(v) => update(e.id, { endDate: v })} />
            </div>
            <div className="sm:col-span-2"><label className="label">Description (optional)</label><textarea className="input" rows={2} value={e.description || ''} onChange={(ev) => update(e.id, { description: ev.target.value })} placeholder="Honors, relevant coursework…" /></div>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add Education" onClick={() => onChange([...value, blankEducation()])} />
    </div>
  );
}

// ---------- Experience (with per-item AI improve) ----------

const blankExperience = () => ({ id: uid(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, bullets: [] });

function BulletEditor({ bullets = [], onChange }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    if (!draft.trim()) return;
    onChange([...bullets, draft.trim()]);
    setDraft('');
  };
  return (
    <div>
      <label className="label">Bullet Points</label>
      <ul className="mb-2 space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 rounded-md bg-white p-2 text-sm dark:bg-slate-900">
            <span className="mt-0.5 text-slate-400">•</span>
            <span className="flex-1">{b}</span>
            <button type="button" onClick={() => onChange(bullets.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500" aria-label="Remove bullet">
              <X size={14} />
            </button>
          </li>
        ))}
        {bullets.length === 0 && <li className="text-xs text-slate-400">No bullets yet — add what you did in this role.</li>}
      </ul>
      <div className="flex gap-2">
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="e.g. Built responsive pages used by 10k users"
        />
        <button type="button" onClick={add} className="btn-secondary shrink-0 !px-3"><Plus size={15} /></button>
      </div>
    </div>
  );
}

export function ExperienceForm({ value = [], onChange }) {
  const toast = useToast();
  const [improvingId, setImprovingId] = useState(null);
  const [improveDrafts, setImproveDrafts] = useState({}); // expId -> raw text for AI

  const update = (id, patch) => onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const improve = async (exp) => {
    const raw = improveDrafts[exp.id];
    if (!raw?.trim()) {
      toast.warning('Type rough notes first, then click Improve with AI.');
      return;
    }
    setImprovingId(exp.id);
    try {
      const { data } = await api.post('/ai/improve', {
        text: raw,
        context: `${exp.role} at ${exp.company}`,
        mode: 'bullets',
      });
      const lines = data.data.improved.split('\n').map((l) => l.replace(/^[•\-\*\d.)\s]+/, '').trim()).filter(Boolean);
      update(exp.id, { bullets: [...(exp.bullets || []), ...lines] });
      setImproveDrafts((d) => ({ ...d, [exp.id]: '' }));
      toast.success('AI bullets added. Review and edit them as needed.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'AI improvement failed.'));
    } finally {
      setImprovingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {value.map((e, i) => (
        <ItemCard key={e.id} label={`Experience ${i + 1}`} onDelete={() => onChange(value.filter((x) => x.id !== e.id))}>
          <div className={`${grid2} mb-3`}>
            <div><label className="label">Job Title</label><input className="input" value={e.role || ''} onChange={(ev) => update(e.id, { role: ev.target.value })} placeholder="Frontend Developer" /></div>
            <div><label className="label">Company</label><input className="input" value={e.company || ''} onChange={(ev) => update(e.id, { company: ev.target.value })} placeholder="Acme Inc." /></div>
            <div><label className="label">Location</label><input className="input" value={e.location || ''} onChange={(ev) => update(e.id, { location: ev.target.value })} placeholder="Remote / City" /></div>
            <div className="grid grid-cols-2 gap-3">
              <DateField label="Start" value={e.startDate} onChange={(v) => update(e.id, { startDate: v })} />
              <DateField label="End" value={e.endDate} onChange={(v) => update(e.id, { endDate: v })} disabled={e.current} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={Boolean(e.current)} onChange={(ev) => update(e.id, { current: ev.target.checked })} className="h-4 w-4 rounded accent-blue-600" />
              I currently work here
            </label>
          </div>

          <div className="mb-3 rounded-lg border border-dashed border-primary-300 bg-primary-50/50 p-3 dark:border-primary-500/30 dark:bg-primary-500/5">
            <label className="label flex items-center gap-1.5"><Wand2 size={13} className="text-primary-500" /> Describe this role, AI polishes it</label>
            <div className="flex flex-col gap-2">
              <textarea
                className="input"
                rows={2}
                placeholder="Rough notes, e.g. Worked on website frontend, fixed bugs…"
                value={improveDrafts[e.id] || ''}
                onChange={(ev) => setImproveDrafts((d) => ({ ...d, [e.id]: ev.target.value }))}
              />
              <button type="button" onClick={() => improve(e)} className="btn-primary self-start !py-2 !text-xs" disabled={improvingId === e.id}>
                {improvingId === e.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                Improve with AI
              </button>
            </div>
          </div>

          <BulletEditor bullets={e.bullets || []} onChange={(bullets) => update(e.id, { bullets })} />
        </ItemCard>
      ))}
      <AddButton label="Add Experience" onClick={() => onChange([...value, blankExperience()])} />
    </div>
  );
}

// ---------- Projects ----------

const blankProject = () => ({ id: uid(), name: '', link: '', linkLabel: 'Project Link', technologies: '', description: '' });

export function ProjectsForm({ value = [], onChange }) {
  const update = (id, patch) => onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  return (
    <div className="space-y-3">
      {value.map((p, i) => (
        <ItemCard key={p.id} label={`Project ${i + 1}`} onDelete={() => onChange(value.filter((x) => x.id !== p.id))}>
          <div className={grid2}>
            <div><label className="label">Project Name</label><input className="input" value={p.name || ''} onChange={(e) => update(p.id, { name: e.target.value })} placeholder="TaskFlow App" /></div>
            <div><label className="label">Link name</label><input className="input" value={p.linkLabel || ''} onChange={(e) => update(p.id, { linkLabel: e.target.value })} placeholder="GitHub" /></div>
            <div><label className="label">Link URL</label><input className="input" value={p.link || ''} onChange={(e) => update(p.id, { link: e.target.value })} placeholder="https://github.com/you/project" /></div>
            <div className="sm:col-span-2"><label className="label">Technologies</label><input className="input" value={p.technologies || ''} onChange={(e) => update(p.id, { technologies: e.target.value })} placeholder="React, Firebase, Tailwind" /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={3} value={p.description || ''} onChange={(e) => update(p.id, { description: e.target.value })} placeholder="What it does, your role, outcomes…" /></div>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add Project" onClick={() => onChange([...value, blankProject()])} />
    </div>
  );
}

// ---------- Certifications / Achievements ----------

const blankSimple = () => ({ id: uid(), title: '', detail: '', date: '' });

export function SimpleListForm({ value = [], onChange, singular }) {
  const update = (id, patch) => onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <div className="space-y-3">
      {value.map((c, i) => (
        <ItemCard key={c.id} label={`${singular} ${i + 1}`} onDelete={() => onChange(value.filter((x) => x.id !== c.id))}>
          <div className={grid2}>
            <div><label className="label">Title</label><input className="input" value={c.title || ''} onChange={(e) => update(c.id, { title: e.target.value })} placeholder={singular === 'Certification' ? 'AWS Certified Developer' : 'Hackathon Winner'} /></div>
            <DateField label="Date" value={c.date} onChange={(v) => update(c.id, { date: v })} />
            <div className="sm:col-span-2"><label className="label">Details</label><input className="input" value={c.detail || ''} onChange={(e) => update(c.id, { detail: e.target.value })} placeholder="Issuer or description…" /></div>
          </div>
        </ItemCard>
      ))}
      <AddButton label={`Add ${singular}`} onClick={() => onChange([...value, blankSimple()])} />
    </div>
  );
}

// ---------- Custom sections ----------

export const blankCustomSection = (title = 'New Section') => ({ id: `custom-${uid()}`, title, items: [] });

export function CustomSectionsForm({ value = [], onChange }) {
  const [drafts, setDrafts] = useState({});
  const update = (id, patch) => onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addItem = (section) => {
    const text = (drafts[section.id] || '').trim();
    if (!text) return;
    update(section.id, { items: [...(section.items || []), text] });
    setDrafts((d) => ({ ...d, [section.id]: '' }));
  };
  return (
    <div className="space-y-3">
      {value.map((c, i) => (
        <ItemCard key={c.id} label={`Custom Section ${i + 1}`} onDelete={() => onChange(value.filter((x) => x.id !== c.id))}>
          <div className="mb-3">
            <label className="label">Section Title</label>
            <input className="input" value={c.title || ''} onChange={(e) => update(c.id, { title: e.target.value })} placeholder="e.g. Volunteer Work, Publications" maxLength={60} />
          </div>
          <ul className="mb-2 space-y-1.5">
            {(c.items || []).map((it, idx) => (
              <li key={idx} className="flex items-start gap-2 rounded-md bg-white p-2 text-sm dark:bg-slate-900">
                <span className="mt-0.5 text-slate-400">•</span>
                <span className="flex-1">{it}</span>
                <button type="button" onClick={() => update(c.id, { items: c.items.filter((_, j) => j !== idx) })} className="text-slate-400 hover:text-red-500" aria-label="Remove item">
                  <X size={14} />
                </button>
              </li>
            ))}
            {(c.items || []).length === 0 && <li className="text-xs text-slate-400">No items yet.</li>}
          </ul>
          <div className="flex gap-2">
            <input
              className="input"
              value={drafts[c.id] || ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(c); } }}
              placeholder="Add an item…"
            />
            <button type="button" onClick={() => addItem(c)} className="btn-secondary shrink-0 !px-3"><Plus size={15} /></button>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add Custom Section" onClick={() => onChange([...value, blankCustomSection()])} />
    </div>
  );
}
