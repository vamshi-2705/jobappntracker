const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generateResume } = require('../controllers/resumeController');

const router = express.Router();
router.use(authMiddleware);
router.post('/generate', generateResume);

module.exports = router;
