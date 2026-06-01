const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadResume');
const {
  resumeMatch,
  coverLetter,
  interviewQuestions,
  parseResume,
  interviewPrep,
} = require('../controllers/aiController');

const router = express.Router();

router.use(authMiddleware);

router.post('/parse-resume', (req, res, next) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File must be 5MB or smaller' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
}, parseResume);

router.post('/match', resumeMatch);
router.post('/coverletter', coverLetter);
router.post('/questions', interviewQuestions);
router.post('/interview-prep', interviewPrep);

module.exports = router;
