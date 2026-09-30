const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, updateProfileImage, deleteAccount } = require('../controllers/userController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();
router.use(verifyAuth);

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('phone').optional().isString().isLength({ max: 30 }),
    body('location').optional().isString().isLength({ max: 120 }),
    body('professionalTitle').optional().isString().isLength({ max: 120 }),
    body('bio').optional().isString().isLength({ max: 1000 }),
    body('yearsOfExperience').optional().isNumeric(),
  ],
  updateProfile
);
router.post('/profile-image', updateProfileImage);
router.delete('/account', deleteAccount);

module.exports = router;
