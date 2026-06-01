const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getLanguages,
  createLanguage,
  deleteLanguage,
} = require('../controllers/skillsController');

const skillsRouter = express.Router();
const languagesRouter = express.Router();

skillsRouter.use(authMiddleware);
languagesRouter.use(authMiddleware);

skillsRouter.get('/', getSkills);
skillsRouter.post('/', createSkill);
skillsRouter.put('/:id', updateSkill);
skillsRouter.delete('/:id', deleteSkill);

languagesRouter.get('/', getLanguages);
languagesRouter.post('/', createLanguage);
languagesRouter.delete('/:id', deleteLanguage);

module.exports = { skillsRouter, languagesRouter };
