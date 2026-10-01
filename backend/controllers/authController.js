const { asyncHandler } = require('../utils/helpers');

// GET /api/auth/me — returns the authenticated user's Mongo profile.
// The verifyAuth middleware has already verified the Firebase token.
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { getMe };
