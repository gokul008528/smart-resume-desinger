
const ACTION_VERBS = [
  'achieved', 'built', 'created', 'designed', 'developed', 'implemented', 'improved',
  'increased', 'launched', 'led', 'managed', 'optimized', 'reduced', 'delivered',
  'collaborated', 'automated', 'migrated', 'scaled', 'shipped', 'mentored',
];

function fullText(resume) {
  const parts = [
    resume.summary,
    (resume.skills || []).join(' '),
    (resume.experience || []).map((e) => `${e.role} ${e.company} ${(e.bullets || []).join(' ')}`).join(' '),
    (resume.projects || []).map((p) => `${p.name} ${p.technologies} ${p.description}`).join(' '),
    (resume.education || []).map((e) => `${e.degree} ${e.field} ${e.school}`).join(' '),
    (resume.certifications || []).map((c) => `${c.title} ${c.detail}`).join(' '),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function analyzeResume(resume, jobDescription = '') {
  const checks = [];
  const addCheck = (status, title, detail = '', weight = 1) =>
    checks.push({ status, title, detail, weight });

  const p = resume.personalInfo || {};

  // Contact information
  if (p.fullName && p.email && p.phone) {
    addCheck('pass', 'Contact information', 'Name, email, and phone are present.', 2);
  } else {
    const missing = ['fullName', 'email', 'phone'].filter((k) => !p[k]).join(', ');
    addCheck('warn', 'Contact information', `Missing: ${missing}. Recruiters and ATS parsers need these.`, 2);
  }

  // Required sections
  const required = [
    ['summary', 'Professional summary', resume.summary],
    ['skills', 'Skills section', (resume.skills || []).length > 0],
    ['experience', 'Experience section', (resume.experience || []).length > 0],
    ['education', 'Education section', (resume.education || []).length > 0],
  ];
  required.forEach(([key, label, present]) => {
    if (present) addCheck('pass', label, `${label} found.`, 2);
    else addCheck('warn', label, `${label} is missing or empty. Most ATS profiles expect it.`, 2);
  });

  // Summary length
  const summaryWords = (resume.summary || '').trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 30 && summaryWords <= 120) {
    addCheck('pass', 'Summary length', `${summaryWords} words — a good length.`, 1);
  } else if (summaryWords === 0) {
    addCheck('warn', 'Summary length', 'Add a 2–4 sentence professional summary.', 1);
  } else {
    addCheck('warn', 'Summary length', `${summaryWords} words — aim for roughly 40–100 words.`, 1);
  }

  // Action verbs in bullets
  const bullets = (resume.experience || []).flatMap((e) => e.bullets || []);
  const withVerbs = bullets.filter((b) =>
    ACTION_VERBS.some((v) => b.trim().toLowerCase().startsWith(v))
  ).length;
  if (bullets.length === 0) {
    addCheck('warn', 'Experience bullet points', 'Add bullet points describing what you did in each role.', 2);
  } else if (withVerbs >= Math.ceil(bullets.length / 2)) {
    addCheck('pass', 'Strong action verbs', `${withVerbs}/${bullets.length} bullets start with a strong verb.`, 1);
  } else {
    addCheck('warn', 'Strong action verbs', `Only ${withVerbs}/${bullets.length} bullets start with a strong verb (e.g. Built, Led, Improved).`, 1);
  }

  // Quantified achievements
  const quantified = bullets.filter((b) => /\d/.test(b)).length;
  if (bullets.length > 0 && quantified >= Math.ceil(bullets.length / 3)) {
    addCheck('pass', 'Quantified achievements', `${quantified} bullets include numbers or metrics.`, 1);
  } else if (bullets.length > 0) {
    addCheck('warn', 'Quantified achievements', 'Add numbers where truthful (%, users, time saved) to strengthen impact.', 1);
  }

  // Date consistency
  const dated = [...(resume.experience || []), ...(resume.education || [])];
  const missingDates = dated.filter((d) => !d.startDate || (!d.endDate && !d.current));
  if (dated.length === 0) {
    addCheck('warn', 'Date consistency', 'No dated entries found yet.', 1);
  } else if (missingDates.length === 0) {
    addCheck('pass', 'Date consistency', 'All entries include start and end dates.', 1);
  } else {
    addCheck('warn', 'Date consistency', `${missingDates.length} entries are missing dates. ATS systems use dates to compute tenure.`, 1);
  }

  // Skills breadth
  const skillCount = (resume.skills || []).length;
  if (skillCount >= 6) addCheck('pass', 'Skills breadth', `${skillCount} skills listed.`, 1);
  else addCheck('warn', 'Skills breadth', `Only ${skillCount} skills listed — aim for at least 6 relevant skills.`, 1);

  // Readability: average bullet length
  if (bullets.length > 0) {
    const avgLen = bullets.reduce((n, b) => n + b.split(/\s+/).length, 0) / bullets.length;
    if (avgLen <= 35) addCheck('pass', 'Readability', 'Bullet points are concise.', 1);
    else addCheck('warn', 'Readability', 'Some bullets are long — split them into shorter, scannable lines.', 1);
  }

  // Formatting risk based on template
  const riskyTemplates = ['creative'];
  if (riskyTemplates.includes(resume.templateId)) {
    addCheck('warn', 'Formatting risk', 'Creative layouts can confuse older ATS parsers. Prefer Classic ATS or Minimal for strict systems.', 1);
  } else {
    addCheck('pass', 'Formatting risk', 'Template uses a clean, parser-friendly layout.', 1);
  }

  // Keyword / job-description matching
  const text = fullText(resume);
  const jd = (jobDescription || '').toLowerCase();
  if (jd.trim()) {
    const stopwords = new Set('and,the,for,with,you,your,our,are,that,this,will,have,has,from,to,of,in,on,a,an,as,at,by,or,we,you,their,its,into,over,per'.split(','));
    const jdWords = jd.replace(/[^a-z0-9+#.\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !stopwords.has(w));
    const freq = {};
    jdWords.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
    const topKeywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
    const matched = topKeywords.filter((k) => text.includes(k));
    const missing = topKeywords.filter((k) => !text.includes(k));
    const ratio = topKeywords.length ? matched.length / topKeywords.length : 0;
    if (ratio >= 0.6) {
      addCheck('pass', 'Job keyword match', `Matched ${matched.length}/${topKeywords.length} top job keywords.`, 3);
    } else {
      addCheck('warn', 'Job keyword match', `Matched ${matched.length}/${topKeywords.length} top job keywords. Consider adding: ${missing.slice(0, 6).join(', ')}.`, 3);
    }
    checks.keywords = { matched, missing };
  } else if (resume.targetRole) {
    const roleWords = resume.targetRole.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matchedRole = roleWords.filter((w) => text.includes(w));
    if (matchedRole.length === roleWords.length && roleWords.length > 0) {
      addCheck('pass', 'Target-role keywords', `Resume mentions your target role "${resume.targetRole}".`, 2);
    } else {
      addCheck('warn', 'Target-role keywords', `Mention "${resume.targetRole}" and its core skills explicitly in your summary or skills.`, 2);
    }
  }

  const totalWeight = checks.reduce((n, c) => n + (c.weight || 1), 0);
  const earned = checks.reduce((n, c) => n + (c.status === 'pass' ? c.weight || 1 : 0), 0);
  const score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    score,
    summary: score >= 80 ? 'Strong — your resume looks well-structured for ATS parsers.'
      : score >= 55 ? 'Good foundation — a few improvements will help significantly.'
        : 'Needs work — follow the recommendations below to improve parsability.',
    checks: checks.map(({ status, title, detail }) => ({ status, title, detail })),
    keywords: checks.keywords || { matched: [], missing: [] },
    disclaimer: 'This is a structural heuristic check, not a guarantee of passing any specific company ATS.',
  };
}

module.exports = { analyzeResume };
