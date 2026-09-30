const { asyncHandler } = require('../utils/helpers');

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { getMe };
