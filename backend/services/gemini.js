// Gemini REST wrapper. The API key stays on the backend.
// We automatically fail over between real, currently-served Flash models when a
// model is busy (503), temporarily rate limited (429), not found/retired (404),
// or erroring server-side (500). This prevents a single bad/retired model ID or a
// capacity spike from breaking every AI feature.
//
// IMPORTANT: "gemini-3.8-flash" / "gemini-3.7-flash" / "gemini-3.6-flash" /
// "gemini-3.5-flash" (the previous defaults here) do not exist on the Gemini API —
// every call to them returned 404, which is why every AI button failed. Fixed to
// use real model IDs. "gemini-flash-latest" is Google's auto-updating alias for
// the current recommended Flash model, so this stays correct as Google ships new
// versions instead of rotting again. See server/README notes / ai.google.dev/gemini-api/docs/models.
const DEFAULT_MODEL = 'gemini-flash-latest';
const DEFAULT_FALLBACKS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

// Statuses where trying a different model is likely to help (vs. a 400/401/403
// which will fail identically on every model and should stop immediately).
const RETRYABLE_STATUSES = new Set([404, 429, 500, 503]);

// Per-attempt timeout. Kept short (and total attempts capped) so a slow/unreachable
// model can't chain up 4x a long timeout and blow past the frontend's axios timeout,
// which is what surfaced as "timeout" in the UI even though the backend kept retrying.
const PER_ATTEMPT_TIMEOUT_MS = 12000;

function isConfigured() { return Boolean(process.env.GEMINI_API_KEY); }

function getModels() {
  const primary = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const configured = (process.env.GEMINI_MODEL_FALLBACKS || DEFAULT_FALLBACKS.join(','))
    .split(',').map((x) => x.trim()).filter(Boolean);
  return [...new Set([primary, ...configured])];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestModel(model, prompt, { maxOutputTokens, temperature }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens, temperature },
      }),
    });
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
    return { response, raw, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateText(prompt, { maxOutputTokens = 1024, temperature = 0.7 } = {}) {
  if (!isConfigured()) {
    const err = new Error('GEMINI_API_KEY is missing. Add a valid Gemini API key to server/.env and restart the server.');
    err.code = 'AI_NOT_CONFIGURED'; err.status = 503; throw err;
  }

  let lastError = null;
  const models = getModels();

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const { response, raw, data } = await requestModel(model, prompt, { maxOutputTokens, temperature });
      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
        if (text) return text;
        lastError = new Error(`Gemini returned no usable text (${data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || 'empty response'}).`);
        lastError.code = 'AI_EMPTY_RESPONSE';
        lastError.status = 502;
        continue;
      }

      const upstream = data?.error?.message || raw || `HTTP ${response.status}`;
      lastError = new Error(`Gemini API error (${response.status}) on ${model}: ${upstream}`);
      lastError.code = 'AI_UPSTREAM_ERROR';
      lastError.status = response.status;

      // Capacity errors, rate limits, retired/renamed models, and transient 5xx are
      // all safe to fail over to another model. A 400/401/403 means the request or
      // credentials are wrong and will fail identically on every model, so stop.
      if (RETRYABLE_STATUSES.has(response.status) && index < models.length - 1) {
        await sleep(300 + index * 250);
        continue;
      }
      break;
    } catch (e) {
      lastError = e.name === 'AbortError'
        ? Object.assign(new Error(`Gemini request timed out on ${model}.`), { code: 'AI_TIMEOUT', status: 504 })
        : Object.assign(new Error(`Could not reach Gemini on ${model}: ${e.message || 'network error'}`), { code: 'AI_UNREACHABLE', status: 502 });
      if (index < models.length - 1) {
        await sleep(300 + index * 250);
        continue;
      }
    }
  }

  // Preserve a useful status while exposing the last upstream reason to the server log/client.
  if (lastError) {
    lastError.status = [400, 401, 403, 404].includes(lastError.status) ? lastError.status : 502;
    throw lastError;
  }
  const err = new Error('Gemini request failed.');
  err.status = 502; err.code = 'AI_ERROR'; throw err;
}

function parseJsonResponse(text) {
  const cleaned = String(text).replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Invalid AI response format');
  return JSON.parse(cleaned.slice(start, end + 1));
}

module.exports = { generateText, parseJsonResponse, isConfigured, getModels };
