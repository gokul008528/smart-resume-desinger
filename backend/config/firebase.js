const admin = require('firebase-admin');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin;
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('[Firebase Admin] Credentials missing. Auth verification will fail until configured.');
    return null;
  }
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
    console.log('[Firebase Admin] Initialized');
  } catch (err) {
    console.error('[Firebase Admin] Init failed:', err.message);
    return null;
  }
  return admin;
}

function getAdmin() {
  if (!initialized) initFirebaseAdmin();
  return initialized ? admin : null;
}

module.exports = { initFirebaseAdmin, getAdmin };
