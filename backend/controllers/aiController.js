const { generateText, parseJsonResponse } = require('../services/gemini');
const { asyncHandler, sendError } = require('../utils/helpers');

const HONESTY_RULE = 'Only use the information provided. Do not invent companies, metrics, technologies, achievements, or responsibilities the user did not mention.';

const generateSummary = asyncHandler(async (req, res) => {
  const { targetRole = '', skills = [], experience = '', education = '', currentSummary = '' } = req.body;
  const prompt = `You are a professional resume writer. Write a concise professional summary (40-100 words, 2-4 sentences) for a resume.
Target role: ${targetRole || 'Not specified'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Experience highlights: ${experience || 'Not specified'}
Education: ${education || 'Not specified'}
${currentSummary ? `Current draft to improve: ${currentSummary}` : ''}
${HONESTY_RULE}
Return ONLY the summary text, no headings, no quotes, no markdown.`;
  try {
    const text = await generateText(prompt);
    res.json({ success: true, data: { summary: text } });
  } catch (err) {
    return sendError(res, err.status || 502, err.message, err.code || 'AI_ERROR');
  }
});

// POST /api/ai/improve — improve bullets / rewrite content
const improveContent = asyncHandler(async (req, res) => {
  const { text = '', context = '', mode = 'bullets' } = req.body;
  if (!text.trim()) return sendError(res, 400, 'Text to improve is required.', 'VALIDATION_ERROR');
  const modeInstruction = mode === 'rewrite'
    ? 'Rewrite it to be clear, professional, and impactful while preserving all facts.'
    : 'Convert it into 2-4 strong, concise resume bullet points, each starting with a strong action verb. Return each bullet on its own line starting with "• ".';
  const prompt = `You are a professional resume writer. Improve the following resume content.
Context (role/company): ${context || 'Not specified'}
Content:
${text}
${modeInstruction}
${HONESTY_RULE} Keep the same meaning; do not add new facts.
Return ONLY the improved content, no extra commentary.`;
  try {
    const improved = await generateText(prompt);
    res.json({ success: true, data: { improved } });
  } catch (err) {
    return sendError(res, err.status || 502, err.message, err.code || 'AI_ERROR');
  }
});

// POST /api/ai/skills — suggest skills for a role
const suggestSkills = asyncHandler(async (req, res) => {
  const { targetRole = '', existingSkills = [] } = req.body;
  if (!targetRole.trim()) return sendError(res, 400, 'Target role is required.', 'VALIDATION_ERROR');
  const prompt = `You are a career advisor. For the role "${targetRole}", suggest relevant resume skills.
Existing skills: ${(existingSkills || []).join(', ') || 'None'}
Return ONLY valid JSON in this exact shape (no markdown, no code fences):
{"suggested": ["skill1", ...up to 10], "missing": ["skills the user lacks that matter for this role, up to 8]}`;
  try {
    const text = await generateText(prompt, { temperature: 0.5 });
    let parsed;
    try {
      parsed = parseJsonResponse(text);
    } catch {
      return sendError(res, 502, 'The AI returned an unexpected format. Please try again.', 'AI_BAD_FORMAT');
    }
    res.json({ success: true, data: { existing: existingSkills, suggested: parsed.suggested || [], missing: parsed.missing || [] } });
  } catch (err) {
    return sendError(res, err.status || 502, err.message, err.code || 'AI_ERROR');
  }
});

// POST /api/ai/job-analysis — analyze a job description (+ optional resume comparison)
const analyzeJob = asyncHandler(async (req, res) => {
  const { jobDescription = '', resumeText = '' } = req.body;
  if (!jobDescription.trim()) return sendError(res, 400, 'Job description is required.', 'VALIDATION_ERROR');
  const prompt = `You are an expert recruiter and ATS analyst. Analyze this job description${resumeText ? ' and compare it against the candidate resume text' : ''}.

JOB DESCRIPTION:
${jobDescription.slice(0, 8000)}
${resumeText ? `\nCANDIDATE RESUME TEXT:\n${String(resumeText).slice(0, 8000)}` : ''}

Return ONLY valid JSON (no markdown, no code fences) in this shape:
{
  "requiredSkills": [],
  "preferredSkills": [],
  "keywords": [],
  "responsibilities": [],
  "experienceRequirements": "",
  "matchScore": ${resumeText ? 'a number 0-100 estimating resume-to-job fit' : 'null'},
  "gaps": [${resumeText ? '"areas where the resume is weak relative to the job"' : ''}],
  "recommendations": ["concrete, actionable resume improvements"]
}`;
  try {
    const text = await generateText(prompt, { temperature: 0.4, maxOutputTokens: 1500 });
    let parsed;
    try {
      parsed = parseJsonResponse(text);
    } catch {
      return sendError(res, 502, 'The AI returned an unexpected format. Please try again.', 'AI_BAD_FORMAT');
    }
    res.json({ success: true, data: parsed });
  } catch (err) {
    return sendError(res, err.status || 502, err.message, err.code || 'AI_ERROR');
  }
});

// POST /api/ai/resume-feedback — holistic improvement suggestions
const resumeFeedback = asyncHandler(async (req, res) => {
  const { resumeText = '', targetRole = '' } = req.body;
  if (!resumeText.trim()) return sendError(res, 400, 'Resume text is required.', 'VALIDATION_ERROR');
  const prompt = `You are a professional resume coach. Review this resume${targetRole ? ` for a "${targetRole}" role` : ''} and give concrete improvements.

RESUME:
${resumeText.slice(0, 9000)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "overall": "2-3 sentence overall assessment",
  "suggestions": [{"area": "Summary|Experience|Skills|Projects|Education|Wording|Keywords|Length", "advice": "specific advice"} up to 8 items],
  "keywordsToAdd": []
}`;
  try {
    const text = await generateText(prompt, { temperature: 0.5, maxOutputTokens: 1500 });
    let parsed;
    try {
      parsed = parseJsonResponse(text);
    } catch {
      return sendError(res, 502, 'The AI returned an unexpected format. Please try again.', 'AI_BAD_FORMAT');
    }
    res.json({ success: true, data: parsed });
  } catch (err) {
    return sendError(res, err.status || 502, err.message, err.code || 'AI_ERROR');
  }
});

module.exports = { generateSummary, improveContent, suggestSkills, analyzeJob, resumeFeedback };
