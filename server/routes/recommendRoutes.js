const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { recommendJobs } = require('../controllers/recommendController');

const router = express.Router();
router.use(authMiddleware);
router.post('/jobs', recommendJobs);

module.exports = router;
