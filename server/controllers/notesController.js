const { query } = require('../config/db');

const NOTE_COLORS = ['yellow', 'blue', 'green', 'pink'];

const getNotes = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, color } = req.body;
    if (color && !NOTE_COLORS.includes(color)) {
      return res.status(400).json({
        message: `Color must be one of: ${NOTE_COLORS.join(', ')}`,
      });
    }
    const result = await query(
      `INSERT INTO notes (user_id, title, content, color)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        req.user.id,
        title?.trim() || 'Untitled',
        content?.trim() || '',
        color || 'yellow',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const { title, content, color } = req.body;
    if (color && !NOTE_COLORS.includes(color)) {
      return res.status(400).json({
        message: `Color must be one of: ${NOTE_COLORS.join(', ')}`,
      });
    }

    const result = await query(
      `UPDATE notes SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         color = COALESCE($3, color)
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [
        title !== undefined ? (title?.trim() || 'Untitled') : null,
        content !== undefined ? content : null,
        color !== undefined ? color : null,
        id,
        req.user.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote, NOTE_COLORS };
