const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { asyncHandler, sendError } = require('../utils/helpers');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'resume';
}

function publicUsername(user) {
  const base = slugify(user.name) || 'user';
  return `${base}-${String(user._id).slice(-6)}`;
}

const enableSharing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid resume id.', 'INVALID_ID');
  const resume = await Resume.findOne({ _id: id, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  const username = publicUsername(req.user);
  const slug = `${username}/${slugify(req.body.slug || resume.targetRole || resume.title)}`;
  resume.isPublic = true;
  resume.publicSlug = slug;
  await resume.save();
  res.json({ success: true, data: { isPublic: true, publicSlug: slug } });
});

const disableSharing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid resume id.', 'INVALID_ID');
  const resume = await Resume.findOne({ _id: id, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  resume.isPublic = false;
  resume.publicSlug = '';
  await resume.save();
  res.json({ success: true, data: { isPublic: false } });
});

// Public, unauthenticated endpoint. Only resumes explicitly marked
// isPublic are ever returned.
const getPublicResume = asyncHandler(async (req, res) => {
  const slug = `${req.params.username}/${req.params.resumeSlug}`;
  const resume = await Resume.findOne({ publicSlug: slug, isPublic: true }).lean();
  if (!resume) return sendError(res, 404, 'This resume link is invalid or sharing is disabled.', 'NOT_FOUND');
  const owner = await User.findById(resume.userId).select('name profileImage').lean();
  res.json({ success: true, data: { resume, owner } });
});

module.exports = { enableSharing, disableSharing, getPublicResume };
