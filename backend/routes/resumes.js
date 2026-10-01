const express = require('express');
const {
  listResumes, createResume, getResume, updateResume, deleteResume, duplicateResume,
} = require('../controllers/resumeController');
const {
  listVersions, createVersion, restoreVersion, renameVersion, deleteVersion,
} = require('../controllers/versionController');
const { enableSharing, disableSharing } = require('../controllers/shareController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();
router.use(verifyAuth);

router.get('/', listResumes);
router.post('/', createResume);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);

router.get('/:id/versions', listVersions);
router.post('/:id/versions', createVersion);
router.post('/:id/versions/:versionId/restore', restoreVersion);
router.patch('/:id/versions/:versionId', renameVersion);
router.delete('/:id/versions/:versionId', deleteVersion);

router.post('/:id/share', enableSharing);
router.delete('/:id/share', disableSharing);

module.exports = router;
