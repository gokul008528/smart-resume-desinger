import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown, Eye, GripVertical, EyeOff, History, Sparkles,
  Check, Loader2, AlertCircle, LayoutTemplate, Plus, Trash2, X,
} from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import ResumeRenderer, { TEMPLATE_META, templateName } from '../components/resume/ResumeRenderer';
import TemplateCard from '../components/resume/TemplateCard';
import Modal from '../components/Modal';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import AIAssistant from '../components/ai/AIAssistant';
import VersionsManager from '../components/editor/VersionsManager';
import {
  PersonalInfoForm, SummaryForm, TagInput, EducationForm, ExperienceForm,
  ProjectsForm, SimpleListForm, CustomSectionsForm, blankCustomSection,
} from '../components/editor/SectionForms';
import { completionPercent } from '../utils/resume';

const FIXED_SECTIONS = [
  { id: 'summary', label: 'Professional Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'languages', label: 'Languages' },
];

function SortableSection({ id, label, visible, open, onToggleOpen, onToggleVisible, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={`card overflow-hidden ${isDragging ? 'shadow-lg ring-2 ring-primary-400' : ''} ${visible ? '' : 'opacity-70'}`}>
      <div className="flex items-center gap-1.5 bg-slate-50/70 px-3 py-2.5 dark:bg-slate-800/50">
        <button {...attributes} {...listeners} className="cursor-grab rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700" aria-label={`Reorder ${label}`}>
          <GripVertical size={17} />
        </button>
        <button onClick={onToggleOpen} className="flex flex-1 items-center justify-between gap-2 rounded px-1 py-0.5 text-left">
          <span className="text-sm font-bold">
            {label}
            {!visible && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">HIDDEN</span>}
          </span>
          <ChevronDown size={17} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={onToggleVisible} className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700" aria-label={visible ? `Hide ${label}` : `Show ${label}`} title={visible ? 'Hide section' : 'Show section'}>
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      {open && <div className="border-t border-slate-100 p-4 dark:border-slate-800">{children}</div>}
    </div>
  );
}

export default function ResumeEditor() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [lastSaved, setLastSaved] = useState(null);
  const [openSections, setOpenSections] = useState({ personal: true, summary: true });
  const [mobileTab, setMobileTab] = useState('edit');
  const [aiOpen, setAiOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const toast = useToast();
  const isFirstLoad = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    api.get(`/resumes/${id}`)
      .then(({ data }) => {
        setResume(data.data);
        setLastSaved(data.data.updatedAt);
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load resume.')))
      .finally(() => setLoading(false));
  }, [id]);

  const persist = useCallback(
    async (next) => {
      setSaveState('saving');
      try {
        const { data } = await api.put(`/resumes/${id}`, {
          title: next.title,
          targetRole: next.targetRole,
          templateId: next.templateId,
          personalInfo: next.personalInfo,
          summary: next.summary,
          skills: next.skills,
          education: next.education,
          experience: next.experience,
          projects: next.projects,
          certifications: next.certifications,
          achievements: next.achievements,
          languages: next.languages,
          customSections: next.customSections,
          sectionOrder: next.sectionOrder,
        });
        setSaveState('saved');
        setLastSaved(data.data.updatedAt);
      } catch {
        setSaveState('error');
      }
    },
    [id]
  );

  const debouncedPersist = useDebouncedCallback(persist, 1200);

  const update = useCallback(
    (patch) => {
      setResume((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (!isFirstLoad.current) {
          setSaveState('saving');
          debouncedPersist(next);
        }
        return next;
      });
    },
    [debouncedPersist]
  );

  useEffect(() => {
    if (resume) {
      // Skip autosave for the initial load only.
      const t = setTimeout(() => { isFirstLoad.current = false; }, 500);
      return () => clearTimeout(t);
    }
  }, [resume?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionEntries = useMemo(() => {
    if (!resume) return [];
    const order = resume.sectionOrder?.length
      ? resume.sectionOrder
      : FIXED_SECTIONS.map((s) => ({ id: s.id, visible: true }));
    const customs = (resume.customSections || []).map((c) => ({ id: c.id, visible: true, custom: true, title: c.title }));
    const orderIds = new Set(order.map((o) => o.id));
    // Append any custom sections missing from the stored order.
    const merged = [...order];
    customs.forEach((c) => {
      if (!orderIds.has(c.id)) merged.push({ id: c.id, visible: true });
    });
    return merged
      .filter((o) => o.id !== 'personal')
      .map((o) => {
        const fixed = FIXED_SECTIONS.find((f) => f.id === o.id);
        const custom = (resume.customSections || []).find((c) => c.id === o.id);
        if (fixed) return { ...o, label: fixed.label };
        if (custom) return { ...o, label: custom.title || 'Custom Section', custom: true, customData: custom };
        return null;
      })
      .filter(Boolean);
  }, [resume]);

  const toggleOpen = (sectionId) => setOpenSections((o) => ({ ...o, [sectionId]: !o[sectionId] }));

  const toggleVisible = (sectionId) => {
    const current = sectionEntries.find((s) => s.id === sectionId);
    const nextOrder = sectionEntries.map((s) =>
      s.id === sectionId ? { id: s.id, visible: !(s.visible !== false) } : { id: s.id, visible: s.visible !== false }
    );
    update({ sectionOrder: nextOrder });
    toast.info(current?.visible !== false ? 'Section hidden from resume.' : 'Section visible on resume.');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionEntries.findIndex((s) => s.id === active.id);
    const newIndex = sectionEntries.findIndex((s) => s.id === over.id);
    const moved = arrayMove(sectionEntries, oldIndex, newIndex);
    update({ sectionOrder: moved.map((s) => ({ id: s.id, visible: s.visible !== false })) });
  };

  const updateCustom = (customId, patch) => {
    update({
      customSections: (resume.customSections || []).map((c) => (c.id === customId ? { ...c, ...patch } : c)),
    });
  };

  const deleteCustom = (customId) => {
    update({
      customSections: (resume.customSections || []).filter((c) => c.id !== customId),
      sectionOrder: sectionEntries.filter((s) => s.id !== customId).map((s) => ({ id: s.id, visible: s.visible !== false })),
    });
  };

  const addCustomSection = () => {
    const created = blankCustomSection(`Custom Section ${(resume.customSections || []).length + 1}`);
    update({
      customSections: [...(resume.customSections || []), created],
      sectionOrder: [...sectionEntries.map((s) => ({ id: s.id, visible: s.visible !== false })), { id: created.id, visible: true }],
    });
    setOpenSections((o) => ({ ...o, [created.id]: true }));
  };

  if (loading) return <LoadingPage message="Loading resume editor…" />;
  if (error || !resume) {
    return <ErrorPage title="Resume not found" message={error || 'This resume does not exist or you do not have access to it.'} showHome={false} />;
  }

  const pct = completionPercent(resume);

  const saveIndicator = (
    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      {saveState === 'saving' && (<><Loader2 size={14} className="animate-spin text-primary-500" /> Saving…</>)}
      {saveState === 'saved' && (<><Check size={14} className="text-green-500" /> Saved{lastSaved ? ` • Last saved at ${new Date(lastSaved).toLocaleTimeString()}` : ''}</>)}
      {saveState === 'error' && (<><AlertCircle size={14} className="text-red-500" /> Save failed — retrying on next change</>)}
      {saveState === 'idle' && lastSaved && (<>Last saved at {new Date(lastSaved).toLocaleTimeString()}</>)}
    </span>
  );

  const renderSectionBody = (entry) => {
    switch (entry.id) {
      case 'summary':
        return <SummaryForm value={resume.summary} onChange={(summary) => update({ summary })} onGenerateAI={() => setAiOpen(true)} />;
      case 'skills':
        return <TagInput value={resume.skills} onChange={(skills) => update({ skills })} placeholder="e.g. React, Communication…" />;
      case 'experience':
        return <ExperienceForm value={resume.experience} onChange={(experience) => update({ experience })} />;
      case 'projects':
        return <ProjectsForm value={resume.projects} onChange={(projects) => update({ projects })} />;
      case 'education':
        return <EducationForm value={resume.education} onChange={(education) => update({ education })} />;
      case 'certifications':
        return <SimpleListForm value={resume.certifications} onChange={(certifications) => update({ certifications })} singular="Certification" />;
      case 'achievements':
        return <SimpleListForm value={resume.achievements} onChange={(achievements) => update({ achievements })} singular="Achievement" />;
      case 'languages':
        return <TagInput value={resume.languages} onChange={(languages) => update({ languages })} placeholder="e.g. English (Native)…" />;
      default: {
        // Custom section entries are rendered directly (see SortableSection usage).
        return null;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <input
            className="w-full bg-transparent text-lg font-extrabold tracking-tight focus:outline-none"
            value={resume.title}
            onChange={(e) => update({ title: e.target.value })}
            maxLength={120}
            aria-label="Resume title"
          />
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <input
              className="bg-transparent text-sm text-slate-500 focus:outline-none dark:text-slate-400"
              value={resume.targetRole || ''}
              onChange={(e) => update({ targetRole: e.target.value })}
              placeholder="Target role (e.g. Frontend Developer)"
              maxLength={120}
              aria-label="Target role"
            />
            <span className="hidden text-xs text-slate-300 sm:inline dark:text-slate-600">•</span>
            {saveIndicator}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600 md:inline dark:bg-primary-500/10 dark:text-primary-300">{pct}% complete</span>
          <button onClick={() => setTemplatesOpen(true)} className="btn-secondary !py-2 text-sm" title="Change template">
            <LayoutTemplate size={16} /> <span className="hidden sm:inline">{templateName(resume.templateId)}</span>
          </button>
          <button onClick={() => setAiOpen(true)} className="btn-secondary !py-2 text-sm" title="AI Assistant">
            <Sparkles size={16} /> <span className="hidden sm:inline">AI</span>
          </button>
          <button onClick={() => setVersionsOpen(true)} className="btn-secondary !py-2 text-sm" title="Versions">
            <History size={16} /> <span className="hidden sm:inline">Versions</span>
          </button>
          <Link to={`/resumes/${id}/preview`} className="btn-primary !py-2 text-sm">
            <Eye size={16} /> <span className="hidden sm:inline">Preview</span>
          </Link>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 xl:hidden">
        {['edit', 'preview'].map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`rounded-md py-2 text-sm font-semibold capitalize ${mobileTab === t ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        {/* Editor column */}
        <div className={`space-y-3 ${mobileTab === 'preview' ? 'hidden xl:block' : ''}`}>
          {/* Personal info (always first) */}
          <div className="card overflow-hidden">
            <button onClick={() => toggleOpen('personal')} className="flex w-full items-center justify-between bg-slate-50/70 px-4 py-3 dark:bg-slate-800/50">
              <span className="text-sm font-bold">1. Personal Information</span>
              <ChevronDown size={17} className={`text-slate-400 transition-transform ${openSections.personal ? 'rotate-180' : ''}`} />
            </button>
            {openSections.personal && (
              <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <PersonalInfoForm value={resume.personalInfo || {}} onChange={(personalInfo) => update({ personalInfo })} />
              </div>
            )}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sectionEntries.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sectionEntries.map((entry, i) => (
                  <SortableSection
                    key={entry.id}
                    id={entry.id}
                    label={`${i + 2}. ${entry.label}`}
                    visible={entry.visible !== false}
                    open={Boolean(openSections[entry.id])}
                    onToggleOpen={() => toggleOpen(entry.id)}
                    onToggleVisible={() => toggleVisible(entry.id)}
                  >
                    {entry.custom ? (
                      <CustomSingle
                        section={entry.customData}
                        onChange={(patch) => updateCustom(entry.id, patch)}
                        onDelete={() => deleteCustom(entry.id)}
                      />
                    ) : (
                      renderSectionBody(entry)
                    )}
                  </SortableSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button onClick={addCustomSection} className="btn-secondary w-full border-dashed">
            <Plus size={16} /> Add Custom Section
          </button>

          {/* Bulk custom-section manager (alternative view) */}
          {(resume.customSections || []).length > 0 && (
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-bold">Manage all custom sections</summary>
              <div className="mt-3">
                <CustomSectionsForm
                  value={resume.customSections}
                  onChange={(customSections) => {
                    const kept = new Set(customSections.map((c) => c.id));
                    update({
                      customSections,
                      sectionOrder: sectionEntries.filter((s) => !s.custom || kept.has(s.id)).map((s) => ({ id: s.id, visible: s.visible !== false })),
                    });
                  }}
                />
              </div>
            </details>
          )}
        </div>

        {/* Preview column */}
        <div className={`${mobileTab === 'edit' ? 'hidden xl:block' : ''}`}>
          <div className="xl:sticky xl:top-20">
            <p className="section-title mb-2">Live Preview</p>
            <ResumeRenderer resume={resume} templateId={resume.templateId} />
          </div>
        </div>
      </div>

      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        resume={resume}
        onApplySummary={(summary) => update({ summary })}
        onApplySkills={(skill) => {
          if (!(resume.skills || []).includes(skill)) {
            update({ skills: [...(resume.skills || []), skill] });
            toast.success(`Added skill: ${skill}`);
          }
        }}
      />

      <VersionsManager
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        resumeId={id}
        onRestored={(restored) => {
          setResume(restored);
          setLastSaved(restored.updatedAt);
        }}
      />

      <Modal open={templatesOpen} onClose={() => setTemplatesOpen(false)} title="Choose a template" wide>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Switching templates never loses content.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATE_META.map((t) => (
            <TemplateCard
              key={t.templateId}
              template={t}
              selected={resume.templateId === t.templateId}
              onSelect={(tpl) => {
                update({ templateId: tpl.templateId });
                setTemplatesOpen(false);
                toast.success(`Template changed to ${tpl.name}.`);
              }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}

// Single custom-section editor used for individually sortable custom entries.
function CustomSingle({ section, onChange, onDelete }) {
  const [draft, setDraft] = useState('');
  if (!section) return null;
  const addItem = () => {
    if (!draft.trim()) return;
    onChange({ items: [...(section.items || []), draft.trim()] });
    setDraft('');
  };
  return (
    <div>
      <div className="mb-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="label">Section Title</label>
          <input className="input" value={section.title || ''} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Volunteer Work" maxLength={60} />
        </div>
        <button onClick={onDelete} className="btn-secondary !py-2.5 !text-red-600" title="Delete this section">
          <Trash2 size={15} />
        </button>
      </div>
      <ul className="mb-2 space-y-1.5">
        {(section.items || []).map((it, i) => (
          <li key={i} className="flex items-start gap-2 rounded-md bg-slate-50 p-2 text-sm dark:bg-slate-800/60">
            <span className="mt-0.5 text-slate-400">•</span>
            <span className="flex-1">{it}</span>
            <button onClick={() => onChange({ items: section.items.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-500" aria-label="Remove item">
              <X size={14} />
            </button>
          </li>
        ))}
        {(section.items || []).length === 0 && <li className="text-xs text-slate-400">No items yet.</li>}
      </ul>
      <div className="flex gap-2">
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder="Add an item…"
        />
        <button onClick={addItem} className="btn-secondary shrink-0 !px-3"><Plus size={15} /></button>
      </div>
    </div>
  );
}
