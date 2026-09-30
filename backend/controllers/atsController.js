const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/ats');
const { asyncHandler, sendError } = require('../utils/helpers');

const analyze = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription = '' } = req.body;
  if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
    return sendError(res, 400, 'A valid resumeId is required.', 'VALIDATION_ERROR');
  }
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');

  const result = analyzeResume(resume.toObject(), jobDescription);
  resume.lastAtsScore = result.score;
  await resume.save();
  res.json({ success: true, data: result });
});

module.exports = { analyze };
