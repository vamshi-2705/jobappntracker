const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
