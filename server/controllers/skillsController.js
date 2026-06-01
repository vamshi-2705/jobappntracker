const { query } = require('../config/db');

const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Programming Language',
  'Mobile',
  'AI/ML',
  'Tools',
  'Soft Skills',
  'Other',
];

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const LANGUAGE_PROFICIENCY = ['Basic', 'Conversational', 'Fluent', 'Native'];

const verifySkillOwnership = async (id, userId) => {
  const result = await query('SELECT id FROM skills WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return result.rows.length > 0;
};

const verifyLanguageOwnership = async (id, userId) => {
  const result = await query('SELECT id FROM languages WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return result.rows.length > 0;
};

const getSkills = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM skills WHERE user_id = $1';
    const params = [req.user.id];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim().toLowerCase()}%`);
      sql += ` AND LOWER(name) LIKE $${params.length}`;
    }

    sql += ' ORDER BY category ASC, name ASC';

    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get skills error:', error.message);
    res.status(500).json({ message: 'Failed to fetch skills' });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, category, proficiency, years_of_experience } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'Skill name must be 100 characters or less' });
    }
    if (category && !SKILL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${SKILL_CATEGORIES.join(', ')}`,
      });
    }
    if (proficiency && !PROFICIENCY_LEVELS.includes(proficiency)) {
      return res.status(400).json({
        message: `Proficiency must be one of: ${PROFICIENCY_LEVELS.join(', ')}`,
      });
    }
    if (
      years_of_experience !== undefined &&
      years_of_experience !== null &&
      (Number.isNaN(Number(years_of_experience)) || Number(years_of_experience) < 0)
    ) {
      return res.status(400).json({ message: 'Years of experience must be a non-negative number' });
    }

    const result = await query(
      `INSERT INTO skills (user_id, name, category, proficiency, years_of_experience)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.user.id,
        name.trim(),
        category || 'Other',
        proficiency || 'Beginner',
        years_of_experience != null ? Number(years_of_experience) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create skill error:', error.message);
    res.status(500).json({ message: 'Failed to add skill' });
  }
};

const updateSkill = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid skill id' });
    }
    if (!(await verifySkillOwnership(id, req.user.id))) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const { name, category, proficiency, years_of_experience } = req.body;

    if (name !== undefined && (!name || !String(name).trim())) {
      return res.status(400).json({ message: 'Skill name cannot be empty' });
    }
    if (category !== undefined && category && !SKILL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${SKILL_CATEGORIES.join(', ')}`,
      });
    }
    if (proficiency !== undefined && proficiency && !PROFICIENCY_LEVELS.includes(proficiency)) {
      return res.status(400).json({
        message: `Proficiency must be one of: ${PROFICIENCY_LEVELS.join(', ')}`,
      });
    }

    const result = await query(
      `UPDATE skills SET
         name = COALESCE($1, name),
         category = COALESCE($2, category),
         proficiency = COALESCE($3, proficiency),
         years_of_experience = COALESCE($4, years_of_experience)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [
        name !== undefined ? name.trim() : null,
        category !== undefined ? category : null,
        proficiency !== undefined ? proficiency : null,
        years_of_experience !== undefined
          ? years_of_experience != null
            ? Number(years_of_experience)
            : null
          : null,
        id,
        req.user.id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update skill error:', error.message);
    res.status(500).json({ message: 'Failed to update skill' });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid skill id' });
    }

    const result = await query(
      'DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error.message);
    res.status(500).json({ message: 'Failed to delete skill' });
  }
};

const getLanguages = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM languages WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get languages error:', error.message);
    res.status(500).json({ message: 'Failed to fetch languages' });
  }
};

const createLanguage = async (req, res) => {
  try {
    const { name, proficiency } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Language name is required' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'Language name must be 100 characters or less' });
    }
    if (proficiency && !LANGUAGE_PROFICIENCY.includes(proficiency)) {
      return res.status(400).json({
        message: `Proficiency must be one of: ${LANGUAGE_PROFICIENCY.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO languages (user_id, name, proficiency)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, name.trim(), proficiency || 'Conversational']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create language error:', error.message);
    res.status(500).json({ message: 'Failed to add language' });
  }
};

const deleteLanguage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid language id' });
    }

    if (!(await verifyLanguageOwnership(id, req.user.id))) {
      return res.status(404).json({ message: 'Language not found' });
    }

    await query('DELETE FROM languages WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.status(200).json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Delete language error:', error.message);
    res.status(500).json({ message: 'Failed to delete language' });
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getLanguages,
  createLanguage,
  deleteLanguage,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  LANGUAGE_PROFICIENCY,
};
