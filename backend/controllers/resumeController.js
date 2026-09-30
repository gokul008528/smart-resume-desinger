const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const { asyncHandler, sendError } = require('../utils/helpers');

const EDITABLE_FIELDS = [
  'title', 'targetRole', 'templateId', 'personalInfo', 'summary', 'skills',
  'education', 'experience', 'projects', 'certifications', 'achievements',
  'languages', 'customSections', 'sectionOrder',
];

function assertObjectId(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendError(res, 400, 'Invalid resume id.', 'INVALID_ID');
    return false;
  }
  return true;
}

async function getOwnedResume(id, userId) {
  return Resume.findOne({ _id: id, userId });
}

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .select('title targetRole templateId updatedAt createdAt isPublic publicSlug lastAtsScore summary skills education experience projects')
    .sort({ updatedAt: -1 });
  res.json({ success: true, data: resumes });
});

const createResume = asyncHandler(async (req, res) => {
  const { title, targetRole, templateId } = req.body;
  if (!title || !String(title).trim()) {
    return sendError(res, 400, 'Resume title is required.', 'VALIDATION_ERROR');
  }
  const resume = await Resume.create({
    userId: req.user._id,
    title: String(title).trim().slice(0, 120),
    targetRole: String(targetRole || '').slice(0, 120),
    templateId: templateId || 'classic-ats',
    personalInfo: {
      fullName: req.user.name || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      location: req.user.location || '',
      title: req.user.professionalTitle || '',
      linkedin: req.user.linkedin || '',
      github: req.user.github || '',
      portfolio: req.user.portfolio || '',
    },
    skills: req.user.skills || [],
  });
  res.status(201).json({ success: true, data: resume });
});

const getResume = asyncHandler(async (req, res) => {
  if (!assertObjectId(req.params.id, res)) return;
  const resume = await getOwnedResume(req.params.id, req.user._id);
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  res.json({ success: true, data: resume });
});

const updateResume = asyncHandler(async (req, res) => {
  if (!assertObjectId(req.params.id, res)) return;
  const resume = await getOwnedResume(req.params.id, req.user._id);
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) resume[field] = req.body[field];
  });
  await resume.save();
  res.json({ success: true, data: resume });
});

const deleteResume = asyncHandler(async (req, res) => {
  if (!assertObjectId(req.params.id, res)) return;
  const resume = await getOwnedResume(req.params.id, req.user._id);
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  await ResumeVersion.deleteMany({ resumeId: resume._id });
  await resume.deleteOne();
  res.json({ success: true, message: 'Resume deleted.' });
});

const duplicateResume = asyncHandler(async (req, res) => {
  if (!assertObjectId(req.params.id, res)) return;
  const resume = await getOwnedResume(req.params.id, req.user._id);
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  const copy = resume.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.title = `${resume.title} (Copy)`.slice(0, 120);
  copy.isPublic = false;
  copy.publicSlug = '';
  const created = await Resume.create({ ...copy, userId: req.user._id });
  res.status(201).json({ success: true, data: created });
});

module.exports = { listResumes, createResume, getResume, updateResume, deleteResume, duplicateResume };
