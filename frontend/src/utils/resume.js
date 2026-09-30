// Shared resume helpers: completion %, plain-text export (for AI/ATS), formatting.

export function completionPercent(resume) {
  if (!resume) return 0;
  const checks = [
    Boolean(resume.personalInfo?.fullName && resume.personalInfo?.email),
    Boolean(resume.summary?.trim()),
    (resume.skills || []).length >= 3,
    (resume.experience || []).length > 0,
    (resume.education || []).length > 0,
    (resume.projects || []).length > 0,
    Boolean(resume.targetRole?.trim()),
    (resume.certifications || []).length > 0 || (resume.achievements || []).length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function resumeToText(resume) {
  if (!resume) return '';
  const p = resume.personalInfo || {};
  const lines = [
    `${p.fullName || ''} — ${p.title || resume.targetRole || ''}`,
    [p.email, p.phone, p.location].filter(Boolean).join(' | '),
    '',
    'SUMMARY', resume.summary || '',
    '',
    'SKILLS', (resume.skills || []).join(', '),
    '',
    'EXPERIENCE',
    ...(resume.experience || []).flatMap((e) => [
      `${e.role || ''} at ${e.company || ''} (${e.startDate || ''} – ${e.current ? 'Present' : e.endDate || ''})`,
      ...(e.bullets || []).map((b) => `• ${b}`),
    ]),
    '',
    'PROJECTS',
    ...(resume.projects || []).map((pr) => `${pr.name || ''} [${pr.technologies || ''}]: ${pr.description || ''}`),
    '',
    'EDUCATION',
    ...(resume.education || []).map((e) => `${e.degree || ''} ${e.field || ''}, ${e.school || ''} (${e.startDate || ''} – ${e.endDate || ''})`),
    '',
    'CERTIFICATIONS', ...(resume.certifications || []).map((c) => `${c.title || ''} ${c.detail || ''}`),
    '',
    'ACHIEVEMENTS', ...(resume.achievements || []).map((a) => `${a.title || ''} ${a.detail || ''}`),
    '',
    'LANGUAGES', (resume.languages || []).join(', '),
  ];
  return lines.join('\n');
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function downloadTextFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeExternalUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (url.protocol !== 'https:' || !url.hostname) return '';
    return url.toString();
  } catch { return ''; }
}

export const GITHUB_REPO_URL = normalizeExternalUrl(import.meta.env.VITE_GITHUB_REPOSITORY_URL);

export function openGithubRepo() {
  if (GITHUB_REPO_URL) window.location.assign(GITHUB_REPO_URL);
}
