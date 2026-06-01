const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  uploadCertificateFile: uploadCertMulter,
  handleMulterError,
} = require('../middleware/uploadMiddleware');
const {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  uploadCertificateFile,
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/certificateController');

const certificatesRouter = express.Router();
const achievementsRouter = express.Router();
const coursesRouter = express.Router();

certificatesRouter.use(authMiddleware);
achievementsRouter.use(authMiddleware);
coursesRouter.use(authMiddleware);

certificatesRouter.get('/', getCertificates);
certificatesRouter.post('/', createCertificate);
certificatesRouter.put('/:id', updateCertificate);
certificatesRouter.delete('/:id', deleteCertificate);
certificatesRouter.post(
  '/:id/file',
  handleMulterError(uploadCertMulter.single('certificate')),
  uploadCertificateFile
);

achievementsRouter.get('/', getAchievements);
achievementsRouter.post('/', createAchievement);
achievementsRouter.put('/:id', updateAchievement);
achievementsRouter.delete('/:id', deleteAchievement);

coursesRouter.get('/', getCourses);
coursesRouter.post('/', createCourse);
coursesRouter.put('/:id', updateCourse);
coursesRouter.delete('/:id', deleteCourse);

module.exports = { certificatesRouter, achievementsRouter, coursesRouter };
