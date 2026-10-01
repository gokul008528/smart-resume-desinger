const express = require('express');
const { listTemplates } = require('../controllers/templateController');

const router = express.Router();
router.get('/', listTemplates); // public catalog

module.exports = router;
