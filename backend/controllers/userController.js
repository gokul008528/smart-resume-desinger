const { validationResult } = require('express-validator');
const { asyncHandler, sendError } = require('../utils/helpers');

const ALLOWED_FIELDS = [
  'name', 'phone', 'location', 'professionalTitle', 'bio',
  'linkedin', 'github', 'portfolio', 'skills', 'yearsOfExperience', 'profileImage',
];

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Please check the highlighted fields.', errors: errors.array() });
  }
  ALLOWED_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  if (Array.isArray(req.user.skills)) {
    req.user.skills = req.user.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 50);
  }
  await req.user.save();
  res.json({ success: true, data: req.user });
});

// Profile images are uploaded from the client to Firebase Storage; the
// client then saves the download URL into the profile via updateProfile.
// This endpoint validates + stores a client-provided image URL.
const updateProfileImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (typeof imageUrl !== 'string' || !/^https:\/\/.+\..+/.test(imageUrl)) {
    return sendError(res, 400, 'A valid image URL is required.', 'VALIDATION_ERROR');
  }
  req.user.profileImage = imageUrl;
  await req.user.save();
  res.json({ success: true, data: { profileImage: req.user.profileImage } });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const Resume = require('../models/Resume');
  const ResumeVersion = require('../models/ResumeVersion');
  const JobApplication = require('../models/JobApplication');
  const { getAdmin } = require('../config/firebase');

  await ResumeVersion.deleteMany({ userId: req.user._id });
  await JobApplication.deleteMany({ userId: req.user._id });
  await Resume.deleteMany({ userId: req.user._id });

  const admin = getAdmin();
  if (admin) {
    try {
      await admin.auth().deleteUser(req.user.firebaseUid);
    } catch (e) {
      // Continue — remove local data even if Firebase deletion fails.
    }
  }
  // Use deleteOne on the fetched document's model to remove the user record.
  await req.user.deleteOne();
  res.json({ success: true, message: 'Account deleted.' });
});

module.exports = { getProfile, updateProfile, updateProfileImage, deleteAccount };
