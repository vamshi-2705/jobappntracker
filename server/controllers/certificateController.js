const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const { uploadsRoot } = require('../middleware/uploadMiddleware');

const ACHIEVEMENT_CATEGORIES = [
  'Academic',
  'Professional',
  'Sports',
  'Volunteer',
  'Competition',
  'Other',
];

const COURSE_PLATFORMS = ['Udemy', 'Coursera', 'edX', 'YouTube', 'Other'];

const isValidUrl = (value) => {
  if (!value || !String(value).trim()) return true;
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
};

const enrichCertificate = (row) => {
  if (!row) return row;
  const expired = isExpired(row.expiry_date);
  return { ...row, is_expired: expired };
};

const deleteFileIfExists = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const relative = publicPath.replace(/^\/uploads\//, '');
  const fullPath = path.join(uploadsRoot, relative);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const verifyOwnership = async (table, id, userId) => {
  const result = await query(`SELECT id FROM ${table} WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
  return result.rows.length > 0;
};

const getCertificates = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM certificates WHERE user_id = $1 ORDER BY issue_date DESC NULLS LAST`,
      [req.user.id]
    );
    res.status(200).json(result.rows.map(enrichCertificate));
  } catch (error) {
    console.error('Get certificates error:', error.message);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

const createCertificate = async (req, res) => {
  try {
    const {
      title,
      issuer,
      issue_date,
      expiry_date,
      credential_id,
      credential_url,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Certificate title is required' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }
    if (credential_url && !isValidUrl(credential_url)) {
      return res.status(400).json({ message: 'Credential URL must be valid http(s)' });
    }

    const expired = isExpired(expiry_date);

    const result = await query(
      `INSERT INTO certificates (
         user_id, title, issuer, issue_date, expiry_date,
         credential_id, credential_url, is_expired
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.id,
        title.trim(),
        issuer?.trim() || null,
        issue_date || null,
        expiry_date || null,
        credential_id?.trim() || null,
        credential_url?.trim() || null,
        expired,
      ]
    );

    res.status(201).json(enrichCertificate(result.rows[0]));
  } catch (error) {
    console.error('Create certificate error:', error.message);
    res.status(500).json({ message: 'Failed to add certificate' });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('certificates', id, req.user.id))) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const {
      title,
      issuer,
      issue_date,
      expiry_date,
      credential_id,
      credential_url,
    } = req.body;

    if (credential_url && !isValidUrl(credential_url)) {
      return res.status(400).json({ message: 'Credential URL must be valid http(s)' });
    }

    const result = await query(
      `UPDATE certificates SET
         title = COALESCE($1, title),
         issuer = COALESCE($2, issuer),
         issue_date = COALESCE($3, issue_date),
         expiry_date = COALESCE($4, expiry_date),
         credential_id = COALESCE($5, credential_id),
         credential_url = COALESCE($6, credential_url)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        issuer !== undefined ? (issuer?.trim() || null) : null,
        issue_date !== undefined ? issue_date : null,
        expiry_date !== undefined ? expiry_date : null,
        credential_id !== undefined ? (credential_id?.trim() || null) : null,
        credential_url !== undefined ? (credential_url?.trim() || null) : null,
        id,
        req.user.id,
      ]
    );

    const row = result.rows[0];
    const expired = isExpired(row.expiry_date);
    await query('UPDATE certificates SET is_expired = $1 WHERE id = $2', [expired, id]);
    row.is_expired = expired;

    res.status(200).json(enrichCertificate(row));
  } catch (error) {
    console.error('Update certificate error:', error.message);
    res.status(500).json({ message: 'Failed to update certificate' });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const existing = await query(
      'SELECT certificate_file FROM certificates WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    deleteFileIfExists(existing.rows[0].certificate_file);
    await query('DELETE FROM certificates WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error.message);
    res.status(500).json({ message: 'Failed to delete certificate' });
  }
};

const uploadCertificateFile = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!req.file) {
      return res.status(400).json({ message: 'No certificate file uploaded' });
    }

    const existing = await query(
      'SELECT certificate_file FROM certificates WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    deleteFileIfExists(existing.rows[0].certificate_file);
    const publicUrl = `/uploads/certificates/${req.file.filename}`;

    const result = await query(
      'UPDATE certificates SET certificate_file = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [publicUrl, id, req.user.id]
    );

    res.status(200).json(enrichCertificate(result.rows[0]));
  } catch (error) {
    console.error('Upload certificate file error:', error.message);
    res.status(500).json({ message: 'Failed to upload certificate file' });
  }
};

const getAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM achievements WHERE user_id = $1';
    const params = [req.user.id];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY date DESC NULLS LAST';
    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get achievements error:', error.message);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
};

const createAchievement = async (req, res) => {
  try {
    const { title, description, date, issuer, category } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Achievement title is required' });
    }
    if (category && !ACHIEVEMENT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${ACHIEVEMENT_CATEGORIES.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO achievements (user_id, title, description, date, issuer, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description?.trim() || null,
        date || null,
        issuer?.trim() || null,
        category || 'Other',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create achievement error:', error.message);
    res.status(500).json({ message: 'Failed to add achievement' });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('achievements', id, req.user.id))) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    const { title, description, date, issuer, category } = req.body;

    if (category && !ACHIEVEMENT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${ACHIEVEMENT_CATEGORIES.join(', ')}`,
      });
    }

    const result = await query(
      `UPDATE achievements SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         date = COALESCE($3, date),
         issuer = COALESCE($4, issuer),
         category = COALESCE($5, category)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        description !== undefined ? (description?.trim() || null) : null,
        date !== undefined ? date : null,
        issuer !== undefined ? (issuer?.trim() || null) : null,
        category !== undefined ? category : null,
        id,
        req.user.id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update achievement error:', error.message);
    res.status(500).json({ message: 'Failed to update achievement' });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM achievements WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    res.status(200).json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error.message);
    res.status(500).json({ message: 'Failed to delete achievement' });
  }
};

const getCourses = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM courses WHERE user_id = $1 ORDER BY completion_date DESC NULLS LAST',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get courses error:', error.message);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, platform, completion_date, duration, url } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Course title is required' });
    }
    if (platform && !COURSE_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        message: `Platform must be one of: ${COURSE_PLATFORMS.join(', ')}`,
      });
    }
    if (url && !isValidUrl(url)) {
      return res.status(400).json({ message: 'Course URL must be valid http(s)' });
    }

    const result = await query(
      `INSERT INTO courses (user_id, title, platform, completion_date, duration, url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id,
        title.trim(),
        platform || 'Other',
        completion_date || null,
        duration?.trim() || null,
        url?.trim() || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create course error:', error.message);
    res.status(500).json({ message: 'Failed to add course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!(await verifyOwnership('courses', id, req.user.id))) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { title, platform, completion_date, duration, url } = req.body;

    if (platform && !COURSE_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        message: `Platform must be one of: ${COURSE_PLATFORMS.join(', ')}`,
      });
    }
    if (url && !isValidUrl(url)) {
      return res.status(400).json({ message: 'Course URL must be valid http(s)' });
    }

    const result = await query(
      `UPDATE courses SET
         title = COALESCE($1, title),
         platform = COALESCE($2, platform),
         completion_date = COALESCE($3, completion_date),
         duration = COALESCE($4, duration),
         url = COALESCE($5, url)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        platform !== undefined ? platform : null,
        completion_date !== undefined ? completion_date : null,
        duration !== undefined ? (duration?.trim() || null) : null,
        url !== undefined ? (url?.trim() || null) : null,
        id,
        req.user.id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update course error:', error.message);
    res.status(500).json({ message: 'Failed to update course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error.message);
    res.status(500).json({ message: 'Failed to delete course' });
  }
};

module.exports = {
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
  ACHIEVEMENT_CATEGORIES,
  COURSE_PLATFORMS,
};
