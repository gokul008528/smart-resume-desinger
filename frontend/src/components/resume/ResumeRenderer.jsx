
const SECTION_LABELS = {
  summary: 'Professional Summary',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
};

function visibleSections(resume) {
  const order = resume.sectionOrder?.length
    ? resume.sectionOrder
    : Object.keys(SECTION_LABELS).map((id) => ({ id, visible: true }));
  return order.filter((s) => s.visible !== false);
}

function hasContent(resume, id) {
  switch (id) {
    case 'summary': return Boolean(resume.summary?.trim());
    case 'skills': return (resume.skills || []).length > 0;
    case 'experience': return (resume.experience || []).length > 0;
    case 'projects': return (resume.projects || []).length > 0;
    case 'education': return (resume.education || []).length > 0;
    case 'certifications': return (resume.certifications || []).length > 0;
    case 'achievements': return (resume.achievements || []).length > 0;
    case 'languages': return (resume.languages || []).length > 0;
    default: {
      if (id.startsWith('custom-')) {
        const c = (resume.customSections || []).find((s) => s.id === id);
        return Boolean(c && (c.title || (c.items || []).length));
      }
      return false;
    }
  }
}

const dateRange = (e) => {
  const start = e.startDate || '';
  const end = e.current ? 'Present' : e.endDate || '';
  return [start, end].filter(Boolean).join(' – ');
};


function SectionBody({ id, resume, accent = '#2563eb', compact = false }) {
  const mb = compact ? 'mb-2' : 'mb-3';
  switch (id) {
    case 'summary':
      return <p className="whitespace-pre-line">{resume.summary}</p>;
    case 'skills':
      return <p>{(resume.skills || []).join('  •  ')}</p>;
    case 'experience':
      return (
        <div className="space-y-3">
          {(resume.experience || []).map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{e.role}{e.company ? ` — ${e.company}` : ''}</p>
                <span className="shrink-0 text-xs text-slate-500">{dateRange(e)}</span>
              </div>
              {e.location && <p className="text-xs text-slate-500">{e.location}</p>}
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {(e.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    case 'projects':
      return (
        <div className="space-y-2.5">
          {(resume.projects || []).map((pr) => (
            <div key={pr.id}>
              <p className="font-semibold">
                {pr.name}
                {pr.technologies && <span className="font-normal text-slate-500"> — {pr.technologies}</span>}
              </p>
              {pr.description && <p className="whitespace-pre-line">{pr.description}</p>}
              {pr.link && <a className="text-xs underline underline-offset-2" style={{ color: accent }} href={/^https?:\/\//i.test(pr.link) ? pr.link : `https://${pr.link}`} target="_blank" rel="noreferrer">{pr.linkLabel || 'Project Link'}</a>}
            </div>
          ))}
        </div>
      );
    case 'education':
      return (
        <div className="space-y-2">
          {(resume.education || []).map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{[e.degree, e.field].filter(Boolean).join(', ') || e.school}</p>
                <span className="shrink-0 text-xs text-slate-500">{dateRange(e)}</span>
              </div>
              <p className="text-slate-600">{e.school}</p>
              {e.description && <p className={mb}>{e.description}</p>}
            </div>
          ))}
        </div>
      );
    case 'certifications':
    case 'achievements': {
      const items = id === 'certifications' ? resume.certifications : resume.achievements;
      return (
        <ul className="list-disc space-y-0.5 pl-5">
          {(items || []).map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.title}</span>
              {c.detail ? ` — ${c.detail}` : ''}{c.date ? ` (${c.date})` : ''}
            </li>
          ))}
        </ul>
      );
    }
    case 'languages':
      return <p>{(resume.languages || []).join('  •  ')}</p>;
    default: {
      if (id.startsWith('custom-')) {
        const c = (resume.customSections || []).find((s) => s.id === id);
        if (!c) return null;
        return (
          <ul className="list-disc space-y-0.5 pl-5">
            {(c.items || []).map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        );
      }
      return null;
    }
  }
}

function contactLine(p) {
  return [
    p.email, p.phone, p.location,
    p.linkedin ? `${p.linkedinLabel || 'LinkedIn'}: ${p.linkedin}` : '',
    p.github ? `${p.githubLabel || 'GitHub'}: ${p.github}` : '',
    p.portfolio ? `${p.portfolioLabel || 'Portfolio'}: ${p.portfolio}` : '',
  ].filter(Boolean);
}

// ---------- Template 1: Classic ATS ----------
function ClassicATS({ resume }) {
  const p = resume.personalInfo || {};
  return (
    <div className="p-8 sm:p-10" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="border-b-2 border-slate-800 pb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{p.fullName || 'Your Name'}</h1>
        {(p.title || resume.targetRole) && <p className="mt-0.5 font-medium">{p.title || resume.targetRole}</p>}
        <p className="mt-1 text-xs text-slate-600">{contactLine(p).join('  |  ')}</p>
      </div>
      {visibleSections(resume).filter((s) => hasContent(resume, s.id)).map((s) => (
        <div key={s.id} className="mt-4">
          <h2 className="border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-widest text-slate-800">
            {s.id.startsWith('custom-') ? ((resume.customSections || []).find((c) => c.id === s.id)?.title || 'Additional') : SECTION_LABELS[s.id]}
          </h2>
          <div className="mt-2"><SectionBody id={s.id} resume={resume} accent="#1e293b" /></div>
        </div>
      ))}
    </div>
  );
}

// ---------- Template 2: Modern Professional ----------
function ModernProfessional({ resume }) {
  const p = resume.personalInfo || {};
  const accent = '#2563eb';
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="px-8 pb-5 pt-7 text-white sm:px-10" style={{ background: accent }}>
        <h1 className="text-2xl font-bold">{p.fullName || 'Your Name'}</h1>
        {(p.title || resume.targetRole) && <p className="mt-0.5 font-medium opacity-90">{p.title || resume.targetRole}</p>}
        <p className="mt-2 text-xs opacity-85">{contactLine(p).join('   •   ')}</p>
      </div>
      <div className="px-8 py-5 sm:px-10">
        {visibleSections(resume).filter((s) => hasContent(resume, s.id)).map((s) => (
          <div key={s.id} className="mt-4 first:mt-0">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: accent }}>
              <span className="inline-block h-3.5 w-1 rounded" style={{ background: accent }} />
              {s.id.startsWith('custom-') ? ((resume.customSections || []).find((c) => c.id === s.id)?.title || 'Additional') : SECTION_LABELS[s.id]}
            </h2>
            <div className="mt-1.5"><SectionBody id={s.id} resume={resume} accent={accent} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Template 3: Minimal ----------
function Minimal({ resume }) {
  const p = resume.personalInfo || {};
  return (
    <div className="px-10 py-9 sm:px-12" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <h1 className="text-3xl font-light tracking-tight">{p.fullName || 'Your Name'}</h1>
      {(p.title || resume.targetRole) && <p className="mt-1 text-slate-500">{p.title || resume.targetRole}</p>}
      <p className="mt-2 text-xs text-slate-500">{contactLine(p).join('  ·  ')}</p>
      {visibleSections(resume).filter((s) => hasContent(resume, s.id)).map((s) => (
        <div key={s.id} className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {s.id.startsWith('custom-') ? ((resume.customSections || []).find((c) => c.id === s.id)?.title || 'Additional') : SECTION_LABELS[s.id]}
          </h2>
          <div className="mt-2"><SectionBody id={s.id} resume={resume} accent="#64748b" /></div>
        </div>
      ))}
    </div>
  );
}

// ---------- Template 4: Corporate (sidebar) ----------
function Corporate({ resume }) {
  const p = resume.personalInfo || {};
  const sidebarSections = ['skills', 'education', 'languages', 'certifications'];
  const mainSections = visibleSections(resume).filter((s) => !sidebarSections.includes(s.id) && hasContent(resume, s.id));
  const sideSections = visibleSections(resume).filter((s) => sidebarSections.includes(s.id) && hasContent(resume, s.id));
  return (
    <div className="flex" style={{ fontFamily: 'Arial, sans-serif', minHeight: 600 }}>
      <div className="w-[32%] shrink-0 px-5 py-7 text-white" style={{ background: '#1e3a5f' }}>
        <h1 className="text-xl font-bold leading-tight">{p.fullName || 'Your Name'}</h1>
        {(p.title || resume.targetRole) && <p className="mt-1 text-xs font-medium opacity-80">{p.title || resume.targetRole}</p>}
        <div className="mt-3 space-y-0.5 text-[11px] opacity-85">
          {contactLine(p).map((c, i) => <p key={i} className="break-words">{c}</p>)}
        </div>
        {sideSections.map((s) => (
          <div key={s.id} className="mt-5">
            <h2 className="border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-wider">{SECTION_LABELS[s.id]}</h2>
            <div className="mt-1.5 text-xs leading-relaxed"><SectionBody id={s.id} resume={resume} accent="#fff" compact /></div>
          </div>
        ))}
      </div>
      <div className="flex-1 px-6 py-7">
        {mainSections.map((s) => (
          <div key={s.id} className="mt-4 first:mt-0">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
              {s.id.startsWith('custom-') ? ((resume.customSections || []).find((c) => c.id === s.id)?.title || 'Additional') : SECTION_LABELS[s.id]}
            </h2>
            <div className="mt-1"><SectionBody id={s.id} resume={resume} accent="#1e3a5f" compact /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Template 5: Creative ----------
function Creative({ resume }) {
  const p = resume.personalInfo || {};
  const accent = '#7c3aed';
  const soft = '#f5f3ff';
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="flex items-center justify-between px-8 py-6 sm:px-10" style={{ background: soft }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: accent }}>{p.fullName || 'Your Name'}</h1>
          {(p.title || resume.targetRole) && <p className="mt-0.5 font-medium text-slate-600">{p.title || resume.targetRole}</p>}
        </div>
        <div className="hidden text-right text-[11px] text-slate-500 sm:block">
          {contactLine(p).slice(0, 4).map((c, i) => <p key={i}>{c}</p>)}
        </div>
      </div>
      <div className="px-8 py-5 sm:px-10">
        <p className="text-[11px] text-slate-500 sm:hidden">{contactLine(p).join('  •  ')}</p>
        {visibleSections(resume).filter((s) => hasContent(resume, s.id)).map((s) => (
          <div key={s.id} className="mt-4 rounded-lg px-4 py-3" style={{ background: '#fafafa', borderLeft: `3px solid ${accent}` }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
              {s.id.startsWith('custom-') ? ((resume.customSections || []).find((c) => c.id === s.id)?.title || 'Additional') : SECTION_LABELS[s.id]}
            </h2>
            <div className="mt-1.5"><SectionBody id={s.id} resume={resume} accent={accent} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ---------- Template 6: Executive ----------
function Executive({ resume }) {
  const p = resume.personalInfo || {};
  return <div className="px-9 py-8 sm:px-11" style={{ fontFamily: 'Georgia, serif' }}>
    <div className="flex flex-col justify-between gap-3 border-b-4 border-slate-900 pb-5 sm:flex-row sm:items-end">
      <div><h1 className="text-3xl font-bold tracking-tight">{p.fullName || 'Your Name'}</h1><p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">{p.title || resume.targetRole || 'Professional'}</p></div>
      <p className="text-right text-xs leading-5 text-slate-600">{contactLine(p).join(' • ')}</p>
    </div>
    {visibleSections(resume).filter(s => hasContent(resume,s.id)).map(s => <div key={s.id} className="mt-5"><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">{s.id.startsWith('custom-') ? ((resume.customSections||[]).find(c=>c.id===s.id)?.title||'Additional') : SECTION_LABELS[s.id]}</h2><div className="mt-2 border-l-2 border-slate-300 pl-4"><SectionBody id={s.id} resume={resume} accent="#111827" /></div></div>)}
  </div>;
}

// ---------- Template 7: Tech Focus ----------
function TechFocus({ resume }) {
  const p = resume.personalInfo || {};
  return <div className="p-7 sm:p-9" style={{ fontFamily: 'Arial, sans-serif' }}>
    <div className="rounded-xl bg-slate-900 px-6 py-5 text-white"><h1 className="text-2xl font-extrabold">{p.fullName || 'Your Name'}</h1><p className="mt-1 text-sm text-slate-300">{p.title || resume.targetRole}</p><p className="mt-2 text-[11px] text-slate-400">{contactLine(p).join('  |  ')}</p></div>
    {visibleSections(resume).filter(s=>hasContent(resume,s.id)).map(s => <div key={s.id} className="mt-5"><h2 className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">{s.id.startsWith('custom-') ? ((resume.customSections||[]).find(c=>c.id===s.id)?.title||'Additional') : SECTION_LABELS[s.id]}</h2><div className="mt-2 text-sm"><SectionBody id={s.id} resume={resume} accent="#0f172a" compact /></div></div>)}
  </div>;
}

// ---------- Template 8: Elegant ----------
function Elegant({ resume }) {
  const p = resume.personalInfo || {};
  const accent = '#8b5e3c';
  return <div className="px-10 py-9 sm:px-12" style={{ fontFamily: 'Georgia, serif' }}>
    <div className="text-center"><div className="mx-auto h-1 w-14" style={{background:accent}}/><h1 className="mt-3 text-3xl font-semibold">{p.fullName || 'Your Name'}</h1><p className="mt-1 italic text-slate-500">{p.title || resume.targetRole}</p><p className="mt-2 text-xs text-slate-500">{contactLine(p).join('  ·  ')}</p></div>
    {visibleSections(resume).filter(s=>hasContent(resume,s.id)).map(s => <div key={s.id} className="mt-6"><h2 className="text-center text-xs font-bold uppercase tracking-[0.25em]" style={{color:accent}}>{s.id.startsWith('custom-') ? ((resume.customSections||[]).find(c=>c.id===s.id)?.title||'Additional') : SECTION_LABELS[s.id]}</h2><div className="mx-auto mt-2 max-w-3xl text-sm"><SectionBody id={s.id} resume={resume} accent={accent} /></div></div>)}
  </div>;
}

// ---------- Template 9: Compact ATS ----------
function CompactATS({ resume }) {
  const p = resume.personalInfo || {};
  return <div className="px-6 py-5 text-[12px] leading-snug sm:px-8" style={{ fontFamily: 'Arial, sans-serif' }}>
    <div className="border-b border-slate-800 pb-3"><h1 className="text-xl font-bold">{p.fullName || 'Your Name'}</h1><p className="font-medium">{p.title || resume.targetRole}</p><p className="text-[10px] text-slate-500">{contactLine(p).join(' | ')}</p></div>
    <div className="grid grid-cols-1 gap-x-7 sm:grid-cols-2">{visibleSections(resume).filter(s=>hasContent(resume,s.id)).map(s => <div key={s.id} className="mt-3"><h2 className="border-b border-slate-300 pb-0.5 text-[10px] font-bold uppercase tracking-widest">{s.id.startsWith('custom-') ? ((resume.customSections||[]).find(c=>c.id===s.id)?.title||'Additional') : SECTION_LABELS[s.id]}</h2><div className="mt-1"><SectionBody id={s.id} resume={resume} accent="#334155" compact /></div></div>)}</div>
  </div>;
}

// ---------- Template 10: Bold Modern ----------
function BoldModern({ resume }) {
  const p = resume.personalInfo || {};
  const accent = '#0f766e';
  return <div style={{fontFamily:'Inter, Arial, sans-serif'}}>
    <div className="relative overflow-hidden px-8 py-7 text-white" style={{background:accent}}><div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10"/><div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Resume</p><h1 className="mt-1 text-3xl font-black">{p.fullName || 'Your Name'}</h1><p className="mt-1 font-medium">{p.title || resume.targetRole}</p><p className="mt-2 text-xs text-white/80">{contactLine(p).join('  •  ')}</p></div></div>
    <div className="px-8 py-6">{visibleSections(resume).filter(s=>hasContent(resume,s.id)).map(s=><div key={s.id} className="mb-5"><h2 className="text-sm font-black uppercase tracking-wider" style={{color:accent}}>{s.id.startsWith('custom-') ? ((resume.customSections||[]).find(c=>c.id===s.id)?.title||'Additional') : SECTION_LABELS[s.id]}</h2><div className="mt-1.5"><SectionBody id={s.id} resume={resume} accent={accent}/></div></div>)}</div>
  </div>;
}

export const TEMPLATE_RENDERERS = {
  'classic-ats': ClassicATS,
  'modern-professional': ModernProfessional,
  minimal: Minimal,
  corporate: Corporate,
  creative: Creative,
  executive: Executive,
  'tech-focus': TechFocus,
  elegant: Elegant,
  'compact-ats': CompactATS,
  'bold-modern': BoldModern,
};

export const TEMPLATE_META = [
  { templateId: 'classic-ats', name: 'Classic ATS', description: 'Single-column, parser-safe layout recruiters trust.', category: 'ATS', isAtsFriendly: true },
  { templateId: 'modern-professional', name: 'Modern Professional', description: 'Clean two-tone header with a contemporary feel.', category: 'Professional', isAtsFriendly: true },
  { templateId: 'minimal', name: 'Minimal', description: 'Lots of whitespace, elegant typography, zero clutter.', category: 'Minimal', isAtsFriendly: true },
  { templateId: 'corporate', name: 'Corporate', description: 'Structured sidebar layout for business roles.', category: 'Professional', isAtsFriendly: false },
  { templateId: 'creative', name: 'Creative', description: 'Bold accent styling for design and media roles.', category: 'Creative', isAtsFriendly: false },
  { templateId: 'executive', name: 'Executive', description: 'Premium editorial layout for senior and management profiles.', category: 'Executive', isAtsFriendly: true },
  { templateId: 'tech-focus', name: 'Tech Focus', description: 'Compact developer-first layout for technical resumes.', category: 'Technology', isAtsFriendly: true },
  { templateId: 'elegant', name: 'Elegant', description: 'Refined serif typography for polished professional profiles.', category: 'Elegant', isAtsFriendly: true },
  { templateId: 'compact-ats', name: 'Compact ATS', description: 'Dense, space-efficient format for one-page resumes.', category: 'ATS', isAtsFriendly: true },
  { templateId: 'bold-modern', name: 'Bold Modern', description: 'Strong visual hierarchy for modern product and business roles.', category: 'Modern', isAtsFriendly: false },
];

export function templateName(id) {
  return TEMPLATE_META.find((t) => t.templateId === id)?.name || 'Classic ATS';
}

export default function ResumeRenderer({ resume, templateId }) {
  const Renderer = TEMPLATE_RENDERERS[templateId || resume?.templateId] || ClassicATS;
  return (
    <div className="resume-doc min-h-[600px] w-full overflow-hidden rounded-lg bg-white shadow-md">
      <Renderer resume={resume} />
    </div>
  );
}
