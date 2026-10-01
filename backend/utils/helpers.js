
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function sendError(res, status, message, code = 'ERROR') {
  return res.status(status).json({ success: false, code, message });
}

const MAX_IMAGE_DATA_URL = 700 * 1024; // ~500KB of image data after base64
function isValidImageValue(value) {
  if (value === '' || value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  if (/^https:\/\/[^\s]+$/i.test(value) && value.length <= 2048) return true;
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= MAX_IMAGE_DATA_URL;
}

module.exports = { asyncHandler, sendError, isValidImageValue };
