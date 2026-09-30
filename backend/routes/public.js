const express = require('express');
const { getPublicResume } = require('../controllers/shareController');

const router = express.Router();
router.get('/resume/:username/:resumeSlug', getPublicResume); // public

module.exports = router;
