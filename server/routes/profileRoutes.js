const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadProfilePicture,
  uploadProfileResume,
  handleMulterError,
} = require('../middleware/uploadMiddleware');
const {
  getFullProfile,
  createProfile,
  updateProfile,
  uploadPicture,
  uploadResume,
  listEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  listExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/profileController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getFullProfile);
router.post('/', createProfile);
router.put('/', updateProfile);

router.post(
  '/picture',
  handleMulterError(uploadProfilePicture.single('picture')),
  uploadPicture
);

router.post(
  '/resume',
  handleMulterError(uploadProfileResume.single('resume')),
  uploadResume
);

router.get('/education', listEducation);
router.post('/education', createEducation);
router.put('/education/:id', updateEducation);
router.delete('/education/:id', deleteEducation);

router.get('/experience', listExperience);
router.post('/experience', createExperience);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

router.get('/projects', listProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

module.exports = router;
