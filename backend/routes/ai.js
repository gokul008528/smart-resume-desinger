const express = require('express');
const { generateSummary, improveContent, suggestSkills, analyzeJob, resumeFeedback } = require('../controllers/aiController');
const { verifyAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');

const router = express.Router();
router.use(verifyAuth, aiLimiter);

router.post('/summary', generateSummary);
router.post('/improve', improveContent);
router.post('/skills', suggestSkills);
router.post('/job-analysis', analyzeJob);
router.post('/resume-feedback', resumeFeedback);

module.exports = router;
