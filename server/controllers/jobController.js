const { query } = require('../config/db');

const VALID_STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected'];

const validateJobFields = (body, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || body.company !== undefined) {
    if (!body.company || !String(body.company).trim()) {
      errors.push('Company is required');
    } else if (String(body.company).trim().length > 100) {
      errors.push('Company must be 100 characters or less');
    }
  }

  if (!isUpdate || body.position !== undefined) {
    if (!body.position || !String(body.position).trim()) {
      errors.push('Position is required');
    } else if (String(body.position).trim().length > 100) {
      errors.push('Position must be 100 characters or less');
    }
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  return errors;
};

const getJobs = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, company, position, status, job_description, notes,
              applied_date, created_at
       FROM jobs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get jobs error:', error.message);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

const createJob = async (req, res) => {
  try {
    const errors = validateJobFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    const {
      company,
      position,
      status = 'Applied',
      job_description = null,
      notes = null,
      applied_date = null,
    } = req.body;

    const result = await query(
      `INSERT INTO jobs (user_id, company, position, status, job_description, notes, applied_date)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
       RETURNING id, company, position, status, job_description, notes, applied_date, created_at`,
      [
        req.user.id,
        company.trim(),
        position.trim(),
        status,
        job_description || null,
        notes || null,
        applied_date || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create job error:', error.message);
    res.status(500).json({ message: 'Server error creating job' });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id, 10);

    if (Number.isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const errors = validateJobFields(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }

    const existing = await query(
      'SELECT id FROM jobs WHERE id = $1 AND user_id = $2',
      [jobId, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const {
      company,
      position,
      status,
      job_description,
      notes,
      applied_date,
    } = req.body;

    const result = await query(
      `UPDATE jobs SET
         company = COALESCE($1, company),
         position = COALESCE($2, position),
         status = COALESCE($3, status),
         job_description = COALESCE($4, job_description),
         notes = COALESCE($5, notes),
         applied_date = COALESCE($6, applied_date)
       WHERE id = $7 AND user_id = $8
       RETURNING id, company, position, status, job_description, notes, applied_date, created_at`,
      [
        company !== undefined ? company.trim() : null,
        position !== undefined ? position.trim() : null,
        status !== undefined ? status : null,
        job_description !== undefined ? job_description : null,
        notes !== undefined ? notes : null,
        applied_date !== undefined ? applied_date : null,
        jobId,
        req.user.id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update job error:', error.message);
    res.status(500).json({ message: 'Server error updating job' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id, 10);

    if (Number.isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const result = await query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id',
      [jobId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error.message);
    res.status(500).json({ message: 'Server error deleting job' });
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob };
