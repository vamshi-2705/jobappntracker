const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const { uploadsRoot } = require('../middleware/uploadMiddleware');

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Other'];

const isValidUrl = (value) => {
  if (!value || !String(value).trim()) return true;
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const calculateCompletionPercent = (profile, counts) => {
  let percent = 0;
  const p = profile || {};

  if (p.profile_picture) percent += 10;
  if (p.headline?.trim()) percent += 10;
  if (p.bio?.trim() && p.bio.trim().length >= 20) percent += 10;
  if (p.phone?.trim()) percent += 5;
  if (p.location?.trim()) percent += 5;
  if (p.date_of_birth) percent += 5;
  if (p.gender?.trim()) percent += 5;
  if (p.github_url?.trim() || p.linkedin_url?.trim() || p.portfolio_url?.trim()) percent += 10;
  if (p.resume_url) percent += 15;
  if (counts.education > 0) percent += 15;
  if (counts.experience > 0) percent += 10;
  if (counts.projects > 0) percent += 10;

  return Math.min(100, percent);
};

const refreshCompletionPercent = async (userId) => {
  const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  const eduCount = await query('SELECT COUNT(*)::int AS c FROM education WHERE user_id = $1', [userId]);
  const expCount = await query('SELECT COUNT(*)::int AS c FROM experience WHERE user_id = $1', [userId]);
  const projCount = await query('SELECT COUNT(*)::int AS c FROM projects WHERE user_id = $1', [userId]);

  const counts = {
    education: eduCount.rows[0].c,
    experience: expCount.rows[0].c,
    projects: projCount.rows[0].c,
  };

  const percent = calculateCompletionPercent(profileRes.rows[0], counts);

  if (profileRes.rows.length > 0) {
    await query(
      'UPDATE profiles SET completion_percent = $1 WHERE user_id = $2',
      [percent, userId]
    );
  }

  return percent;
};

const deleteFileIfExists = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const relative = publicPath.replace(/^\/uploads\//, '');
  const fullPath = path.join(uploadsRoot, relative);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const getFullProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    const profileResult = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const educationResult = await query(
      `SELECT * FROM education WHERE user_id = $1
       ORDER BY end_year DESC NULLS LAST, start_year DESC NULLS LAST`,
      [userId]
    );
    const experienceResult = await query(
      `SELECT * FROM experience WHERE user_id = $1
       ORDER BY is_current DESC, start_date DESC NULLS LAST`,
      [userId]
    );
    const projectsResult = await query(
      `SELECT * FROM projects WHERE user_id = $1
       ORDER BY end_date DESC NULLS LAST, start_date DESC NULLS LAST`,
      [userId]
    );

    const completionPercent = await refreshCompletionPercent(userId);
    const profile = profileResult.rows[0] || null;
    if (profile) {
      profile.completion_percent = completionPercent;
    }

    res.status(200).json({
      user: userResult.rows[0],
      profile,
      education: educationResult.rows,
      experience: experienceResult.rows,
      projects: projectsResult.rows,
      completionPercent,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const validateProfileBody = (body, isUpdate = false) => {
  const errors = [];

  if (body.headline !== undefined && body.headline && body.headline.length > 200) {
    errors.push('Headline must be 200 characters or less');
  }
  if (body.phone !== undefined && body.phone && body.phone.length > 20) {
    errors.push('Phone must be 20 characters or less');
  }
  if (body.location !== undefined && body.location && body.location.length > 100) {
    errors.push('Location must be 100 characters or less');
  }
  if (body.gender !== undefined && body.gender && !GENDERS.includes(body.gender)) {
    errors.push(`Gender must be one of: ${GENDERS.join(', ')}`);
  }
  if (body.github_url !== undefined && !isValidUrl(body.github_url)) {
    errors.push('GitHub URL must be a valid http(s) URL');
  }
  if (body.linkedin_url !== undefined && !isValidUrl(body.linkedin_url)) {
    errors.push('LinkedIn URL must be a valid http(s) URL');
  }
  if (body.portfolio_url !== undefined && !isValidUrl(body.portfolio_url)) {
    errors.push('Portfolio URL must be a valid http(s) URL');
  }

  if (!isUpdate) {
    const hasField =
      body.headline ||
      body.bio ||
      body.phone ||
      body.location ||
      body.date_of_birth ||
      body.gender ||
      body.github_url ||
      body.linkedin_url ||
      body.portfolio_url;
    if (!hasField) {
      errors.push('Provide at least one profile field to create');
    }
  }

  return errors;
};

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Profile already exists. Use PUT to update.' });
    }

    const errors = validateProfileBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    const {
      headline,
      bio,
      phone,
      location,
      date_of_birth,
      gender,
      github_url,
      linkedin_url,
      portfolio_url,
    } = req.body;

    const result = await query(
      `INSERT INTO profiles (
         user_id, headline, bio, phone, location, date_of_birth, gender,
         github_url, linkedin_url, portfolio_url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        headline?.trim() || null,
        bio?.trim() || null,
        phone?.trim() || null,
        location?.trim() || null,
        date_of_birth || null,
        gender || null,
        github_url?.trim() || null,
        linkedin_url?.trim() || null,
        portfolio_url?.trim() || null,
      ]
    );

    const completionPercent = await refreshCompletionPercent(userId);
    const profile = result.rows[0];
    profile.completion_percent = completionPercent;

    res.status(201).json({ profile, completionPercent });
  } catch (error) {
    console.error('Create profile error:', error.message);
    res.status(500).json({ message: 'Failed to create profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const errors = validateProfileBody(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    let profileResult = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (profileResult.rows.length === 0) {
      const insert = await query(
        `INSERT INTO profiles (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );
      profileResult = insert;
    }

    const {
      headline,
      bio,
      phone,
      location,
      date_of_birth,
      gender,
      github_url,
      linkedin_url,
      portfolio_url,
    } = req.body;

    const result = await query(
      `UPDATE profiles SET
         headline = COALESCE($1, headline),
         bio = COALESCE($2, bio),
         phone = COALESCE($3, phone),
         location = COALESCE($4, location),
         date_of_birth = COALESCE($5, date_of_birth),
         gender = COALESCE($6, gender),
         github_url = COALESCE($7, github_url),
         linkedin_url = COALESCE($8, linkedin_url),
         portfolio_url = COALESCE($9, portfolio_url)
       WHERE user_id = $10
       RETURNING *`,
      [
        headline !== undefined ? (headline?.trim() || null) : null,
        bio !== undefined ? (bio?.trim() || null) : null,
        phone !== undefined ? (phone?.trim() || null) : null,
        location !== undefined ? (location?.trim() || null) : null,
        date_of_birth !== undefined ? date_of_birth || null : null,
        gender !== undefined ? gender || null : null,
        github_url !== undefined ? (github_url?.trim() || null) : null,
        linkedin_url !== undefined ? (linkedin_url?.trim() || null) : null,
        portfolio_url !== undefined ? (portfolio_url?.trim() || null) : null,
        userId,
      ]
    );

    const completionPercent = await refreshCompletionPercent(userId);
    const profile = result.rows[0];
    profile.completion_percent = completionPercent;

    res.status(200).json({ profile, completionPercent });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const uploadPicture = async (req, res) => {
  try {
    if (!req.file) {
      console.log('UPLOAD FAILURE: req.file is empty');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const userId = req.user.id;
    const publicUrl = `/uploads/profiles/${req.file.filename}`;
    
    console.log('UPLOAD SUCCESSFUL: saved file to', req.file.path);
    console.log('PUBLIC URL TO BE RETURNED:', publicUrl);

    let profile = await query('SELECT profile_picture FROM profiles WHERE user_id = $1', [userId]);

    if (profile.rows.length === 0) {
      await query('INSERT INTO profiles (user_id, profile_picture) VALUES ($1, $2)', [
        userId,
        publicUrl,
      ]);
    } else {
      deleteFileIfExists(profile.rows[0].profile_picture);
      await query('UPDATE profiles SET profile_picture = $1 WHERE user_id = $2', [
        publicUrl,
        userId,
      ]);
    }

    const completionPercent = await refreshCompletionPercent(userId);
    res.status(200).json({ profilePicture: publicUrl, completionPercent });
  } catch (error) {
    console.error('Upload picture error:', error.message);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF resume uploaded' });
    }

    const userId = req.user.id;
    const publicUrl = `/uploads/resumes/${req.file.filename}`;

    let profile = await query('SELECT resume_url FROM profiles WHERE user_id = $1', [userId]);

    if (profile.rows.length === 0) {
      await query('INSERT INTO profiles (user_id, resume_url) VALUES ($1, $2)', [
        userId,
        publicUrl,
      ]);
    } else {
      deleteFileIfExists(profile.rows[0].resume_url);
      await query('UPDATE profiles SET resume_url = $1 WHERE user_id = $2', [publicUrl, userId]);
    }

    const completionPercent = await refreshCompletionPercent(userId);
    res.status(200).json({ resumeUrl: publicUrl, completionPercent });
  } catch (error) {
    console.error('Upload resume error:', error.message);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
};

const verifyOwnership = async (table, id, userId) => {
  const result = await query(
    `SELECT id FROM ${table} WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows.length > 0;
};

const listEducation = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM education WHERE user_id = $1 ORDER BY end_year DESC NULLS LAST',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch education' });
  }
};

const createEducation = async (req, res) => {
  try {
    const { institution, degree, field_of_study, start_year, end_year, grade, description } =
      req.body;
    if (!institution?.trim() || !degree?.trim()) {
      return res.status(400).json({ message: 'Institution and degree are required' });
    }

    const result = await query(
      `INSERT INTO education (user_id, institution, degree, field_of_study, start_year, end_year, grade, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.id,
        institution.trim(),
        degree.trim(),
        field_of_study?.trim() || null,
        start_year || null,
        end_year || null,
        grade?.trim() || null,
        description?.trim() || null,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(201).json({ education: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add education' });
  }
};

const updateEducation = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('education', id, req.user.id))) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    const { institution, degree, field_of_study, start_year, end_year, grade, description } =
      req.body;

    const result = await query(
      `UPDATE education SET
         institution = COALESCE($1, institution),
         degree = COALESCE($2, degree),
         field_of_study = COALESCE($3, field_of_study),
         start_year = COALESCE($4, start_year),
         end_year = COALESCE($5, end_year),
         grade = COALESCE($6, grade),
         description = COALESCE($7, description)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [
        institution !== undefined ? institution.trim() : null,
        degree !== undefined ? degree.trim() : null,
        field_of_study !== undefined ? (field_of_study?.trim() || null) : null,
        start_year !== undefined ? start_year : null,
        end_year !== undefined ? end_year : null,
        grade !== undefined ? (grade?.trim() || null) : null,
        description !== undefined ? (description?.trim() || null) : null,
        id,
        req.user.id,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ education: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update education' });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM education WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ message: 'Deleted', completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete education' });
  }
};

const listExperience = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM experience WHERE user_id = $1 ORDER BY is_current DESC, start_date DESC NULLS LAST',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch experience' });
  }
};

const createExperience = async (req, res) => {
  try {
    const {
      company,
      role,
      employment_type,
      location,
      start_date,
      end_date,
      is_current,
      description,
    } = req.body;

    if (!company?.trim() || !role?.trim()) {
      return res.status(400).json({ message: 'Company and role are required' });
    }
    if (employment_type && !EMPLOYMENT_TYPES.includes(employment_type)) {
      return res.status(400).json({
        message: `Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO experience (
         user_id, company, role, employment_type, location,
         start_date, end_date, is_current, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.user.id,
        company.trim(),
        role.trim(),
        employment_type || null,
        location?.trim() || null,
        start_date || null,
        is_current ? null : end_date || null,
        Boolean(is_current),
        description?.trim() || null,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(201).json({ experience: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add experience' });
  }
};

const updateExperience = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('experience', id, req.user.id))) {
      return res.status(404).json({ message: 'Experience record not found' });
    }

    const {
      company,
      role,
      employment_type,
      location,
      start_date,
      end_date,
      is_current,
      description,
    } = req.body;

    if (employment_type && !EMPLOYMENT_TYPES.includes(employment_type)) {
      return res.status(400).json({
        message: `Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      });
    }

    const result = await query(
      `UPDATE experience SET
         company = COALESCE($1, company),
         role = COALESCE($2, role),
         employment_type = COALESCE($3, employment_type),
         location = COALESCE($4, location),
         start_date = COALESCE($5, start_date),
         end_date = COALESCE($6, end_date),
         is_current = COALESCE($7, is_current),
         description = COALESCE($8, description)
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [
        company !== undefined ? company.trim() : null,
        role !== undefined ? role.trim() : null,
        employment_type !== undefined ? employment_type : null,
        location !== undefined ? (location?.trim() || null) : null,
        start_date !== undefined ? start_date : null,
        end_date !== undefined ? end_date : null,
        is_current !== undefined ? Boolean(is_current) : null,
        description !== undefined ? (description?.trim() || null) : null,
        id,
        req.user.id,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ experience: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update experience' });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM experience WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Experience record not found' });
    }

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ message: 'Deleted', completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete experience' });
  }
};

const listProjects = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY end_date DESC NULLS LAST',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, tech_stack, github_url, live_url, start_date, end_date } =
      req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Project title is required' });
    }
    if (github_url && !isValidUrl(github_url)) {
      return res.status(400).json({ message: 'GitHub URL must be valid' });
    }
    if (live_url && !isValidUrl(live_url)) {
      return res.status(400).json({ message: 'Live URL must be valid' });
    }

    const result = await query(
      `INSERT INTO projects (
         user_id, title, description, tech_stack, github_url, live_url, start_date, end_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description?.trim() || null,
        tech_stack?.trim() || null,
        github_url?.trim() || null,
        live_url?.trim() || null,
        start_date || null,
        end_date || null,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(201).json({ project: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('projects', id, req.user.id))) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, tech_stack, github_url, live_url, start_date, end_date } =
      req.body;

    if (github_url && !isValidUrl(github_url)) {
      return res.status(400).json({ message: 'GitHub URL must be valid' });
    }
    if (live_url && !isValidUrl(live_url)) {
      return res.status(400).json({ message: 'Live URL must be valid' });
    }

    const result = await query(
      `UPDATE projects SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         tech_stack = COALESCE($3, tech_stack),
         github_url = COALESCE($4, github_url),
         live_url = COALESCE($5, live_url),
         start_date = COALESCE($6, start_date),
         end_date = COALESCE($7, end_date)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        description !== undefined ? (description?.trim() || null) : null,
        tech_stack !== undefined ? (tech_stack?.trim() || null) : null,
        github_url !== undefined ? (github_url?.trim() || null) : null,
        live_url !== undefined ? (live_url?.trim() || null) : null,
        start_date !== undefined ? start_date : null,
        end_date !== undefined ? end_date : null,
        id,
        req.user.id,
      ]
    );

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ project: result.rows[0], completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const completionPercent = await refreshCompletionPercent(req.user.id);
    res.status(200).json({ message: 'Deleted', completionPercent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

module.exports = {
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
  refreshCompletionPercent,
};
