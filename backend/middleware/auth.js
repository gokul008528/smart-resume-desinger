const { getAdmin } = require('../config/firebase');
const { sendError } = require('../utils/helpers');
const User = require('../models/User');

async function verifyAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');

  const admin = getAdmin();
  if (!admin) return sendError(res, 500, 'Server auth is not configured.', 'AUTH_NOT_CONFIGURED');

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        name: name || (email ? email.split('@')[0] : 'User'),
        profileImage: picture || '',
      });
    }
    req.firebaseUser = decoded;
    req.user = user;
    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return sendError(res, 401, 'Session expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid or expired session. Please log in again.', 'INVALID_TOKEN');
  }
}

module.exports = { verifyAuth };
