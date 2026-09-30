const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many AI requests. Please wait a moment and try again.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

module.exports = { aiLimiter, generalLimiter };
