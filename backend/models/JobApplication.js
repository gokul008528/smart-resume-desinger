const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    company: { type: String, default: '', maxlength: 120 },
    jobTitle: { type: String, default: '', maxlength: 120 },
    jobDescription: { type: String, default: '', maxlength: 20000 },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      default: 'saved',
    },
    appliedDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
