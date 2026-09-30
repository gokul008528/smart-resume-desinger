const express = require('express');
const { getMe } = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/me', verifyAuth, getMe);

module.exports = router;
