// Centralized async wrapper + error helpers for controllers.

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function sendError(res, status, message, code = 'ERROR') {
  return res.status(status).json({ success: false, code, message });
}

module.exports = { asyncHandler, sendError };
