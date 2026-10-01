const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const { asyncHandler, sendError } = require('../utils/helpers');

function snapshotOf(resume) {
  const obj = resume.toObject();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
}

const listVersions = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'Invalid resume id.', 'INVALID_ID');
  }
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  const versions = await ResumeVersion.find({ resumeId: resume._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: versions });
});

const createVersion = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'Invalid resume id.', 'INVALID_ID');
  }
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  const { versionName } = req.body;
  if (!versionName || !String(versionName).trim()) {
    return sendError(res, 400, 'Version name is required.', 'VALIDATION_ERROR');
  }
  const version = await ResumeVersion.create({
    resumeId: resume._id,
    userId: req.user._id,
    versionName: String(versionName).trim().slice(0, 120),
    contentSnapshot: snapshotOf(resume),
  });
  res.status(201).json({ success: true, data: version });
});

const restoreVersion = asyncHandler(async (req, res) => {
  const { id, versionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
    return sendError(res, 400, 'Invalid id.', 'INVALID_ID');
  }
  const resume = await Resume.findOne({ _id: id, userId: req.user._id });
  if (!resume) return sendError(res, 404, 'Resume not found.', 'NOT_FOUND');
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId: id, userId: req.user._id });
  if (!version) return sendError(res, 404, 'Version not found.', 'NOT_FOUND');

  // Safety: automatically snapshot the current state before restoring.
  await ResumeVersion.create({
    resumeId: resume._id,
    userId: req.user._id,
    versionName: `Auto-backup ${new Date().toLocaleString()}`,
    contentSnapshot: snapshotOf(resume),
  });

  const snap = version.contentSnapshot || {};
  const editable = [
    'title', 'targetRole', 'templateId', 'personalInfo', 'summary', 'skills',
    'education', 'experience', 'projects', 'certifications', 'achievements',
    'languages', 'customSections', 'sectionOrder',
  ];
  editable.forEach((field) => {
    if (snap[field] !== undefined) resume[field] = snap[field];
  });
  await resume.save();
  res.json({ success: true, data: resume });
});

const renameVersion = asyncHandler(async (req, res) => {
  const { id, versionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
    return sendError(res, 400, 'Invalid id.', 'INVALID_ID');
  }
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId: id, userId: req.user._id });
  if (!version) return sendError(res, 404, 'Version not found.', 'NOT_FOUND');
  const { versionName } = req.body;
  if (!versionName || !String(versionName).trim()) {
    return sendError(res, 400, 'Version name is required.', 'VALIDATION_ERROR');
  }
  version.versionName = String(versionName).trim().slice(0, 120);
  await version.save();
  res.json({ success: true, data: version });
});

const deleteVersion = asyncHandler(async (req, res) => {
  const { id, versionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
    return sendError(res, 400, 'Invalid id.', 'INVALID_ID');
  }
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId: id, userId: req.user._id });
  if (!version) return sendError(res, 404, 'Version not found.', 'NOT_FOUND');
  await version.deleteOne();
  res.json({ success: true, message: 'Version deleted.' });
});

module.exports = { listVersions, createVersion, restoreVersion, renameVersion, deleteVersion };
