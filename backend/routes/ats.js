const express = require('express');
const { analyze } = require('../controllers/atsController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/analyze', verifyAuth, analyze);

module.exports = router;
