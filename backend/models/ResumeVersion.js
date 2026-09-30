const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    versionName: { type: String, required: true, trim: true, maxlength: 120 },
    contentSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
