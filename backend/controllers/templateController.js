const { asyncHandler } = require('../utils/helpers');

const TEMPLATES = [
  { templateId: 'classic-ats', name: 'Classic ATS', description: 'Single-column, parser-safe layout recruiters trust.', category: 'ATS', isAtsFriendly: true },
  { templateId: 'modern-professional', name: 'Modern Professional', description: 'Clean two-tone header with a contemporary feel.', category: 'Professional', isAtsFriendly: true },
  { templateId: 'minimal', name: 'Minimal', description: 'Elegant whitespace and typography with zero clutter.', category: 'Minimal', isAtsFriendly: true },
  { templateId: 'corporate', name: 'Corporate', description: 'Structured sidebar layout for business roles.', category: 'Professional', isAtsFriendly: false },
  { templateId: 'creative', name: 'Creative', description: 'Bold accent styling for design and media roles.', category: 'Creative', isAtsFriendly: false },
  { templateId: 'executive', name: 'Executive', description: 'Premium editorial layout for senior and management profiles.', category: 'Executive', isAtsFriendly: true },
  { templateId: 'tech-focus', name: 'Tech Focus', description: 'Compact developer-first layout for technical resumes.', category: 'Technology', isAtsFriendly: true },
  { templateId: 'elegant', name: 'Elegant', description: 'Refined serif typography for polished professional profiles.', category: 'Elegant', isAtsFriendly: true },
  { templateId: 'compact-ats', name: 'Compact ATS', description: 'Dense, space-efficient format for one-page resumes.', category: 'ATS', isAtsFriendly: true },
  { templateId: 'bold-modern', name: 'Bold Modern', description: 'Strong visual hierarchy for modern product and business roles.', category: 'Modern', isAtsFriendly: false },
  { templateId: 'photo-sidebar', name: 'Photo Sidebar', description: 'Dark sidebar with a round profile photo, contact and skills.', category: 'Photo', isAtsFriendly: false, hasPhoto: true },
  { templateId: 'photo-classic', name: 'Photo Classic', description: 'Traditional serif layout with your photo beside the name.', category: 'Photo', isAtsFriendly: false, hasPhoto: true },
  { templateId: 'photo-modern', name: 'Photo Modern', description: 'Colour header banner with a rounded portrait on the right.', category: 'Photo', isAtsFriendly: false, hasPhoto: true },
  { templateId: 'photo-creative', name: 'Photo Creative', description: 'Soft pastel sidebar with a large framed photo and skill chips.', category: 'Photo', isAtsFriendly: false, hasPhoto: true },
  { templateId: 'photo-executive', name: 'Photo Executive', description: 'Formal editorial layout with a square portrait at top right.', category: 'Photo', isAtsFriendly: false, hasPhoto: true },
];

const listTemplates = asyncHandler(async (req, res) => res.json({ success: true, data: TEMPLATES }));
module.exports = { listTemplates, TEMPLATES };
