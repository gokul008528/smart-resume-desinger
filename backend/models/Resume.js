const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    id: String,
    school: { type: String, default: '' },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    id: String,
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, default: '' },
    link: { type: String, default: '' },
    technologies: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const simpleItemSchema = new mongoose.Schema(
  { id: String, title: { type: String, default: '' }, detail: { type: String, default: '' }, date: { type: String, default: '' } },
  { _id: false }
);

const customSectionSchema = new mongoose.Schema(
  { id: String, title: { type: String, default: '' }, items: { type: [String], default: [] } },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    targetRole: { type: String, default: '', maxlength: 120 },
    templateId: { type: String, default: 'classic-ats' },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      title: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      linkedinLabel: { type: String, default: '' },
      githubLabel: { type: String, default: '' },
      portfolioLabel: { type: String, default: '' },
      // Resume photo: a small resized data URL (or https URL). Used by photo templates.
      photo: { type: String, default: '' },
    },
    summary: { type: String, default: '', maxlength: 3000 },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [simpleItemSchema], default: [] },
    achievements: { type: [simpleItemSchema], default: [] },
    languages: { type: [String], default: [] },
    customSections: { type: [customSectionSchema], default: [] },
    // Ordered list of { id, visible } controlling render order + hide/show.
    sectionOrder: {
      type: [{ id: String, visible: { type: Boolean, default: true } }],
      default: [
        { id: 'summary', visible: true },
        { id: 'skills', visible: true },
        { id: 'experience', visible: true },
        { id: 'projects', visible: true },
        { id: 'education', visible: true },
        { id: 'certifications', visible: true },
        { id: 'achievements', visible: true },
        { id: 'languages', visible: true },
      ],
    },
    isPublic: { type: Boolean, default: false },
    publicSlug: { type: String, default: '', index: true },
    lastAtsScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
