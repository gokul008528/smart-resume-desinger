import { useState } from 'react';
import { Sparkles, Loader2, Check, RefreshCw, Wand2, ListPlus, MessageSquareText } from 'lucide-react';
import Modal from '../Modal';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { resumeToText } from '../../utils/resume';

const TABS = [
  { id: 'summary', label: 'Summary', icon: MessageSquareText },
  { id: 'improve', label: 'Improve Text', icon: Wand2 },
  { id: 'skills', label: 'Skills', icon: ListPlus },
  { id: 'feedback', label: 'Feedback', icon: Sparkles },
];

export default function AIAssistant({ open, onClose, resume, onApplySummary, onApplySkills }) {
  const [tab, setTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [improveInput, setImproveInput] = useState('');
  const [improved, setImproved] = useState('');
  const [skillResult, setSkillResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const toast = useToast();

  if (!resume) return null;

  const run = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      toast.error(getErrorMessage(err, 'AI request failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = () =>
    run(async () => {
      const exp = (resume.experience || []).map((e) => `${e.role} at ${e.company}: ${(e.bullets || []).join('; ')}`).join('\n');
      const edu = (resume.education || []).map((e) => `${e.degree} ${e.field}, ${e.school}`).join('; ');
      const { data } = await api.post('/ai/summary', {
        targetRole: resume.targetRole || resume.personalInfo?.title,
        skills: resume.skills,
        experience: exp,
        education: edu,
        currentSummary: resume.summary,
      });
      setSummary(data.data.summary);
    });

  const improveText = () =>
    run(async () => {
      if (!improveInput.trim()) {
        toast.warning('Paste or type some text to improve first.');
        return;
      }
      const { data } = await api.post('/ai/improve', {
        text: improveInput,
        context: resume.targetRole || '',
        mode: 'bullets',
      });
      setImproved(data.data.improved);
    });

  const suggestSkills = () =>
    run(async () => {
      const { data } = await api.post('/ai/skills', {
        targetRole: resume.targetRole || resume.personalInfo?.title || '',
        existingSkills: resume.skills || [],
      });
      setSkillResult(data.data);
    });

  const getFeedback = () =>
    run(async () => {
      const { data } = await api.post('/ai/resume-feedback', {
        resumeText: resumeToText(resume),
        targetRole: resume.targetRole,
      });
      setFeedback(data.data);
    });

  return (
    <Modal open={open} onClose={onClose} title="AI Resume Assistant" wide>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate a professional summary from your target role ({resume.targetRole || 'not set'}), skills, and experience.
          </p>
          <button className="btn-primary" onClick={generateSummary} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {summary ? 'Regenerate' : 'Generate Summary'}
          </button>
          {summary && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="whitespace-pre-line text-sm leading-relaxed">{summary}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary !py-2" onClick={() => { onApplySummary?.(summary); toast.success('Summary applied to your resume.'); }}>
                  <Check size={15} /> Use this summary
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'improve' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste rough notes (e.g. “Worked on website frontend”) and get polished bullet points. The AI only uses what you provide — it won’t invent achievements.
          </p>
          <textarea
            className="input min-h-24"
            rows={4}
            placeholder="Worked on website frontend, fixed bugs, helped team…"
            value={improveInput}
            onChange={(e) => setImproveInput(e.target.value)}
          />
          <button className="btn-primary" onClick={improveText} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} Improve
          </button>
          {improved && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="whitespace-pre-line text-sm leading-relaxed">{improved}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'skills' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Get skill suggestions tailored to <strong>{resume.targetRole || 'your target role'}</strong>.
          </p>
          <button className="btn-primary" onClick={suggestSkills} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Suggest Skills
          </button>
          {skillResult && (
            <div className="space-y-3">
              {[
                { label: 'Existing skills', items: skillResult.existing, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', addable: false },
                { label: 'Suggested skills', items: skillResult.suggested, color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', addable: true },
                { label: 'Missing for this role', items: skillResult.missing, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', addable: true },
              ].map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(group.items || []).map((s, i) => (
                      <button
                        key={i}
                        disabled={!group.addable}
                        onClick={() => onApplySkills?.(s)}
                        title={group.addable ? 'Click to add to resume' : undefined}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${group.color} ${group.addable ? 'cursor-pointer hover:ring-2 hover:ring-primary-400' : ''}`}
                      >
                        {group.addable ? `+ ${s}` : s}
                      </button>
                    ))}
                    {(!group.items || group.items.length === 0) && <span className="text-xs text-slate-400">None</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'feedback' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Get holistic, actionable feedback on your current resume content.</p>
          <button className="btn-primary" onClick={getFeedback} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Analyze My Resume
          </button>
          {feedback && (
            <div className="space-y-3">
              <p className="rounded-lg bg-primary-50 p-3 text-sm dark:bg-primary-500/10">{feedback.overall}</p>
              {(feedback.suggestions || []).map((s, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold dark:bg-slate-800">{s.area}</span>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{s.advice}</p>
                </div>
              ))}
              {(feedback.keywordsToAdd || []).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Keywords to add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.keywordsToAdd.map((k, i) => (
                      <span key={i} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
